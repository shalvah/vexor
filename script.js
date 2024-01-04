
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

// todo interesting bug: in -ve quadrants, arrow head inverts
function arrowSvgPath(arrowTipX, arrowTipY) {
    let arrowHeadHeight = 10; // The arrow head is an isosceles triangle. This is the height of its normal.
    let arrowHeadOneSideWidth = arrowHeadHeight / 4; // We want the arrow head triangle to be half as wide as it's tall, so each side must be 1/4 the width.

    let theta = Math.atan(arrowTipY / arrowTipX); // Angle between arrow body line and horizontal
    let alpha = Math.PI / 2 - theta; // Angle between arrow head line (perpendicular to arrow body line) and horizontal

    let arrowHeadX = arrowTipX - (arrowHeadHeight * Math.cos(theta));
    let arrowHeadY = arrowTipY - (arrowHeadHeight * Math.sin(theta));

    let offsetX = arrowHeadOneSideWidth * Math.cos(alpha)
    let offsetY = arrowHeadOneSideWidth * Math.sin(alpha)

    let arrowHeadLeftX = arrowHeadX + offsetX;
    let arrowHeadLeftY = arrowHeadY - offsetY;

    let arrowHeadRightX = arrowHeadX - offsetX;
    let arrowHeadRightY = arrowHeadY + offsetY;

    return `M 0 0 L ${arrowHeadX} ${arrowHeadY} L ${arrowHeadLeftX} ${arrowHeadLeftY} L ${arrowTipX} ${arrowTipY} L ${arrowHeadRightX} ${arrowHeadRightY} L ${arrowHeadX} ${arrowHeadY}`;
}

function makeArrow(arrowTipX, arrowTipY, {colour} = {colour: 'green'}) {
    let arrowPath = arrowSvgPath(arrowTipX, arrowTipY);

    let line = interactive.path(arrowPath);
    line.style.fill = colour;
    line.style.strokeWidth = '2px';
    line.style.stroke = colour;

    return line;
}

function makeVector(destinationX, destinationY, {name, coordinates} = {}) {
    // Construct a control point at the the location (100, 100)
    let point = interactive.control(destinationX, destinationY);
    constrainPointToGrid(point);

    let arrow = makeArrow(destinationX, destinationY);

    arrow.addDependency(point);
    arrow.update = function () {
        let newArrowPath = arrowSvgPath(point.x, point.y);
        arrow.setAttribute('d', newArrowPath);
    }

    if (name || coordinates) {
        // let nameLabel = interactive.text(destinationX + 4, destinationY + 4, `<math display="block"><mi>${name}</mi></math>`);
        let text = (coordinates && name) ? `${name} (${point.x}, ${point.y})`
            : (coordinates ? `(${point.x}, ${point.y})` : `${name}`);
        let label = interactive.text(point.x + 6, point.y - 6, text);
        label.addDependency(point);
        label.update = function () {
            label.x = point.x + 6;
            label.y = point.y - 6;
            label.contents = (coordinates && name) ? `${name} (${point.x}, ${point.y})`
                : (coordinates ? `(${point.x}, ${point.y})` : `${name}`);
        }
    }

    return arrow;
}

function constrainPointToGrid(point) {
    point.constrainWithinBox(xAxis.x1, yAxis.y1, xAxis.x2, yAxis.y2)
}

makeVector(100, 200, {name: 'P', coordinates: true})

console.log(interactive);
