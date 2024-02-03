
export let makeResizable = (svg, draggablePoint, attributesMap, resolution = 10) => {
  let pointSvg = makePointDraggable(draggablePoint, svg, resolution);

  // Set the SVG to update its coordinates when the point is moved
  svg.anchorTo([pointSvg], () => {
    svg.updateAndNotify({
      [attributesMap.x]: pointSvg.get('cx'), [attributesMap.y]: pointSvg.get('cy'),
    });
  });
  return pointSvg;
}

function makePointDraggable({x, y}, svg, resolution) {
  let pointSvg = createDragHandleAtPoint({x, y}, svg);
  // TODO adding arbitrary properties no good!
  pointSvg.resolution = resolution;
  addDragEventListeners(pointSvg);
  return pointSvg;
}

function createDragHandleAtPoint({x, y}, svg) {
  let strokeColour = getComputedStyle(svg.$element).getPropertyValue('stroke');
  let pointSvg = svg.parentSvg.circle(
    {cx: x, cy: y, r: 10},
    {cursor: 'pointer', stroke: strokeColour, strokeWidth: '0.5px', fill: 'transparent'}
  );
  // Disable browser touch events so that dragging works on touch screens
  svg.rootSvg.$element.style['touch-action'] = 'pinch-zoom';
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

  // We snap to the nearest integer, 10, 20, etc...
  const constrain = (value) => {
    return Math.round(value/pointSvg.resolution) * pointSvg.resolution;
  }
  pointSvg.updateAndNotify({
    cx: constrain(desiredCentrePositionInDom.x - offsets.x),
    cy: constrain(desiredCentrePositionInDom.y - offsets.y),
  });
}
