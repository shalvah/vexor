import {randomInt, setAttributes} from "./utils.mjs";
import {makeResizable} from "./make_resizable.mjs";

export default class Vector extends EventTarget {
  static defaultOptions = {
    resizable: true,
    label: true,
    labelPosition: ({p1, p2}) => ({x: p2.x + 4, y: p2.y + 4}),
    labelContent: (vector) => `${vector.name} ${vector.coordinatesTuple()}`,
  };

  constructor(name, p1, p2, grid, options) {
    super();

    this.name = this.stylizedName(name); // Every vector has a name...
    this.grid = grid; // ...and is located on a grid (instance of Grid)

    options = {...Vector.defaultOptions, ...options};

    this.artist = grid.grouped(); // The "artist" is the current painter (Svg)

    let [initialP1, initialP2] = [p1, p2];
    if(typeof p1 === "function") {
      initialP1 = p1.call();
    }
    if(typeof p2 === "function") {
      initialP2 = p2.call();
    }
    this.#makeLine(initialP1, initialP2, options.styles);

    if (options.resizable) {
      makeResizable(this.line, p2, {x: 'x2', y: 'y2'});
    }

    if (options.label) {
      this.#makeLabel(initialP1, initialP2, options);
    }

    if (options.anchorTo) {
      let dependencies = options.anchorTo;

      this.line.anchorTo(dependencies, () => {
        let [newP1, newP2] = [p1.call(), p2.call()];
        this.line.updateAndNotify({
          x1: newP1.x,
          y1: newP1.y,
          x2: newP2.x,
          y2: newP2.y,
        });
      });
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
