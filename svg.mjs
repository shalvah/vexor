import { setStyles, setAttributes } from "./utils.mjs"
import DraggableLine from "./draggable_line.mjs";

export default class Svg extends EventTarget {
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

    updateAndNotify(attributes) {
        setAttributes(this, attributes);
        this.dispatchEvent(new CustomEvent("attributes_changed", {
            detail: attributes
        }));
    }

    draggableLine(attributes, styles = {}) {
        return new DraggableLine(attributes, styles, this).line;
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
