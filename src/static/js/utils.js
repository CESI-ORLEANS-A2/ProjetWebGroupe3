/**
 * Expression régulière pour valider une adresse e-mail.
 *
 * @type {RegExp}
 */
const emailRegex = /^([-\w\d\.]+?)(?:\s+at\s+|\s*@\s*|\s*(?:[\[\]@]){3}\s*)([-\w\d\.]*?)\s*(?:dot|\.|(?:[\[\]dot\.]){3,5})\s*([a-z]{2,63})$/;


/**
 * Expression régulière pour valider un mot de passe.
 * 
 * @type {RegExp}
 * 
 */
const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,64}$/;

// Deep merge function to handle arrays and objects
function deepMerge(target, source) {
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key]) && isObject(target[key])) {
                target[key] = deepMerge(target[key], source[key]);
            } else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
                target[key] = target[key].concat(source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
}

// Helper function to check if a value is an object
function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

const createElement = ({ type, class: classNames, id, style, events, attributes, text, children } = {}) => {
    const element = document.createElement(type);

    if (classNames && classNames.length > 0) {
        element.classList.add(...classNames);
    }

    if (id) {
        element.id = id;
    }

    if (style) {
        Object.assign(element.style, style);
    }

    if (events) {
        for (let key in events) {
            element.addEventListener(key, events[key]);
        }
    }

    if (attributes) {
        for (let key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
    }

    if (text) {
        element.textContent = text;
    }

    if (children && children.length > 0) {
        children.forEach((item) => {
            if (item instanceof HTMLElement) {
                element.appendChild(item);
            } else if (typeof item === 'string') {
                element.appendChild(new DOMParser().parseFromString(item, 'text/html').body.children[0])
            } else {
                element.appendChild(createElement(item));
            }
        });
    }

    return element;
};