import {setStyles, setAttributes} from "./utils.mjs"
import {makeResizable} from "./make_resizable.mjs";

export default class Svg extends EventTarget {
  static NAMESPACE_URI = 'http://www.w3.org/2000/svg';

  constructor(elementType, parentDomElementOrId, attributes = {}, styles = {}, rootSvg = null) {
    super();

    this.rootSvg = rootSvg;

    if (elementType === 'svg') {
      attributes = {
        ...attributes,
        xmlns: Svg.NAMESPACE_URI,
      }
    }
    this.elementType = elementType;
    this.styles = styles;
    this.$element = document.createElementNS(Svg.NAMESPACE_URI, elementType);
    setAttributes(this.$element, attributes);
    setStyles(this.$element, styles);

    let parentDomElement = (typeof parentDomElementOrId == 'string') ?
      document.querySelector(`#${parentDomElementOrId}`) : parentDomElementOrId;

    parentDomElement.appendChild(this.$element);
  }

  add(elementType, attributes = {}, styles = {}) {
    return new Svg(elementType, this.$element, attributes, styles, this.rootSvg || this);
  }

  // Update this element's attributes and emit an attributes_changed event
  updateAndNotify(attributes) {
    setAttributes(this, attributes);
    this.dispatchEvent(new CustomEvent("attributes_changed", {
      detail: attributes
    }));
  }

  // Call an update function when when any of these other elements emit an attributes_changed event
  anchorTo(svgElements, updateFn) {
    svgElements.forEach(el => {
      el.addEventListener('attributes_changed', updateFn);
    });
  }

  line(attributes, styles = {}) {
    return this.add(`line`, attributes, styles);
  }

  draggableLine(attributes, styles = {}) {
    let group = this.grouped(styles);
    // First, draw the line
    let line = group.line(attributes);
    // Then make its endpoints resizable
    let endpoints = [
      {x: attributes.x1, y: attributes.y1},
      {x: attributes.x2, y: attributes.y2},
    ];
    makeResizable(line, endpoints[0], {x: 'x1', y: 'y1' }, group);
    makeResizable(line, endpoints[1], {x: 'x2', y: 'y2' }, group);
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
