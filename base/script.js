let main = document.querySelector('main');

/**
 * Expression régulière pour valider une adresse e-mail.
 *
 * @type {RegExp}
 */
const emailRegex = /^([-\w\d\.]+?)(?:\s+at\s+|\s*@\s*|\s*(?:[\[\]@]){3}\s*)([-\w\d\.]*?)\s*(?:dot|\.|(?:[\[\]dot\.]){3,5})\s*([a-z]{2,63})$/


/**
 * Expression régulière pour valider un mot de passe.
 * 
 * @type {RegExp}
 * 
 */
const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,64}$/

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

const popupHelper = {}
popupHelper.createElement = (data, createElementData) => {
    // Merge createElementData with default data
    const mergedData = deepMerge(data, createElementData);

    // Create the element using the merged data
    return createElement(mergedData);
}

popupHelper.createTextInput = (name, placeholder, value, size, onChange, createElementData) => {
    // Default data
    const data = {
        type: 'input',
        attributes: {
            placeholder : placeholder || '',
            value : value || '',
            name,
            type: 'text'
        },
        class: [size || 'md']
    };

    if (onChange) {
        data.events = {
            input: onChange
        };
    }

    return popupHelper.createElement(data, createElementData);
};

popupHelper.createSelect = (name, options, placeholder, onChange, createElementData) => {
    // Default data
    const data = {
        type: 'select',
        attributes: {
            name,
            id: name
        },
        children: []
    };

    if (onChange) {
        data.events = {
            input: onChange
        };
    }

    if (placeholder) {
        data.children.push({
            type: 'option',
            attributes: {
                value: '',
                disabled: true,
                selected: true
            },
            text: placeholder || 'Select your option'
        })
    }

    options.forEach((option) => {
        data.children.push({
            type: 'option',
            attributes: {
                value: option.value
            },
            text: option.text
        });
    });

    return popupHelper.createElement(data, createElementData);
};

popupHelper.createDivider = (createElementData) => {
    // Default data
    const data = {
        type: 'div',
        class: ['divider']
    };

    return popupHelper.createElement(data, createElementData);
}

popupHelper.createButton = (type, text, onClick, createElementData) => {
    // Default data
    const data = {
        type,
        class: ['primary-button'],
        text
    };

    if (onClick) {
        data.events = {
            click: onClick
        };
    }

    return popupHelper.createElement(data, createElementData);
}

popupHelper.createIcon = (icon, onClick, createElementData) => {
    // Default data
    const data = {
        type: 'span',
        class: ['material-symbols-outlined'],
        text: icon
    };

    if (onClick) {
        data.events = {
            click: onClick
        };
    }

    return popupHelper.createElement(data, createElementData);
}

popupHelper.createPopup = (type, children, createElementData) => {
    children.push(popupHelper.createIcon("close", () => {
        popupHelper.popupClose();
    }, { class: ['close-icon'] }));

    const data = {
        id: 'popupContainer',
        type,
        class: ['showing'],
        children
    }

    return popupHelper.createElement(data, createElementData);
}

popupHelper.createAdder = (title, inputName, elementFunc) => {
    const remove = popupHelper.createIcon("remove", (event) => {
        const parent = event.target.parentElement;
        parent.parentElement.previousElementSibling.querySelector('span').nb--;
        if (parent.parentElement.children.length > 1) {
            parent.parentElement.children[parent.parentElement.children.length - 2].appendChild(event.target);
        }
        parent.remove();
        
    }, { class: ['rounded'] })

    const add = popupHelper.createIcon("add", (event) => {
        event.target.parentElement.parentElement.querySelector('.col').appendChild(
            createElement({
                type: 'div',
                class: ['row'],
                children: [
                    elementFunc(inputName + event.target.nb++),
                    remove
                ]
            })
        )
    }, { class: ['rounded'] })

    add.nb = 0;

    return [popupHelper.createElement({
        type: 'div',
        class: ['row'],
        children: [
            {
                type: 'div',
                class: ['title'],
                text: title
            },
            add,
        ]
        }
    ), popupHelper.createElement({
        type: 'div',
        class: ['col', 'mx-2']
    })];
}

