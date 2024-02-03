import {makeResizable} from "./make_resizable.mjs";
import {setAttributes} from "./utils.mjs";

class VectorManager {
  makeVector(p1, p2, options = {}) {
    options = Object.assign({styles: {}, resizable: true, label: null}, options);
    let styles = {...(this.defaultStyles.line || {}), ...options.styles};

    const arrowHead = this.makeArrowHead(`vector-arrowhead-${this.randomInt()}`, {fill: styles.stroke});
    let attributes = {
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      'marker-end': `url(#${arrowHead.getAttribute('id')})`,
    }
    let line = this.line(attributes, styles);
    // TODO adding arbitrary properties not the best
    line.p1 = p1;
    line.p2 = p2;
    if (options.resizable) {
      makeResizable(line, p2, {x: 'x2', y: 'y2'});
    }
    if (options.labelPos) {
      let labelAttributes = options.labelPos.call(null, line);
      let label = this.text(options.labelFn.call(null, p1, p2), labelAttributes);
      label.anchorTo(line, () => {
        let newP1 = { x: line.get('x1'), y: line.get('y1') };
        let newP2 = { x: line.get('x2'), y: line.get('y2') };
        setAttributes(label.$element, options.labelPos.call(null, line));
        label.$element.innerHTML = options.labelFn.call(null, newP1, newP2);
      });
    }

    return line;
  }

  differenceVector(a, b, options) {
    options.styles = {"stroke-dasharray": "4", ...(options.styles || {})};
    let line = this.vector(a.p2, b.p2, {...options, resizable: false});
    line.anchorTo([a, b], () => {
      // TODO better to update the wrapping class, rather than the DOM element directly
      line.updateAndNotify({
        x1: a.get(`x2`),
        y1: a.get(`y2`),
        x2: b.get(`x2`),
        y2: b.get(`y2`),
      });
    });
    return line;
  }
}
