const {basename} = require('path');

const {camelCase} = require('change-case');

const COMPONENT_REGEX = /^[A-Z]\w+$/;
const SUBCOMPONENT_VARIATION_SELECTOR = /^\w+-\w+$/;
const NESTED_COMPONENT_PATH_REGEX = /.*\/components\/(.*)\/components/;

export function generateScopedName({includeHash = false} = {}) {
  return (name, filename) => {
    const componentName = basename(filename, '.scss');
    const nestedComponentMatch = NESTED_COMPONENT_PATH_REGEX.exec(filename);

    const lithiumComponentName =
      nestedComponentMatch && nestedComponentMatch.length > 1
        ? `${lithiumClassName(nestedComponentMatch[1])}-${componentName}`
        : lithiumClassName(componentName);

    let className;

    if (isComponent(name)) {
      className =
        componentName === name
          ? lithiumComponentName
          : subcomponentClassName(lithiumComponentName, name);
    } else if (SUBCOMPONENT_VARIATION_SELECTOR.test(name)) {
      const [subcomponent, variation] = name.split('-');
      const subcomponentName = subcomponentClassName(
        lithiumComponentName,
        subcomponent,
      );
      className = variationClassName(subcomponentName, camelCase(variation));
    } else {
      className = variationClassName(lithiumComponentName, camelCase(name));
    }

    const suffix = includeHash
      ? `_${stringHash(name).toString(36).substr(0, 5)}`
      : '';

    return className + suffix;
  };
}

function isComponent(className) {
  return COMPONENT_REGEX.test(className);
}

function lithiumClassName(className) {
  return `Lithium-${className}`;
}

function subcomponentClassName(component, subcomponent) {
  return `${component}__${subcomponent}`;
}

function variationClassName(component, variation) {
  return `${component}--${variation}`;
}

// Taken from the string-hash package
function stringHash(str) {
  let hash = 5381;
  let i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0;
}