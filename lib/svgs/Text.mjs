import {setAttributes} from "../utils/dom.mjs";
import Svg from "../Svg.mjs";

export default class Text extends Svg {
  constructor(parentSvgOrId, attributes = {}, styles = {}) {
    super(`text`, parentSvgOrId, attributes, styles);
  }

  setPosition({x, y}) {
    setAttributes(this.$element, {x, y});
  }

  setContent(content) {
    this.$element.innerHTML = content;
  }
}

// Workaround because of circular deps
// TODO refactor this
Svg.prototype.text = function (content, attributes, styles = {}) {
  const text = new Text(this, attributes, styles);
  text.setContent(content);
  return text;
};
