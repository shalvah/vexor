import Grid from "./grid.mjs";

let grid1 = new Grid(`container1`, {
  maxX: 300, maxY: 300,
  minX: 0, minY: 0,
  defaultStyles: {
    line: {
      strokeWidth: `2px`,
      stroke: `red`,
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

let vecA1 = grid1.vector('a', {x: 0, y: 0}, {x: 20, y: 100});

let vecB1 = grid1.vector('b', {x: 0, y: 0}, {x: 150, y: 150});

let vecAMinusB = grid1.vectorDifference(vecA1, vecB1,
  {
    styles: {stroke: `blue`},
    labelPosition: ({p1, p2}) => {
      let midPoint = {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2,
      };
      return {
        x: midPoint.x + 4, y: midPoint.y + 4,
      }
    },
    labelContent: (vector) => {
      return `|${vector.name}| ≈ ${Math.round(vector.length)}`;
    }
  }
);

let grid2 = new Grid(`container2`, {
  maxX: 300, maxY: 300,
  minX: 0, minY: 0,
  defaultStyles: {
    line: {
      strokeWidth: `2px`,
      stroke: `red`,
      fill: 'none'
    }
  }
});

let vecA2 = grid2.vector('a', {x: 0, y: 0}, {x: 20, y: 100});

let vecB2 = grid2.vector('b', {x: 0, y: 0}, {x: 150, y: 150});

let vecAPlusB = grid2.vectorSum(vecA2, vecB2,
  {
    styles: {stroke: `green`},
    labelPosition: ({p1, p2}) => {
      let midPoint = {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2,
      };
      return {
        x: midPoint.x + 4, y: midPoint.y + 4,
      }
    },
    labelContent: (vector) => {
      return `|${vector.name}| ≈ ${Math.round(vector.length)}`;
    }
  }
);

