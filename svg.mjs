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

    line(x1, y1, x2, y2, styles = {}, otherAttributes = {}) {
        return this.add(`line`, {x1, y1, x2, y2, ...otherAttributes}, styles);
    }

    text(x, y, text, styles = {}, otherAttributes = {}) {
        const $text = this.add(`text`, {x, y, ...otherAttributes}, styles);
        $text.innerHTML = text;
        return $text;
    }

    marker(refX, refY, markerWidth, markerHeight, styles = {}, otherAttributes = {}) {
        return this.add(`marker`, {refX, refY, markerWidth, markerHeight, ...otherAttributes}, styles);
    }

    path(d, styles = {}, otherAttributes = {}) {
        return this.add(`path`, {d, ...otherAttributes}, styles);
    }

    setAttribute(attribute, value) {
        return this.$element.setAttribute(attribute, value);
    }

    getAttribute(attribute) {
        return this.$element.getAttribute(attribute);
    }
}

export default Svg;
