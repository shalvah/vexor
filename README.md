Thus far:
- `makeArrow`: draw a arrow to a point
- `makeVector`: draw a resizable vector using `makeArrow`, with name and coordinates shown
- grid shows y and x-axes lines
- grid has origin in center

todo:
- show points on the axes
- label the axes
- invert grid y-direction
- show grid lines
- snap to grid lines


Future:
- rename `addDependency` to `anchorTo`
- `addDependency` should take the update() function as a parameter, since update() is required. But maybe it's this way to allow having multiple sources of updates for the same update (?)
