import Grid from "./grid.mjs";

let root = new Grid(`container`, {
  maxX: 300, maxY: 300,
  minX: 0, minY: 0
});
root.path(
  {d: `M 50,50 L 200,200`},
  {strokeWidth: `2px`, stroke: `green`}
);
root.circle(
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
