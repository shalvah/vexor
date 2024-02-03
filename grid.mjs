import Svg from "./svg.mjs";
import {randomInt, setAttributes} from "./utils.mjs";
import Vector from "./vector.mjs";
import Text from "./svgs/text.mjs";

class Grid extends Svg {
  static AXIS_MARGIN = 32; // Gap between axes and screen edges (useful to insert number labels and axes labels)
  static GAP_FROM_AXIS_LABEL_BOTTOM_TO_AXIS = 8; // Gap between number labels and x-axis
  static GAP_FROM_AXIS_LABEL_TOP_TO_AXIS = 20; // Gap between number labels and x-axis
  static GAP_FROM_AXIS_LABEL_END_TO_AXIS = 5; // Gap between number labels and y-axis

  #axisArrowHead;

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

    this.gridId = randomInt();

    this.setUpAxes();
    this.drawGridLines();

    this.defaultStyles = defaultStyles;
  }

  vector(p1, p2, options = {}) {
    options.styles = {...this.defaultStyles.line, ...options.styles};
    return new Vector(p1, p2, this, options);
  }

  differenceVector(a, b, options) {
    options.styles = {"stroke-dasharray": "4", ...(options.styles || {})};
    return this.vector(
      () => a.p2,
      () => b.p2,
      {...options, resizable: false, anchorTo: [a, b]}
    );
  }

  setUpAxes() {
    this.#axisArrowHead = this.arrowHead(`axis-arrowhead-grid-${this.gridId}`);
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
      attributes[`marker-start`] = `url(#${this.#axisArrowHead.getAttribute('id')})`;
    }
    if (this.hasPositiveQuadrant()) {
      attributes[`marker-end`] = `url(#${this.#axisArrowHead.getAttribute('id')})`;
    }
    return this.line(attributes, styles);
  }

  hasPositiveQuadrant() {
    return this.maxX > 0 || this.maxY > 0;
  }

  hasNegativeQuadrant() {
    return this.minX < 0 || this.minY < 0;
  }
}

export default Grid;