popupHelper.createEmailInput = (name, placeholder, createElementData) => {
    const data = {
        type: 'div',
        class: ['input'],
        children: [
            popupHelper.createIcon("mail", () => {}, { class: ['material-symbols-outlined'] }),
            createElement({
                type: 'input',
                attributes: {
                    type: 'text',
                    placeholder : placeholder || '',
                    required: true,
                    name
                },
                events: {
                    input: (event) => {
                        if (emailRegex.test(event.target.value)) {
                            event.target.nextElementSibling.textContent = 'check';
                            event.target.nextElementSibling.style.color = 'green';
                            event.target.setCustomValidity('');
                        } else {
                            event.target.nextElementSibling.textContent = 'close';
                            event.target.nextElementSibling.style.color = 'red';
                            event.target.setCustomValidity('Veuillez entrer une adresse e-mail valide.');
                        }
                    },
                    focusout: (event) => {
                        const match = emailRegex.exec(event.target.value);
                        if (match) {
                            event.target.value = `${match[1]}@${match[2]}.${match[3]}`;
                        }
                    }
                }
            }),
            popupHelper.createIcon("", () => {}, { class: ['right'] })
        ]
    }

    return popupHelper.createElement(data, createElementData);
}

popupHelper.createPasswordInput = (name, placeholder, icon, inputFunc, createElementData) => {
    // Default data
    const data = {
        type: 'div',
        class: ['input'],
        children: [
            popupHelper.createIcon(icon),
            {
                type: 'input',
                attributes: {
                    type: 'password',
                    placeholder : placeholder || '',
                    required: true,
                    name
                },
                events: {
                    input: inputFunc
                }
            },
            popupHelper.createIcon("visibility", (event) => {
                const input = event.target.parentElement.querySelector('input')
                input.type = input.type === 'password' ? 'text' : 'password';
                event.target.textContent = input.type === 'password' ? 'visibility' : 'visibility_off';
            }, { class: ['right'] })
        ]
    }

    return popupHelper.createElement(data, createElementData);
}

popupHelper.createPasswordErrorMessage = (text) => {
    return popupHelper.createElement({
        type: 'div',
        class: ['password-error'],
        text
    });
}

