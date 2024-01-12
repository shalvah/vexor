let setStyles = ($element, styles = {}) => {
    Object.entries(styles).forEach(([k, v]) => {
        $element.style[k] = v;
    });
    return $element;
}

let setAttributes = ($element, attributes = {}) => {
    Object.entries(attributes).forEach(([k, v]) => {
        $element.setAttribute(k, v);
    });
    return $element;
}

class Svg extends EventTarget {
    static NAMESPACE_URI = 'http://www.w3.org/2000/svg';

    constructor(elementType, parentDomElementOrId, attributes = {}, styles = {}) {
        super()

        if (elementType === 'svg') {
            attributes = {
                ...attributes,
                xmlns: Svg.NAMESPACE_URI,
            }
        }
        this.elementType = elementType;
        this.$element = document.createElementNS(Svg.NAMESPACE_URI, elementType);
        setAttributes(this.$element, attributes);
        setStyles(this.$element, styles);

        let parentDomElement = (typeof parentDomElementOrId == 'string') ?
          document.querySelector(`#${parentDomElementOrId}`) : parentDomElementOrId;

        parentDomElement.appendChild(this.$element);
    }

    add(elementType, attributes = {}, styles = {}) {
        return new Svg(elementType, this.$element, attributes, styles);
    }

    line(attributes, styles = {}) {
        return this.add(`line`, attributes, styles);
    }

    anchorTo(svgElements, updateFn) {
        svgElements.forEach(el => {
            el.addEventListener('attributes_changed', updateFn);
        });
    }

    updateAttributes(attributes) {
        setAttributes(this, attributes);
        this.dispatchEvent(new CustomEvent("attributes_changed", {
            detail: attributes
        }));
    }

    draggableLine(attributes, styles = {}) {
        let group = this.grouped(styles);
        let line = group.line(attributes);
        let pointCoordinates = [
          {x: attributes.x1, y: attributes.y1},
          {x: attributes.x2, y: attributes.y2},
        ];

        let isDragging = false

        function computePointPosition(pointSvg, event) {
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
            pointSvg.updateAttributes({
                cx: desiredCentrePositionInDom.x - offsets.x,
                cy: desiredCentrePositionInDom.y - offsets.y,
            });
        }

        let startDrag = (event, pointSvg) => {
            isDragging = true;
            computePointPosition(pointSvg, event);
        }
        let continueDrag = (event, pointSvg) => {
            if (isDragging) {
                computePointPosition(pointSvg, event);
            }
        }
        let endDrag = (event, pointSvg) => {
            isDragging = false;
        }

        let points = pointCoordinates.map(p => {
            let pointSvg = group.circle(
              {cx: p.x, cy: p.y, r: 5},
              {cursor: 'pointer', fill: styles.stroke}
            );
            pointSvg.$element.addEventListener('mousedown', (ev) => startDrag(ev, pointSvg));
            pointSvg.$element.addEventListener('mousemove', (ev) => continueDrag(ev, pointSvg));
            pointSvg.$element.addEventListener('mouseup', (ev) => endDrag(ev, pointSvg));
            pointSvg.$element.addEventListener('mouseleave', (ev) => endDrag(ev, pointSvg));
            // pointSvg.$element.addEventListener('touchstart', (ev) => (ev.preventDefault(), startDrag(ev, pointSvg)));
            // pointSvg.$element.addEventListener('touchmove', (ev) => (ev.preventDefault(), continueDrag(ev, pointSvg)));
            // pointSvg.$element.addEventListener('touchend', (ev) => (ev.preventDefault(), endDrag(ev, pointSvg)));
            // pointSvg.$element.addEventListener('touchcancel', (ev) => (ev.preventDefault(), endDrag(ev, pointSvg)));

            return pointSvg;
        });

        line.anchorTo(points, () => {
            setAttributes(line, {
                x1: points[0].get('cx'), y1: points[0].get('cy'),
                x2: points[1].get('cx'), y2: points[1].get('cy'),
            });
        });
        return line;
    }

    circle(attributes, styles = {}) {
        return this.add(`circle`, attributes, styles);
    }

    text(content, attributes, styles = {}) {
        const text = this.add(`text`, attributes, styles);
        text.$element.innerHTML = content;
        return text;
    }

    foreignObject(content, attributes = {}, styles = {}) {
        const foreignObject = this.add(`foreignObject`, attributes, styles);
        foreignObject.$element.innerHTML = content;
        return foreignObject;
    }

    marker(attributes, styles = {}) {
        return this.add(`marker`, attributes, styles);
    }

    path(attributes, styles = {}) {
        return this.add(`path`, attributes, styles);
    }

    grouped(styles = {}) {
        return this.add(`g`, {}, styles);
    }

    setAttribute(attribute, value) {
        return this.$element.setAttribute(attribute, value);
    }

    getAttribute(attribute) {
        return this.$element.getAttribute(attribute);
    }

    // Shortcut to get coordinate
    get(attribute) {
        return Number(this.$element.getAttribute(attribute));
    }
}

export default Svg;
