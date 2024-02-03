
export let makeResizable = (svg, draggablePoint, attributesMap) => {
  let pointSvg = makePointDraggable(draggablePoint, svg);

  // Set the SVG to update its coordinates when the point is moved
  svg.anchorTo([pointSvg], () => {
    svg.updateAndNotify({
      [attributesMap.x]: pointSvg.get('cx'), [attributesMap.y]: pointSvg.get('cy'),
    });
  });
  return pointSvg;
}

function makePointDraggable({x, y}, svg) {
  let pointSvg = createDragHandleAtPoint({x, y}, svg);
  addDragEventListeners(pointSvg);
  return pointSvg;
}

function createDragHandleAtPoint({x, y}, svg) {
  let strokeColour = getComputedStyle(svg.$element).getPropertyValue('stroke');
  let pointSvg = svg.parentSvg.circle(
    {cx: x, cy: y, r: 6},
    {cursor: 'pointer', stroke: strokeColour, strokeWidth: '0.5px', fill: 'transparent'}
  );
  // TODO adding arbitrary properties not the best
  pointSvg.isDragging = false;
  return pointSvg;
}

function addDragEventListeners(pointSvg) {
  let startDrag = (event, pointSvg) => {
    pointSvg.isDragging = true;
    updatePointPosition(pointSvg, event);
  }
  let continueDrag = (event, pointSvg) => {
    if (pointSvg.isDragging) {
      updatePointPosition(pointSvg, event);
    }
  }
  let endDrag = (event, pointSvg) => {
    pointSvg.isDragging = false;
  }

  pointSvg.$element.addEventListener('pointerdown', (ev) => startDrag(ev, pointSvg));
  // Note: we must add the move listener to the surrounding element to support inertial (delayed) drag
  pointSvg.rootSvg.$element.addEventListener('pointermove', (ev) => continueDrag(ev, pointSvg));
  pointSvg.rootSvg.$element.addEventListener('pointerup', (ev) => endDrag(ev, pointSvg));
  pointSvg.rootSvg.$element.addEventListener('pointercancel', (ev) => endDrag(ev, pointSvg));
}

function updatePointPosition(pointSvg, event) {
  let pointRadius = pointSvg.get('r');
  let domRect = pointSvg.$element.getBoundingClientRect();
  let currentTopLeftPositionInDom = {
    x: domRect.x,
    y: domRect.y,
  };
  let desiredCentrePositionInDom = {x: event.x, y: event.y}
  let currentCentrePositionInGrid = {x: pointSvg.get('cx'), y: pointSvg.get('cy')}
  let currentTopLeftPositionInGrid = {
    x: currentCentrePositionInGrid.x - pointRadius,
    y: currentCentrePositionInGrid.y - pointRadius,
  }
  let offsets = {
    x: currentTopLeftPositionInDom.x - currentTopLeftPositionInGrid.x,
    y: currentTopLeftPositionInDom.y - currentTopLeftPositionInGrid.y,
  }

  // We snap to the nearest integer
  pointSvg.updateAndNotify({
    cx: Math.round(desiredCentrePositionInDom.x - offsets.x),
    cy: Math.round(desiredCentrePositionInDom.y - offsets.y),
  });
}
