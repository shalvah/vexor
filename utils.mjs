export let setStyles = ($element, styles = {}) => {
  Object.entries(styles).forEach(([k, v]) => {
    $element.style[k] = v;
  });
  return $element;
}

export let setAttributes = ($element, attributes = {}) => {
  Object.entries(attributes).forEach(([k, v]) => {
    $element.setAttribute(k, v);
  });
  return $element;
}

export let randomInt = () => Math.floor(Math.random() * 1000);
