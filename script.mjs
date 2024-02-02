import Grid from "./grid.mjs";

let root = new Grid(`container`, {
  maxX: 300, maxY: 300,
  minX: 0, minY: 0,
  defaultStyles: {
    line: {
      strokeWidth: `2px`,
      stroke: `black`,
      fill: 'none'
    }
  }
});
// root.path(
//   {d: `M 50,50 L 200,200`},
//   {strokeWidth: `2px`, stroke: `green`}
// );
// root.circle(
//   {cx: `150`, cy: `100`, r: `50`},
//   {strokeWidth: `2px`, stroke: `red`, fill: 'none'}
// )
// root.draggableLine(
//   {x1: `150`, y1: `100`, x2: `50`, y2: `140`},
//   {strokeWidth: `2px`, stroke: `blue`, fill: 'none'}
// )

let vecA = root.vector({x: 0, y: 0}, {x: 20, y: 200},
  {strokeWidth: `2px`, stroke: `red`}, {
    labelPos: (line) => ({x: line.get('x2') + 4, y: line.get('y2') + 4}),
    labelFn: (p1, p2) => `a (${p2.x}, ${p2.y})`
  }
);

let vecB = root.vector({x: 0, y: 0}, {x: 150, y: 150},
  {strokeWidth: `2px`, stroke: `red`, }, {
    labelPos: (line) => ({x: line.get('x2') + 4, y: line.get('y2') + 4}),
    labelFn: (p1, p2) => `b (${p2.x}, ${p2.y})`
  }
);

let vecAMinusB = root.differenceVector(vecA, vecB,
  {strokeWidth: `2px`, stroke: `blue`},{
    labelPos: (line) => {
      let midPoint = {
        x: line.get('x1') + (Math.abs(line.get('x2')) - Math.abs(line.get('x1')))/2,
        y: line.get('y1') + (Math.abs(line.get('y2'))  - Math.abs(line.get('y1')))/2,
    };
      return {
        x: midPoint.x + 4,
        y: midPoint.y + 4,
      }
    },
    labelFn: (p1, p2) => {
      let norm = Math.sqrt(
        ((p2.x - p1.x)**2) + ((p2.y - p1.y)**2)
      );
      norm = Math.round(norm);
      return `|a - b| ≈ ${norm}`;
    }
  }
);

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
