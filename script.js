import Svg from "./svg.mjs";

class Grid extends Svg {
  static AXIS_MARGIN = 32; // We add a small margin so we can insert number and axes labels

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
  }

  drawGridLines() {
    for (let x_i = this.minX; x_i <= this.maxX; x_i += 50) {
      if (x_i !== 0) {
        let verticalGridLine = this.#gridLine(x_i, this.minY, x_i, this.maxY, {});
        let label = this.text(x_i, 0, x_i, {
          textAnchor: 'middle',
          alignmentBaseline: 'hanging',
        });
      }
    }

    for (let y_i = this.minY; y_i <= this.maxY; y_i += 50) {
      if (y_i !== 0) {
        let horizontalGridLine = this.#gridLine(this.maxX, y_i, this.minX, y_i);
        let label = this.text(0, y_i, y_i, {
          textAnchor: 'end',
          alignmentBaseline: 'hanging',
        });
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
    if (x1 < -Grid.AXIS_MARGIN || y1 < -Grid.AXIS_MARGIN) {
      otherAttributes[`marker-start`] = `url(#${arrowHead.getAttribute('id')})`;
    }
    if (x2 > 0 || y2 > 0) {
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

  #fetchArrowHead() {
    return this._arrowHead || (this._arrowHead = this.makeArrowHead());
  }

  makeArrowHead(colour = 'black') {
    let arrowHead = this.marker(6, 3, 10, 10, {fill: colour}, {id: 'arrowhead', orient: 'auto-start-reverse'});
    arrowHead.path('M 0 0 L 6 3 L 0 6 Z');
    return arrowHead;
  }
}

let root = new Grid(`container`, {maxX: 300, maxY: 300, minX: 0, minY: 0});
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


import Interactive from "https://vectorjs.org/interactive.js";


/*


import Grid from "./svg.mjs";

// Construct an interactive within the HTML element with the id "my-interactive"
let gridWidth = 700;
let gridHeight = 500;
let grid = Grid.make("container", {
    width: gridWidth,
    height: gridHeight,
    border: true,
    originX: gridWidth / 2,
    originY: gridHeight / 2,
});

window.interactive = grid.interactive;

function makeArrow(arrowTipX, arrowTipY, {colour} = {colour: 'cornflowerblue'}) {
    let arrowHead = grid.makeArrowHead(colour);

    let line = interactive.line(0, 0, arrowTipX, arrowTipY);
    line.setAttribute('marker-end', `url(#${arrowHead.id})`)
    line.style.strokeWidth = '2px';
    line.style.stroke = colour;

    return line;
}

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
