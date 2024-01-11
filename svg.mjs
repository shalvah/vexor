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

class Svg {
    static NAMESPACE_URI = 'http://www.w3.org/2000/svg';

    constructor(elementType, parentDomElementOrId, attributes = {}, styles = {}) {
        if (elementType === 'svg') {
            attributes = {
                ...attributes,
                xmlns: Svg.NAMESPACE_URI,
            }
        }
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

    line(start, end, styles = {}, otherAttributes = {}) {
        return this.add(`line`, {x1: start.x, y1: start.y, x2: end.x, y2: end.y, ...otherAttributes}, styles);
    }

    text(position, content, styles = {}, otherAttributes = {}) {
        const text = this.add(`text`, {x: position.x, y: position.y, ...otherAttributes}, styles);
        text.$element.innerHTML = content;
        return text;
    }

    foreignObject(position, content, styles = {}, otherAttributes = {}) {
        const foreignObject = this.add(`foreignObject`, {x: position.x, y: position.y, ...otherAttributes}, styles);
        foreignObject.$element.innerHTML = content;
        return foreignObject;
    }

    marker({ width, height }, styles = {}, otherAttributes = {}) {
        return this.add(`marker`, {markerWidth: width, markerHeight: height, ...otherAttributes}, styles);
    }

    path(d, styles = {}, otherAttributes = {}) {
        return this.add(`path`, {d, ...otherAttributes}, styles);
    }

    group(styles = {}, otherAttributes = {}) {
        return this.add(`g`, otherAttributes, styles);
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
