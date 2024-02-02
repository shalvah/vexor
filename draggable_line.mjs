import { setStyles, setAttributes } from "./utils.mjs"

export default class DraggableLine {
  /**
   *
   * @param attributes
   * @param styles
   * @param {Svg} svg
   */
  constructor(attributes, styles = {}, svg) {
    this.svg = svg;

    let group = svg.grouped(styles);
    // First, draw the line
    this.line = group.line(attributes);

    // Next, create dragging handles at its two endpoints,
    // and set them to update as they're dragged
    let endpointCoordinates = [
      {x: attributes.x1, y: attributes.y1},
      {x: attributes.x2, y: attributes.y2},
    ];
    let endpoints = endpointCoordinates.map(point => {
      let pointSvg = this.createDragHandleAtPoint(point, group, styles);
      this.addDragEventListeners(pointSvg);
      return pointSvg;
    });

    // Finally, set the line to update whenever any of its endpoints is updated
    this.line.anchorTo(endpoints, () => {
      setAttributes(this.line, {
        x1: endpoints[0].get('cx'), y1: endpoints[0].get('cy'),
        x2: endpoints[1].get('cx'), y2: endpoints[1].get('cy'),
      });
    });
  }

  createDragHandleAtPoint({ x, y }, svg, styles) {
    let pointSvg = svg.circle(
      {cx: x, cy: y, r: 2},
      {cursor: 'pointer', fill: styles.stroke}
    );
    pointSvg.isDragging = false;
    return pointSvg;
  }

  addDragEventListeners(pointSvg) {
    let startDrag = (event, pointSvg) => {
      pointSvg.isDragging = true;
      this.updatePointPosition(pointSvg, event);
    }
    let continueDrag = (event, pointSvg) => {
      if (pointSvg.isDragging) {
        this.updatePointPosition(pointSvg, event);
      }
    }
    let endDrag = (event, pointSvg) => {
      pointSvg.isDragging = false;
    }

    pointSvg.$element.addEventListener('pointerdown', (ev) => startDrag(ev, pointSvg));
    // Note: we must add the move listener to the surrounding element to support inertial (delayed) drag
    this.svg.$element.addEventListener('pointermove', (ev) => continueDrag(ev, pointSvg));
    pointSvg.$element.addEventListener('pointerup', (ev) => endDrag(ev, pointSvg));
    pointSvg.$element.addEventListener('pointercancel', (ev) => endDrag(ev, pointSvg));
  }

  updatePointPosition(pointSvg, event) {
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
    pointSvg.updateAndNotify({
      cx: desiredCentrePositionInDom.x - offsets.x,
      cy: desiredCentrePositionInDom.y - offsets.y,
    });
  }
}