popupHelper.passwordInputFunc = (input, parent) => {
    if (passwordRegex.test(input.value)) {
        if (parent.querySelector('.password-error')) {
            parent.querySelector('.password-error').remove();
        }
        input.setCustomValidity('');
    } else {
        if (!parent.querySelector('.password-error')) {
            parent.appendChild(popupHelper.createPasswordErrorMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'));
        }
        input.setCustomValidity('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
    }
}

popupHelper.createSelectAdder = (title, inputName, data) => {
    const func = (name) => popupHelper.createSelect(name, data, 'Commencez à écrire...', '', 'xl');
    return popupHelper.createAdder(title, inputName, func);
}

popupHelper.createTextInputAdder = (title, inputName) => {
    const func = (name) => popupHelper.createTextInput(name, 'Commencez à écrire...', '', 'xl');
    return popupHelper.createAdder(title, inputName, func);
}

popupHelper.createCustomAdder = (title, inputName, func) => {
    return popupHelper.createAdder(title, inputName, func);
}

popupHelper.offreStagePopup = (titre, entreprise, localisation, description) => {
    return popupHelper.createPopup("div", [
        {
            type: 'div',
            class: ['title'],
            text: titre
        },
        {
            type: 'div',
            class: ['content'],
            children: [
                {
                    type: 'a',
                    class: ['title', 'no-icon'],
                    text: entreprise.name,
                    attributes: {
                        href: entreprise.link,
                        target: '_blank'
                    }

                },
                {
                    type: 'div',
                    class: ['row'],
                    children: [
                        popupHelper.createIcon("explore"),
                        {
                            type: 'span',
                            text: localisation,
                        }
                    ]
                },
                {
                    type: 'div',
                    class: ['row', 'wrap'],
                    children: [
                        popupHelper.createButton('a', 'Postuler'),
                        popupHelper.createIcon("favorite"),
                        popupHelper.createIcon("visibility_off")
                    ]
                }
            ]
        },
        popupHelper.createDivider(),
        {
            type: 'div',
            class: ['title'],
            text: 'Informations sur le stage'
        },
        {
            type: 'div',
            class: ['content'],
            children: [
                ...description.map((desc) => ([
                    {
                        type: 'div',
                        class: ['sub-content'],
                        children: [
                            {
                                type: 'div',
                                class: ['title'],
                                text: desc.title
                            },
                            desc.descElement || {
                                type: 'div',
                                class: ['desc'],
                                text: desc.desc
                            }
                        ]
                    },
                    popupHelper.createDivider()
                ])).flat(),
            ]
        }
    ], { class: ['popup'] })
}

popupHelper.createEntrepriseGeneric = async (title, url) => {
    const secteur = await (await fetch('http://cock.localhost/api/test/secteur')).json();

    const [adder, placeholder] = popupHelper.createSelectAdder("Infos Complementaires :", "infoCom")
    return popupHelper.createPopup("form", [
        {
            type: 'div',
            class: ['title'],
            text: title
        },
        popupHelper.createTextInput('entreprise', 'Commencez à écrire...', '', 'xl'),
        {
            type: 'div',
            class: ['content'],
            children: [
                {
                    type: 'div',
                    class: ['mx-2'],
                    children: [
                        {
                            type: 'div',
                            class: ['row'],
                            children: [
                                popupHelper.createIcon("explore"),
                                {
                                    type: 'span',
                                    text: 'Localisation'
                                }
                            ]
                        },
                        popupHelper.createSelect('localisation', [], 'Ville :'),
                        {
                            type: 'div',
                            class: ['row'],
                            children: [
                                {
                                    type: 'div',
                                    class: ['title'],
                                    text: 'Adresse :'
                                },
                                popupHelper.createTextInput('adresse', 'Adresse', '', 'lg')
                            ]
                        }
                    ]
                },
                {
                    type: 'div',
                    class: ['row'],
                    children: [
                        {
                            type: 'div',
                            class: ['title'],
                            text: 'Télephone :'
                        },
                        popupHelper.createTextInput('telephone', 'Commencez à écrire...', '', 'xl')
                    ]
                },
                {
                    type: 'div',
                    class: ['row', 'my-2'],
                    children: [
                        {
                            type: 'div',
                            class: ['title'],
                            text: "Secteur d'activité :"
                        },
                        popupHelper.createSelect('secteur', [
                            ...secteur.map((data) => ({ value: data.IdSecteur, text: data.Nom }))
                        ], "Secteur d'activité :")
                    ]
                },
                adder,
                placeholder
            ]
        },
        {
            type: 'div',
            class: ['light-text', 'my-2'],
            text: 'Description :'
        },
        {
            type: 'div',
            children: [
                {
                    type: 'textarea',
                    attributes: {
                        name: 'description'
                    },
                }
            ]
        },
        {
            type: 'div',
            class: ['footer', 'row', 'center', 'my-1'],
            children: [
                popupHelper.createButton('div', 'Créer', () => {
                    const test = new FormData(document.getElementById('popupContainer'));
                    popupHelper.popupClose();
                })
            ]
        }
    ], { class: ['popup'] });
}

popupHelper.createStageOffer = async () => {
    const entreprise = await (await fetch('http://cock.localhost/api/test/entreprise')).json();

    const [adder, placeholder] = popupHelper.createTextInputAdder("Infos complementaires :", "infoCom")

    return popupHelper.createPopup("form", [
        {
            type: 'div',
            class: ['title'],
            text: 'Titre du stage'
        },
        popupHelper.createTextInput('titre', 'Commencez à écrire...', '', 'xl'),
        {
            type: 'div',
            class: ['content'],
            children: [
                {
                    type: 'div',
                    class: ['row', 'my-2'],
                    children: [
                        {
                            type: 'div',
                            class: ['title'],
                            text: "Entreprise :"
                        },
                        popupHelper.createSelect('entreprise', [
                            ...entreprise.map((data) => ({ value: data.IdEntreprise, text: data.Nom }))
                        ], "Entreprise")
                    ]
                },
                {
                    type: 'div',
                    class: ['row', 'my-2'],
                    children: [
                        {
                            type: 'div',
                            class: ['title'],
                            text: "Competences :"
                        },
                        popupHelper.createSelect('competences', [
                            ...entreprise.map((data) => ({ value: data.IdEntreprise, text: data.Nom }))
                        ], "Competences"),
                        popupHelper.createIcon("add", () => {}, { class: ['rounded'] })
                    ]
                },
                {
                    type: 'div',
                    class: ['row', 'my-2'],
                    children: [
                        {
                            type: 'div',
                            class: ['title'],
                            text: "Promos :"
                        },
                        popupHelper.createSelect('promos', [
                            ...entreprise.map((data) => ({ value: data.IdEntreprise, text: data.Nom }))
                        ], "Promos")
                    ]
                },
                adder,
                placeholder
            ]
        },
    ], { class: ['popup'] });
}

popupHelper.createEntreprisePopup = async () => {
    return popupHelper.createEntrepriseGeneric('Créer une entreprise');
}

popupHelper.createSitePopup = async (entreprise) => {
    return popupHelper.createEntrepriseGeneric('Créer un site pour ' + entreprise);
}

popupHelper.loginPopup = () => {
    return popupHelper.createPopup("div", [
        {
            type: 'div',
            class: ['title'],
            text: 'Connexion à un compte'
        },
        {
            type: 'form',
            class: ['container'],
            children: [
                {
                    type: 'div',
                    class: ['input-container'],
                    children: [
                        {
                            type: 'div',
                            class: ['title'],
                            text: 'E-mail'
                        },
                        popupHelper.createEmailInput('email', 'Email')
                    ]
                },
                {
                    type: 'div',
                    class: ['input-container'],
                    children: [
                        {
                            type: 'div',
                            class: ['title'],
                            text: 'Mot de passe'
                        },
                        popupHelper.createPasswordInput('password', 'Mot de passe', 'password', (event) => popupHelper.passwordInputFunc(event.target, event.target.parentElement.parentElement))
                    ]
                },
                {
                    type: 'div',
                    class: ['mx-2', 'row'],
                    children: [
                        {
                            type: 'input',
                            attributes: {
                                type: 'checkbox',
                                id: 'rememberMe'
                            }
                        },
                        {
                            type: 'label',
                            attributes: {
                                for: 'rememberMe'
                            },
                            text: 'Se souvenir de moi'
                        }
                    ]
                },
                {
                    type: 'div',
                    class: ['input-container'],
                    children: [
                        {
                            type: 'button',
                            class: ['center'],
                            text: 'Se connecter',
                            events: {
                                click: (event) => {
                                    event.preventDefault();
                                    const form = document.querySelector('form');
                                    if (form.checkValidity()) {
                                        console.log('Logged in');
                                    }
                                }
                            }
                        }
                    ]
                }
            ]
        }
    ], { class: ['login'] });
}

popupHelper.signinPopup = () => {
    return popupHelper.createPopup("div", [
        {
            type: 'div',
            class: ['title'],
            text: 'Créer un compte'
        },
        {
            type: 'form',
            class: ['container'],
            children: [
                {
                    type: 'div',
                    class: ['input-container'],
                    children: [
                        {
                            type: 'div',
                            class: ['title'],
                            text: 'E-mail'
                        },
                        popupHelper.createEmailInput('email', 'Email')
                    ]
                },
                {
                    type: 'div',
                    class: ['row', 'space-evenly', 'wrap'],
                    children: [
                        {
                            type: 'div',
                            class: ['input-container'],
                            children: [
                                { type: 'div', class: ['title'], text: 'Mot de passe' },
                                popupHelper.createPasswordInput('password', 'Mot de passe', 'lock', (event) => popupHelper.passwordInputFunc(event.target, event.target.parentElement.parentElement.parentElement))
                            ]
                        },
                        {
                            type: 'div',
                            class: ['input-container'],
                            children: [
                                {
                                    type: 'div',
                                    class: ['title'],
                                    text: 'Confirmer le mot de passe'
                                },
                                popupHelper.createPasswordInput('confirmPassword', 'Confirmer', 'lock', (event) => {
                                    const parent = event.target.parentElement.parentElement.parentElement;
                                    const all = parent.querySelectorAll('input');
                                    if (all[0].value === all[1].value) {
                                        if (parent.querySelector('.password-error')) {
                                            parent.querySelector('.password-error').remove();
                                        }
                                        event.target.setCustomValidity('');
                                    } else {
                                        if (!parent.querySelector('.password-error')) {
                                            parent.appendChild(popupHelper.createPasswordErrorMessage('Les mots de passe ne correspondent pas.'));
                                        }
                                        event.target.setCustomValidity('Les mots de passe ne correspondent pas.');
                                    }
                                })
                            ]
                        }
                    ]
                },
                popupHelper.createDivider(),
                {
                    type: 'div',
                    class: ['row', 'space-evenly', 'wrap'],
                    children: [
                        {
                            type: 'div',
                            class: ['input-container'],
                            children: [
                                {
                                    type: 'div',
                                    class: ['title'],
                                    text: 'Nom'
                                },
                                {
                                    type: 'div',
                                    class: ['input'],
                                    children: [
                                        popupHelper.createIcon("person"),
                                        {
                                            type: 'input',
                                            attributes: {
                                                type: 'text',
                                                placeholder: 'Nom',
                                                required: true,
                                                class: 'sm'
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: 'div',
                            class: ['input-container'],
                            children: [
                                {
                                    type: 'div',
                                    class: ['title'],
                                    text: 'Prénom'
                                },
                                {
                                    type: 'div',
                                    class: ['input'],
                                    children: [
                                        popupHelper.createIcon("person"),
                                        {
                                            type: 'input',
                                            attributes: {
                                                type: 'text',
                                                placeholder: 'Prénom',
                                                required: true,
                                                class: 'sm'
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    type: 'div',
                    class: ['input-container', 'row'],
                    children: [
                        {
                            type: 'div',
                            class: ['title'],
                            text: 'Date de naissance'
                        },
                        {
                            type: 'input',
                            attributes: {
                                type: 'date',
                                placeholder: 'Date de naissance',
                                required: true
                            }
                        }
                    ]
                },
                {
                    type: 'div',
                    class: ['row'],
                    children: [
                        {
                            type: 'div',
                            class: ['title'],
                            text: 'Promotion'
                        },
                        {
                            type: 'select',
                            attributes: {
                                name: 'promotion'
                            }
                        }
                    ]
                },
                {
                    type: 'div',
                    class: ['row'],
                    children: [
                        {
                            type: 'div',
                            class: ['title'],
                            text: 'Centre'
                        },
                        {
                            type: 'select',
                            attributes: {
                                name: 'centre'
                            }
                        }
                    ]
                },
                {
                    type: 'div',
                    class: ['row'],
                    children: [
                        {
                            type: 'div',
                            class: ['title'],
                            text: 'Rôle'
                        },
                        {
                            type: 'select',
                            attributes: {
                                name: 'role'
                            }
                        }
                    ]
                },
                {
                    type: 'div',
                    class: ['row'],
                    children: [
                        {
                            type: 'div',
                            class: ['title'],
                            text: 'Accepter les conditions d\'utilisation'
                        },
                        {
                            type: 'input',
                            attributes: {
                                type: 'checkbox',
                                required: true
                            }
                        }
                    ]
                },
                {
                    type: 'div',
                    class: ['input-container'],
                    children: [
                        {
                            type: 'button',
                            class: ['primary-button'],
                            text: 'Créer le compte'
                        }
                    ]
                }
            ]
        }
    ], { class: ['login'] })
};

popupHelper.spinner = () => {
    return popupHelper.createPopup("div", [
        '<div class="lds-roller pulse"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>',
    ], {style: {
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
    }});
}

const entreprisePopup = popupHelper.offreStagePopup(
    "Stage IT",
    {
        name: 'Google',
        link: 'https://www.google.com'
    },
    'Paris',
    [{title : "Test", desc : ""}, {title : "Test", desc : "Test 1"}, {title : "Test", desc : "Test 1"}]
);

popupHelper.popupOpen = async (popupContainer) => {
    document.getElementById('popup').style.display = 'flex';
    document.querySelector('body').style.overflow = 'hidden';

    document.getElementById('popup').appendChild(popupHelper.spinner());

    document.getElementById('popup').appendChild(await popupContainer);
    document.getElementById('popup').children[0].remove();
    

    setTimeout(() => {
        document.getElementById('popupContainer').classList.remove("showing");
    }, 300);
};

popupHelper.popupClose = () => {
    document.getElementById('popupContainer').classList.add("closing");

    setTimeout(() => {
        document.getElementById('popupContainer').remove();
        document.getElementById('popup').style.display = 'none';
        main.style.overflow = 'auto';
    }, 300);

    document.querySelector('body').style.overflow = 'auto';
};

document.getElementById('popup').addEventListener('click', (e) => {
    if (e.target.id === 'popup') {
        popupHelper.popupClose();
    }
})

const arr = [() => {return entreprisePopup}, popupHelper.createEntreprisePopup, popupHelper.createSitePopup, popupHelper.createStageOffer, popupHelper.loginPopup, popupHelper.signinPopup, popupHelper.spinner];

const options = [
    { value: 0, text: 'Offre Stage' },
    { value: 1, text: 'Create Entreprise' },
    { value: 2, text: 'Create Site' },
    { value: 3, text: 'Create Stage' },
    { value: 4, text: 'Login' },
    { value: 5, text: 'Signin' },
    { value: 5, text: 'Spinner' }
];

document.querySelector('main').appendChild(
    createElement({
        type: 'div',
        children: [
            popupHelper.createSelect('test', options),
            popupHelper.createButton('button', 'Open', async (event) => {
                const selectedValue = document.getElementById('test').value;
                const selectedOption = arr[selectedValue];
                if (selectedOption) {
                    popupHelper.popupOpen(selectedOption());
                }
            })
        ]
    })
);
