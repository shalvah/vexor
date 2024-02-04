import {DragHandle} from "./DragHandle.mjs";

export let makeResizable = (svg, draggablePoint, attributesMap) => {
  let pointSvg = new DragHandle({forSvg: svg, at: draggablePoint}).pointSvg;

  // Set the SVG to update its coordinates when the point is moved
  svg.anchorTo([pointSvg], () => {
    svg.updateAndNotify({
      [attributesMap.x]: pointSvg.get('cx'), [attributesMap.y]: pointSvg.get('cy'),
    });
  });
  return pointSvg;
}

