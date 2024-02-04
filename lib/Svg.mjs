import {setStyles, setAttributes, getAndSetAttributes} from "./utils.mjs"
import {makeResizable} from "./make_resizable.mjs";

export default class Svg extends EventTarget {
  static NAMESPACE_URI = 'http://www.w3.org/2000/svg';
  static classesForElementTypes = {};

  constructor(elementType, parentSvgOrId, attributes = {}, styles = {}) {
    super();

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

    let parentDomElement = (typeof parentSvgOrId == 'string') ?
      document.querySelector(`#${parentSvgOrId}`) : parentSvgOrId.$element;

    parentDomElement.appendChild(this.$element);

    this.parentSvg = (typeof parentSvgOrId == 'string') ? null : parentSvgOrId;
    this.rootSvg = this.parentSvg?.rootSvg || this;
  }

  static setElementClassWrapper(elementType, klass) {
    Svg.classesForElementTypes[elementType] = klass;
  }

  add(elementType, attributes = {}, styles = {}) {
    return new Svg(elementType, this, attributes, styles);
  }

  // Update this element's attributes and emit an "updated" event if they changed
  updateAndNotify(attributes) {
    let oldAttributes = getAndSetAttributes(this, attributes);
    let changed = Object.entries(oldAttributes)
      .find(([k, v]) => v.toString() !== attributes[k].toString());

    if (changed) {
      this.dispatchEvent(new CustomEvent("updated", {
        detail: attributes
      }));
    }
  }

  // Call an update function when when any of these other elements emit an "updated" event
  anchorTo(svgElements, updateFn) {
    [svgElements].flat().forEach(el => {
      el.addEventListener('updated', updateFn);
    });
  }

  line(attributes, styles = {}) {
    return this.add(`line`, attributes, styles);
  }

  polyline(attributes, styles = {}) {
    return this.add(`polyline`, attributes, styles);
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
    makeResizable(line, endpoints[0], {x: 'x1', y: 'y1'});
    makeResizable(line, endpoints[1], {x: 'x2', y: 'y2'});
    return line;
  }

  circle(attributes, styles = {}) {
    return this.add(`circle`, attributes, styles);
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

  arrowHead(id, styles = {}) {
    let arrowHead = this.marker({
      fill: styles.fill,
      markerWidth: 6,
      markerHeight: 6,
      id,
      orient: 'auto-start-reverse',
      // 0,0 of the arrowhead is the end of the axis, so we must "translate" it
      refX: 5, refY: 2
    });

    // 0,4 - 4 determines the width of the arrow's base
    arrowHead.path({d: 'M 0,0 L 6,2 L 0,4 Z'});
    return arrowHead;
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
