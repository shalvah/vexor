import Svg from "./svg.mjs";
import {makeResizable} from "./make_resizable.mjs";
import {setAttributes} from "./utils.mjs";

class Grid extends Svg {
  static AXIS_MARGIN = 32; // Gap between axes and screen edges (useful to insert number labels and axes labels)
  static GAP_FROM_AXIS_LABEL_BOTTOM_TO_AXIS = 8; // Gap between number labels and x-axis
  static GAP_FROM_AXIS_LABEL_TOP_TO_AXIS = 20; // Gap between number labels and x-axis
  static GAP_FROM_AXIS_LABEL_END_TO_AXIS = 5; // Gap between number labels and y-axis

  constructor(domElementId, {maxX, maxY, minX, minY, defaultStyles}, options = {}) {
    minX = minX ?? -maxX;
    minY = minY ?? -maxY;
    options.width = Math.abs(maxX) + Math.abs(minX) + 2 * Grid.AXIS_MARGIN;
    options.height = Math.abs(maxY) + Math.abs(minY) + 2 * Grid.AXIS_MARGIN;
    // The viewBox actually does two things.
    // The first half of the viewBox sets the origin (0, 0) for the elements in this SVG.
    // If an SVG has viewBox -300,-300,0,0,
    // its top left corner (0,0) will start in the bottom right
    //
    // The second half of the viewBox scales this SVG's coordinates.
    // For instance, if an SVG has width and height of 300,300,
    // and viewBox of 0,0,600,600, a point with coordinates (300,300)
    // will be at half the width of the SVG.
    options.viewBox = `${minX - Grid.AXIS_MARGIN},${minY - Grid.AXIS_MARGIN} ${options.width},${options.height}`;
    let styles = {
      overflow: 'visible',
      userSelect: 'none',
      fontFamily: 'math, Verdana, Arial, Helvetica, sans-serif',
    };

    super(`svg`, domElementId, options, styles);
    this.maxX = maxX;
    this.maxY = maxY;
    this.minX = minX;
    this.minY = minY;

    this.gridId = this.randomInt();

    this.setUpAxes();
    this.drawGridLines();

    this.defaultStyles = defaultStyles;
  }

  vector(p1, p2, styles = {}, options = {}) {
    options = Object.assign({resizable: true, label: null}, options);

    const arrowHead = this.makeArrowHead(`vector-arrowhead-${this.randomInt()}`, {fill: styles.stroke});
    let attributes = {
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      'marker-end': `url(#${arrowHead.getAttribute('id')})`,
    }
    let line = this.line(attributes, {...(this.defaultStyles.line || {}), ...styles});
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

  differenceVector(a, b, styles, options) {
    styles = {"stroke-dasharray": "4", ...styles};
    let line = this.vector(a.p2, b.p2, styles, {...options, resizable: false});
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

  setUpAxes() {
    this.arrowHead = this.makeArrowHead(`axis-arrowhead-grid-${this.gridId}`);
    this.xAxis = this.#axis(
      {
        x1: this.minX - Grid.AXIS_MARGIN,
        y1: 0,
        x2: this.maxX + Grid.AXIS_MARGIN,
        y2: 0,
        id: `x-axis-grid-${this.gridId}`,
      }
    );
    this.yAxis = this.#axis(
      {
        x1: 0,
        y1: this.minY - Grid.AXIS_MARGIN,
        x2: 0,
        y2: this.maxY + Grid.AXIS_MARGIN,
        id: `y-axis-grid-${this.gridId}`,
      }
    );

    this.text('x',
      {
        x: this.xAxis.getAttribute('x2'), y: Grid.AXIS_MARGIN / 2
      },
      {
        textAnchor: 'end',
        fontStyle: 'italic',
        fontFamily: 'Times New Roman',
      });
    this.text('y',
      {
        x: Grid.AXIS_MARGIN / 2, y: this.yAxis.getAttribute('y2')
      },
      {
        textAnchor: 'end',
        fontStyle: 'italic',
        fontFamily: 'Times New Roman',
      });
  }

  drawGridLines() {
    let verticalGridLines = this.grouped({
      stroke: 'black',
      strokeWidth: '1px',
      strokeOpacity: '.2',
    });
    let verticalGridLineLabels = this.grouped({
      textAnchor: 'middle',
      alignmentBaseline: 'bottom',
    });
    for (let x_i = this.minX; x_i <= this.maxX; x_i += 50) {
      if (x_i !== 0) {
        verticalGridLines.line({x1: x_i, y1: this.minY, x2: x_i, y2: this.maxY});
        if (!this.hasNegativeQuadrant()) {
          // If there's no negative quadrant, we put the x-labels directly above the x-axis
          verticalGridLineLabels.text(`${x_i}`, {x: x_i, y: -Grid.GAP_FROM_AXIS_LABEL_BOTTOM_TO_AXIS});
        } else {
          // If there's a negative quadrant, we put the x-labels at the bottom of the grid
          verticalGridLineLabels.text(`${x_i}`, {x: x_i, y: this.maxY + Grid.GAP_FROM_AXIS_LABEL_TOP_TO_AXIS});
        }
      }
    }

    let horizontalGridLines = this.grouped({
      stroke: 'black',
      strokeWidth: '1px',
      strokeOpacity: '.2',
    });
    let horizontalGridLineLabels = this.grouped({
      textAnchor: 'end',
      alignmentBaseline: 'middle',
    });

    for (let y_i = this.minY; y_i <= this.maxY; y_i += 50) {
      if (y_i !== 0) {
        horizontalGridLines.line({x1: this.maxX, y1: y_i, x2: this.minX, y2: y_i});
        // If there's no negative quadrant, we put the y-labels directly to the left of the y-axis
        if (!this.hasNegativeQuadrant()) {
          horizontalGridLineLabels.text(`${y_i}`, {x: -Grid.GAP_FROM_AXIS_LABEL_END_TO_AXIS, y: y_i});
        } else {
          // If there's a negative quadrant, we put the y-labels all the way to the left.
          horizontalGridLineLabels.text(`${y_i}`, {x: this.minX - Grid.GAP_FROM_AXIS_LABEL_END_TO_AXIS, y: y_i});
        }
      }
    }
  }

  #axis(attributes = {}) {
    let styles = {
      stroke: 'black',
      strokeWidth: '2px',
    }
    if (this.hasNegativeQuadrant()) {
      attributes[`marker-start`] = `url(#${this.arrowHead.getAttribute('id')})`;
    }
    if (this.hasPositiveQuadrant()) {
      attributes[`marker-end`] = `url(#${this.arrowHead.getAttribute('id')})`;
    }
    return this.line(attributes, styles);
  }

  hasPositiveQuadrant() {
    return this.maxX > 0 || this.maxY > 0;
  }

  hasNegativeQuadrant() {
    return this.minX < 0 || this.minY < 0;
  }

  makeArrowHead(id, styles = {}) {
    let arrowHead = this.marker({
      fill: styles.fill,
      markerWidth: 6,
      markerHeight: 6,
      id,
      orient: 'auto-start-reverse',
      // 0,0 of the arrowhead is the end of the axis, so we must "translate" it
      refX: 5, refY: 2
    });

    // 0,4 - 4 determines the width of the arrow's base
    arrowHead.path({d: 'M 0,0 L 6,2 L 0,4 Z'});
    return arrowHead;
  }

  randomInt() {
    return Math.floor(Math.random() * 1000);
  }
}

export default Grid;
