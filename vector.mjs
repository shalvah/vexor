import {randomInt, setAttributes} from "./utils.mjs";
import {makeResizable} from "./make_resizable.mjs";

export default class Vector extends EventTarget {
  static defaultOptions = {
    resizable: true,
    label: true,
    labelPosition: (p1, p2) => ({x: p2.x + 4, y: p2.y + 4}),
    labelContent: (p1, p2) => `(${p2.x}, ${p2.y})`
  };

  constructor(p1, p2, grid, options) {
    super();

    this.grid = grid; // ...Every vector is located on a grid (instance of Grid)

    options = {...Vector.defaultOptions, ...options};

    this.artist = grid.grouped(); // The "artist" is the current painter (Svg)

    let [initialP1, initialP2] = [p1, p2];
    if(typeof p1 === "function") {
      initialP1 = p1.call();
    }
    if(typeof p2 === "function") {
      initialP2 = p2.call();
    }
    this.makeLine(initialP1, initialP2, options.styles);

    if (options.resizable) {
      makeResizable(this.line, p2, {x: 'x2', y: 'y2'});
    }

    if (options.label) {
      this.makeLabel(initialP1, initialP2, options);
    }

    if(options.anchorTo) {
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

  makeLine(p1, p2, styles) {
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
    this.bubbleUpUpdates(this.line)

  }

  makeLabel(p1, p2, options) {
    let labelAttributes = options.labelPosition.call(null, p1, p2);
    this.label = this.artist.text(options.labelContent.call(null, p1, p2), labelAttributes);

    this.label.anchorTo(this.line, () => {
      let newP1 = this.p1;
      let newP2 = this.p2;

      this.label.setPosition(options.labelPosition.call(null, newP1, newP2));
      this.label.setContent(options.labelContent.call(null, newP1, newP2));
    });
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

  anchorTo(...args) {
    this.line.anchorTo(...args)
  }

  bubbleUpUpdates(element) {
    element.addEventListener('updated', (event) => this.dispatchEvent(
      new CustomEvent("updated", {
        detail: event.detail
      }))
    );
  }
}
