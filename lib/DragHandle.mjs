import {round} from "./utils/maths.mjs";

export class DragHandle {
  constructor({forSvg, at, allowedIncrementSize}) {
    this.isDragging = false;
    this.svgToBeDragged = forSvg;
    this.dragHandleLocation = at;
    this.allowedIncrementSize = allowedIncrementSize;

    this.pointSvg = this.drawPoint();
    this.addDragEventListeners();
  }

  drawPoint() {
    let strokeColour = getComputedStyle(this.svgToBeDragged.$element).getPropertyValue('stroke');
    let pointSvg = this.svgToBeDragged.parentSvg.circle(
      {cx: this.dragHandleLocation.x, cy: this.dragHandleLocation.y, r: 10},
      {cursor: 'pointer', stroke: strokeColour, strokeWidth: '0.5px', fill: 'transparent'}
    );
    // Disable browser touch events so that dragging works on touch screens
    pointSvg.rootSvg.$element.style['touch-action'] = 'pinch-zoom';
    return pointSvg;
  }

  addDragEventListeners() {
    let startDrag = (event) => {
      this.isDragging = true;
      this.updatePointPosition(event);
    }
    let continueDrag = (event) => {
      if (this.isDragging) {
        this.updatePointPosition(event);
      }
    }
    let endDrag = (event) => {
      this.isDragging = false;
    }

    this.pointSvg.$element.addEventListener('pointerdown', startDrag);
    // Note: we must add the other listeners to the surrounding element to support inertial (delayed) drag
    this.pointSvg.rootSvg.$element.addEventListener('pointermove', continueDrag);
    this.pointSvg.rootSvg.$element.addEventListener('pointerup', endDrag);
    this.pointSvg.rootSvg.$element.addEventListener('pointercancel', endDrag);
  }

  updatePointPosition(event) {
    let pointRadius = this.pointSvg.get('r');
    let domRect = this.pointSvg.$element.getBoundingClientRect();
    let currentTopLeftPositionInDom = {
      x: domRect.x,
      y: domRect.y,
    };
    let desiredCentrePositionInDom = {x: event.x, y: event.y}
    let currentCentrePositionInGrid = {x: this.pointSvg.get('cx'), y: this.pointSvg.get('cy')}
    let currentTopLeftPositionInGrid = {
      x: currentCentrePositionInGrid.x - pointRadius,
      y: currentCentrePositionInGrid.y - pointRadius,
    }
    let offsets = {
      x: currentTopLeftPositionInDom.x - currentTopLeftPositionInGrid.x,
      y: currentTopLeftPositionInDom.y - currentTopLeftPositionInGrid.y,
    }

    // We snap to the nearest integer, 10, 20, etc...
    this.pointSvg.updateAndNotify({
      cx: round(desiredCentrePositionInDom.x - offsets.x, this.allowedIncrementSize),
      cy: round(desiredCentrePositionInDom.y - offsets.y, this.allowedIncrementSize),
    });
  }
}
