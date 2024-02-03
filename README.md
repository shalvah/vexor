Rough library for visualizing 2D vectors (linear algebra), inspired by [Vector.js](https://vectorjs.org).


Goal: simple diagrams of interactive 2D vectors on a Cartesian grid


Current abilities:
- Graph and style 2D vectors
- Resize vectors via mouse or touch (although touch support is janky)
- Vector labels auto-update
- Easily add sum and difference vectors (which also auto-update)
- "Mirror" vectors across grids

See [demo](http://shalvah.me/vex). Example usage:

```js
let grid = new Grid(`container`, {
  maxX: 200, maxY: 200,
  minX: -200, minY: -200,
  defaultStyles: {
    line: {
      strokeWidth: `2px`,
      stroke: `red`,
    }
  }
});

let vecA = grid.vector('a', {
  p1: {x: 0, y: 0}, 
  p2: {x: 20, y: 100} 
});

let vecB = grid.vector('b', {
  p1: {x: 0, y: 0}, 
  p2: {x: 150, y: 150} }
);

let vecAMinusB = grid.vectorDifference(vecA, vecB,
  {
    styles: {stroke: `blue`},
    labelPosition: Vector.LABEL_POSITIONS.midPoint,
    labelContent: vector => `|${vector.name}| ≈ ${Math.round(vector.length)}`
  }
);
let vecAPlusB = grid.vectorSum(vecA, vecB,
  {
    styles: {stroke: `green`},
    labelPosition: Vector.LABEL_POSITIONS.midPoint,
    labelContent: vector => `|${vector.name}| ≈ ${Math.round(vector.length)}`
  }
);
```

Motivation: 
- Demonstrating vectors for articles (eg https://blog.shalvah.me/posts/learn-svg-by-drawing-an-arrow)
- Visualizing School work

Inspirations:
- https://vectorjs.org/
- https://www.petercollingridge.co.uk/tools/interactivesvgjs/
- https://github.com/ksassnowski/vueclid (to which I'll probably switch)
