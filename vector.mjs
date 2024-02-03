import {randomInt} from "./utils.mjs";
import {makeResizable} from "./make_resizable.mjs";

const LABEL_POSITIONS = {
  tip: ({p1, p2}) => {
    return {
      x: (p2.x >= 0) ? p2.x + 4 : p2.x - 4,
      y: (p2.y >= 0) ? p2.y + 4 : p2.y - 4,
    };
  },
  midPoint: ({p1, p2}) => {
    let midPoint = {
      x: p1.x + (p2.x - p1.x) / 2,
      y: p1.y + (p2.y - p1.y) / 2,
    };
    return {
      x: midPoint.x + 6, y: midPoint.y + 6,
    }
  },
};

export default class Vector extends EventTarget {
  static defaultOptions = {
    resizable: true,
    label: true,
    labelPosition: LABEL_POSITIONS.tip,
    labelContent: (vector) => `${vector.name} ${vector.coordinatesTuple()}`,
  };

  constructor(name, position, grid, options) {
    super();

    this.name = this.stylizedName(name); // Every vector has a name...
    this.grid = grid; // ...and is located on a grid (instance of Grid)

    options = {...Vector.defaultOptions, ...options};

    this.artist = grid.grouped(); // The "artist" is the current painter (Svg)

    let initialPosition = position;
    if (typeof position == "function") {
      this.positionComputer = position;
      initialPosition = position.call();
    } else {
      if (initialPosition.p1 === undefined) {
        initialPosition.p1 = {x: 0, y: 0}
      }
    }
    this.#makeLine(initialPosition.p1, initialPosition.p2, options.styles);

    if (options.resizable) {
      // TODO This (and its usages) assume dragging at the tip only
      this.dragHandle = makeResizable(this.line, initialPosition.p2, {x: 'x2', y: 'y2'}, options.resolution || 10);
    }

    if (options.label) {
      this.#makeLabel(initialPosition.p1, initialPosition.p2, options);
    }

    if (options.anchorTo) {
      this.addAnchors(options.anchorTo);
    }
  }

  get p1() {
    return {
      x: this.line.get('x1'), y: this.line.get('y1')
    }
  }

  get p2() {
    return {
      x: this.line.get('x2'), y: this.line.get('y2')
    }
  }

  get length() {
    return Math.sqrt(((this.p2.x - this.p1.x) ** 2) + ((this.p2.y - this.p1.y) ** 2));
  }

  coordinatesTuple() {
    return `(${this.p2.x}, ${this.p2.y})`
  }

  stylizedName(name) {
    if (name.length === 1) {
      let codePoint = name.codePointAt(0);
      // Convert A-Z to the corresponding italic Unicode math character
      if (codePoint >= 97 && codePoint <= 122) {
        return String.fromCodePoint(codePoint + 119789);
      }
      if (codePoint >= 65 && codePoint <= 90) {
        return String.fromCodePoint(codePoint + 119795);
      }
    }

    return name;
  }

  addAnchors(dependencies) {
    this.line.anchorTo(dependencies, () => {
      let {p1, p2} = this.positionComputer.call();
      this.line.updateAndNotify({
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
      });
    });
  }

  mirror(otherVector) {
    this.anchorTo(otherVector, () => {
      this.dragHandle.updateAndNotify({
        cx: otherVector.p2.x,
        cy: otherVector.p2.y,
      });
    });
    otherVector.anchorTo(this, () => {
      otherVector.dragHandle.updateAndNotify({
        cx: this.p2.x,
        cy: this.p2.y,
      });
    });
  }

  anchorTo(...args) {
    this.line.anchorTo(...args)
  }

  #bubbleUpUpdates(element) {
    element.addEventListener('updated', (event) => this.dispatchEvent(
      new CustomEvent("updated", {
        detail: event.detail
      }))
    );
  }

  #makeLine(p1, p2, styles) {
    let arrowHead = this.artist.arrowHead(`vector-arrowhead-${randomInt()}`, {fill: styles.stroke});

    let lineAttributes = {
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      'marker-end': `url(#${arrowHead.getAttribute('id')})`,
    }
    this.line = this.artist.line(lineAttributes, styles);
    // Bubble up events
    this.#bubbleUpUpdates(this.line)

  }

  #makeLabel(p1, p2, options) {
    let labelAttributes = options.labelPosition.call(null, this);
    this.label = this.artist.text(options.labelContent.call(null, this), labelAttributes);

    this.label.anchorTo(this.line, () => {
      this.label.setPosition(options.labelPosition.call(null, this));
      this.label.setContent(options.labelContent.call(null, this));
    });
  }
}

Vector.LABEL_POSITIONS = LABEL_POSITIONS;
