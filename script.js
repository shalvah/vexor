import Interactive from "https://vectorjs.org/interactive.js";

// Construct an interactive within the HTML element with the id "my-interactive"
let width = 700;
let height = 500;
window.interactive = new Interactive("container", {
    width,
    height,
    border: true,
    originX: width / 2,
    originY: height / 2,
});
interactive.style.overflow = 'visible';

let xAxis = interactive.line(-interactive.width / 2, 0, interactive.width / 2, 0)
let yAxis = interactive.line(0, -interactive.height / 2, 0, interactive.height / 2)

function makeArrow(arrowTipX, arrowTipY, {colour} = {colour: 'cornflowerblue'}) {
    let arrowHead = interactive.marker(6, 3, 10, 10); // todo not sure exactly what these do
    arrowHead.style.fill = colour;
    arrowHead.path('M 0 0 L 6 3 L 0 6 Z');
    arrowHead.setAttribute('orient', 'auto-start-reverse');

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
        // let nameLabel = interactive.text(destinationX + 4, destinationY + 4, `<math display="block"><mi>${name}</mi></math>`);
        let label = makeReactiveElement('text', function () {
            this.x = arrow.x2 < 0 ? arrow.x2 - 6 : arrow.x2 + 6;
            this.y = arrow.y2 < 0 ? arrow.y2 - 6 : arrow.y2 + 6;
            this.contents = (coordinates && name) ? `${name} (${arrow.x2}, ${arrow.y2})`
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
