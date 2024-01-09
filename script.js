import Svg from "./svg.mjs";

class Grid extends Svg {
  static AXIS_MARGIN = 32; // Gap between axes and screen edges (useful to insert number labels and axes labels)
  static GAP_FROM_AXIS_LABEL_BOTTOM_TO_AXIS = 10; // Gap between number labels and axis
  static GAP_FROM_AXIS_LABEL_TOP_TO_AXIS = 20; // Gap between number labels and axis

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

    super(`svg`, domElementId, options, {overflow: 'visible'});
    this.maxX = maxX;
    this.maxY = maxY;
    this.minX = minX;
    this.minY = minY;

    this.setUpAxes();
    this.drawGridLines();
  }

  setUpAxes() {
    this.xAxis = this.#axis(this.minX - Grid.AXIS_MARGIN, 0, this.maxX + Grid.AXIS_MARGIN, 0);
    this.yAxis = this.#axis(0, this.minY - Grid.AXIS_MARGIN, 0, this.maxY + Grid.AXIS_MARGIN);

    this.text(this.xAxis.getAttribute('x2'), Grid.AXIS_MARGIN / 2, 'x', {
      textAnchor: 'end',
      fontStyle: 'italic',
    });
    this.text(Grid.AXIS_MARGIN / 2, this.yAxis.getAttribute('y2'), 'y', {
      textAnchor: 'end',
      fontStyle: 'italic',
    });
  }

  drawGridLines() {
    for (let x_i = this.minX; x_i <= this.maxX; x_i += 50) {
      if (x_i !== 0) {
        let verticalGridLine = this.#gridLine(x_i, this.minY, x_i, this.maxY, {});
        if (!this.hasNegativeQuadrant()) {
          // If there's no negative quadrant, we put the x-labels directly above the x-axis
          let label = this.text(x_i, -Grid.GAP_FROM_AXIS_LABEL_BOTTOM_TO_AXIS, x_i, {
            textAnchor: 'middle',
            alignmentBaseline: 'bottom',
            fontFamily: 'math, Verdana, Arial, Helvetica, sans-serif',
          });
        } else {
          // If there's a negative quadrant, we put the x-labels at the bottom of the grid
          let label = this.text(x_i, this.maxY + Grid.GAP_FROM_AXIS_LABEL_TOP_TO_AXIS, x_i, {
            textAnchor: 'middle',
            fontFamily: 'math, Verdana, Arial, Helvetica, sans-serif',
            // alignment-baseline is ignored here, maybe because our positioning only depends on the gap from top
          });
        }
        // let label = this.foreignObject(x_i, 0,
        //   `<math xmlns="http://www.w3.org/1998/Math/MathML"><mrow><mi>${x_i}</mi></mrow></math>`,
        //   {}, {width: 40, height: 20});
      }
    }

    for (let y_i = this.minY; y_i <= this.maxY; y_i += 50) {
      if (y_i !== 0) {
        let horizontalGridLine = this.#gridLine(this.maxX, y_i, this.minX, y_i);
        // If there's no negative quadrant, we put the y-labels directly to the left of the y-axis
        if (!this.hasNegativeQuadrant()) {
          let label = this.text(-Grid.GAP_FROM_AXIS_LABEL_BOTTOM_TO_AXIS, y_i, y_i, {
            textAnchor: 'end',
            alignmentBaseline: 'middle',
            fontFamily: 'math, Verdana, Arial, Helvetica, sans-serif',
          });
        } else {
          // If there's a negative quadrant, we put the y-labels all the way to the left.
          let label = this.text(this.minX - Grid.GAP_FROM_AXIS_LABEL_BOTTOM_TO_AXIS, y_i, y_i, {
            textAnchor: 'end',
            alignmentBaseline: 'middle',
            fontFamily: 'math, Verdana, Arial, Helvetica, sans-serif',
          });
        }
      }
    }
  }

  #axis(x1, y1, x2, y2, styles = {}, otherAttributes = {}) {
    let arrowHead = this.#fetchArrowHead();
    styles = {
      ...styles,
      stroke: 'black',
      strokeWidth: '2px',
    }
    if (this.hasNegativeQuadrant()) {
      otherAttributes[`marker-start`] = `url(#${arrowHead.getAttribute('id')})`;
    }
    if (this.hasPositiveQuadrant()) {
      otherAttributes[`marker-end`] = `url(#${arrowHead.getAttribute('id')})`;
    }
    return this.line(x1, y1, x2, y2, styles, otherAttributes);
  }

  #gridLine(x1, y1, x2, y2, styles = {}, otherAttributes = {}) {
    styles.stroke = 'black';
    styles.strokeWidth = '1px';
    styles.strokeOpacity = '.2';
    return super.line(x1, y1, x2, y2, styles, otherAttributes);
  }

  hasPositiveQuadrant() {
    return this.maxX > 0 || this.maxY > 0;
  }

  hasNegativeQuadrant() {
    return this.minX < 0 || this.minY < 0;
  }

  #fetchArrowHead() {
    return this._arrowHead || (this._arrowHead = this.makeArrowHead());
  }

  makeArrowHead() {
    let arrowHead = this.marker(6, 3, 10, 10, {fill: 'currentColor'}, {id: 'arrowhead', orient: 'auto-start-reverse'});
    arrowHead.path('M 0 0 L 6 3 L 0 6 Z');
    return arrowHead;
  }
}

let root = new Grid(`container`, {
  maxX: 300, maxY: 300,
 // minX: 0, minY: 0
});
root.add(`path`,
  {d: `M 50,50 L 200,200`},
  {strokeWidth: `2px`, stroke: `green`}
);
root.add(`circle`,
  {cx: `150`, cy: `100`, r: `50`},
  {strokeWidth: `2px`, stroke: `cornflowerblue`, fill: 'none'}
)

root.marker(6, 3, 10, 10, {fill: 'green'}, {orient: 'auto-start-reverse'})
  .path('M 0 0 L 6 3 L 0 6 Z');


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
