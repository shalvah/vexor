import {randomInt} from "./utils/maths.mjs";
import {makeResizable} from "./make_resizable.mjs";

const LABEL_POSITIONS = {
  tip: ({from, to}) => {
    return {
      x: (to.x >= 0) ? to.x + 4 : to.x - 4,
      y: (to.y >= 0) ? to.y + 4 : to.y - 4,
    };
  },
  midPoint: ({from, to}) => {
    let midPoint = {
      x: from.x + (to.x - from.x) / 2,
      y: from.y + (to.y - from.y) / 2,
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

  constructor(name, location, grid, options) {
    super();

    this.name = this.stylizedName(name); // Every vector has a name...
    this.grid = grid; // ...and is located on a grid (instance of Grid)

    options = {...Vector.defaultOptions, ...options};

    this.artist = grid.grouped(); // The "artist" is the current painter (Svg)

    let initialLocation = location;
    if (typeof location == "function") {
      this.positionComputer = location;
      initialLocation = location.call();
    } else {
      if (initialLocation.from === undefined) {
        initialLocation.from = {x: 0, y: 0}
      }
    }
    this.#makeLine(initialLocation.from, initialLocation.to, options.styles);

    if (options.resizable) {
      // TODO This (and its usages) assume dragging at the tip (to) only
      this.dragPointSvg = makeResizable(
        this.line, initialLocation.to, {x: 'x2', y: 'y2'},
        options.allowedIncrementSize || 10
      );
    }

    if (options.label) {
      this.#makeLabel(initialLocation.from, initialLocation.to, options);
    }

    if (options.anchorTo) {
      this.addAnchors(options.anchorTo);
    }
  }

  get from() {
    return {
      x: this.line.get('x1'), y: this.line.get('y1')
    }
  }

  get to() {
    return {
      x: this.line.get('x2'), y: this.line.get('y2')
    }
  }

  get length() {
    return Math.sqrt(((this.to.x - this.from.x) ** 2) + ((this.to.y - this.from.y) ** 2));
  }

  coordinatesTuple() {
    return `(${this.to.x}, ${this.to.y})`
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
      let {from, to} = this.positionComputer.call();
      this.line.updateAndNotify({
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
      });
    });
  }

  mirror(otherVector) {
    this.anchorTo(otherVector, () => {
      this.dragPointSvg.updateAndNotify({
        cx: otherVector.to.x,
        cy: otherVector.to.y,
      });
    });
    otherVector.anchorTo(this, () => {
      otherVector.dragPointSvg.updateAndNotify({
        cx: this.to.x,
        cy: this.to.y,
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

  #makeLine(from, to, styles) {
    let arrowHead = this.artist.arrowHead(`vector-arrowhead-${randomInt()}`, {fill: styles.stroke});

    let lineAttributes = {
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      'marker-end': `url(#${arrowHead.getAttribute('id')})`,
    }
    this.line = this.artist.line(lineAttributes, styles);
    // Bubble up events
    this.#bubbleUpUpdates(this.line)

  }

  #makeLabel(from, to, options) {
    let labelAttributes = options.labelPosition.call(null, this);
    this.label = this.artist.text(options.labelContent.call(null, this), labelAttributes);

    this.label.anchorTo(this.line, () => {
      this.label.setPosition(options.labelPosition.call(null, this));
      this.label.setContent(options.labelContent.call(null, this));
    });
  }

  dot(vec2) {
    return (this.to.x * vec2.to.x) + (this.to.y * vec2.to.y);
  }

  manhattanDistance(vec2) {
    return Math.abs(this.to.x - vec2.to.x) + Math.abs(this.to.y - vec2.to.y);
  }

  euclideanDistance(vec2) {
    return Math.sqrt((this.to.x - vec2.to.x) ** 2 + (this.to.y - vec2.to.y) ** 2);
  }
}

Vector.LABEL_POSITIONS = LABEL_POSITIONS;
