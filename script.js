import Svg from "./svg.mjs";

class Grid extends Svg {
  static AXIS_MARGIN = 32; // Gap between axes and screen edges (useful to insert number labels and axes labels)
  static GAP_FROM_AXIS_LABEL_BOTTOM_TO_AXIS = 8; // Gap between number labels and x-axis
  static GAP_FROM_AXIS_LABEL_TOP_TO_AXIS = 20; // Gap between number labels and x-axis
  static GAP_FROM_AXIS_LABEL_END_TO_AXIS = 5; // Gap between number labels and y-axis

  constructor(domElementId, {maxX, maxY, minX, minY}, options = {}) {
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
    let styles = {overflow: 'visible', fontFamily: 'math, Verdana, Arial, Helvetica, sans-serif',};

    super(`svg`, domElementId, options, styles);
    this.maxX = maxX;
    this.maxY = maxY;
    this.minX = minX;
    this.minY = minY;

    this.gridId = Math.floor(Math.random() * 1000);

    this.setUpAxes();
    this.drawGridLines();
  }

  setUpAxes() {
    this.arrowHead = this.makeArrowHead();
    this.xAxis = this.#axis(
      {x: this.minX - Grid.AXIS_MARGIN, y: 0}, {x: this.maxX + Grid.AXIS_MARGIN, y: 0},
      {id: `x-axis-grid-${this.gridId}`}
    );
    this.yAxis = this.#axis(
      {x: 0, y: this.minY - Grid.AXIS_MARGIN}, {x: 0, y: this.maxY + Grid.AXIS_MARGIN},
      {id: `y-axis-grid-${this.gridId}`}
    );

    this.text({x: this.xAxis.getAttribute('x2'), y: Grid.AXIS_MARGIN / 2}, 'x', {
      textAnchor: 'end',
      fontStyle: 'italic',
      fontFamily: 'Times New Roman',
    });
    this.text({x: Grid.AXIS_MARGIN / 2, y: this.yAxis.getAttribute('y2')}, 'y', {
      textAnchor: 'end',
      fontStyle: 'italic',
      fontFamily: 'Times New Roman',
    });
  }

  drawGridLines() {
    let verticalGridLines = this.group({
      stroke: 'black',
      strokeWidth: '1px',
      strokeOpacity: '.2',
    });
    let verticalGridLineLabels = this.group({
      textAnchor: 'middle',
      alignmentBaseline: 'bottom',
    });
    for (let x_i = this.minX; x_i <= this.maxX; x_i += 50) {
      if (x_i !== 0) {
        verticalGridLines.line({x: x_i, y: this.minY}, {x: x_i, y: this.maxY});
        if (!this.hasNegativeQuadrant()) {
          // If there's no negative quadrant, we put the x-labels directly above the x-axis
          verticalGridLineLabels.text({x: x_i, y: -Grid.GAP_FROM_AXIS_LABEL_BOTTOM_TO_AXIS}, x_i);
        } else {
          // If there's a negative quadrant, we put the x-labels at the bottom of the grid
          verticalGridLineLabels.text({x: x_i, y: this.maxY + Grid.GAP_FROM_AXIS_LABEL_TOP_TO_AXIS}, x_i);
        }
      }
    }

    let horizontalGridLines = this.group({
      stroke: 'black',
      strokeWidth: '1px',
      strokeOpacity: '.2',
    });
    let horizontalGridLineLabels = this.group({
      textAnchor: 'end',
      alignmentBaseline: 'middle',
    });

    for (let y_i = this.minY; y_i <= this.maxY; y_i += 50) {
      if (y_i !== 0) {
        horizontalGridLines.line({x: this.maxX, y: y_i}, {x: this.minX, y: y_i});
        // If there's no negative quadrant, we put the y-labels directly to the left of the y-axis
        if (!this.hasNegativeQuadrant()) {
          horizontalGridLineLabels.text({x: -Grid.GAP_FROM_AXIS_LABEL_END_TO_AXIS, y: y_i}, y_i);
        } else {
          // If there's a negative quadrant, we put the y-labels all the way to the left.
          horizontalGridLineLabels.text({x: this.minX - Grid.GAP_FROM_AXIS_LABEL_END_TO_AXIS, y: y_i}, y_i);
        }
      }
    }
  }

  #axis(start, end, otherAttributes = {}) {
    let styles = {
      stroke: 'black',
      strokeWidth: '2px',
    }
    if (this.hasNegativeQuadrant()) {
      otherAttributes[`marker-start`] = `url(#${this.arrowHead.getAttribute('id')})`;
    }
    if (this.hasPositiveQuadrant()) {
      otherAttributes[`marker-end`] = `url(#${this.arrowHead.getAttribute('id')})`;
    }
    return this.line(start, end, styles, otherAttributes);
  }

  hasPositiveQuadrant() {
    return this.maxX > 0 || this.maxY > 0;
  }

  hasNegativeQuadrant() {
    return this.minX < 0 || this.minY < 0;
  }

  makeArrowHead() {
    let arrowHead = this.marker({width: 10, height: 10}, {}, {
      id: `axis-arrowhead-grid-${this.gridId}`, orient: 'auto-start-reverse',
      // 0,0 of the arrowhead is the end of the axis, so we must "translate" it
      refX: 6, refY: 3
    });
    arrowHead.path('M 0,0 L 6,3 L 0,6 Z');
    return arrowHead;
  }
}

let root = new Grid(`container`, {
  maxX: 300, maxY: 300,
  minX: 0, minY: 0
});
root.add(`path`,
  {d: `M 50,50 L 200,200`},
  {strokeWidth: `2px`, stroke: `green`}
);
root.add(`circle`,
  {cx: `150`, cy: `100`, r: `50`},
  {strokeWidth: `2px`, stroke: `red`, fill: 'none'}
)

/*


function makeVector(destinationX, destinationY, {name, coordinates} = {}) {
    // Construct a control point at the the location (100, 100)
    // let point = interactive.control(destinationX, destinationY);
    // constrainPointToGrid(point);

    let arrow = makeArrow(destinationX, destinationY);

    // Make the vectors draggable by adding a control (hide the point)
    let anchor = interactive.control(destinationX, destinationY);
    anchor.point.style.display = 'none';
    anchor.handle.style.cursor = 'pointer';
    arrow.addDependency(anchor);
    arrow.update = function () {
        arrow.x2 = anchor.x
        arrow.y2 = anchor.y
    }

    if (name || coordinates) {
        let label = makeReactiveElement('text', function () {
            this.x = arrow.x2 < 0 ? arrow.x2 - 6 : arrow.x2 + 6;
            this.y = arrow.y2 < 0 ? arrow.y2 - 6 : arrow.y2 + 6;
            this.contents = (coordinates && name) ?
                `<foreignObject x="${this.x}" y="${this.y}" width="160" height="160">
<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi>${name}</mi></mrow></math> (${arrow.x2}, ${arrow.y2})</foreignObject>`
                : (coordinates ? `(${arrow.x2}, ${arrow.y2})` : `${name}`);
        }, [anchor]);
    }

    return arrow;
}

function constrainPointToGrid(point) {
    point.constrainWithinBox(xAxis.x1, yAxis.y1, xAxis.x2, yAxis.y2)
}

function makeReactiveElement(kind, updaterFunction, dependencies) {
    let element = interactive[kind](0, 0, 0, 0, 0, 0);
    element.addDependency(...dependencies);
    element.update = updaterFunction;
    element.update();
    return element;
}

makeVector(100, 200, {name: 'P', coordinates: true})

console.log(interactive);
*/
