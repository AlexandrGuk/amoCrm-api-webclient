'use strict'
const progressDiv =  document.querySelector("div.progress");
const blockquote = document.querySelector("blockquote");
const mainUl = document.querySelector("ul.collapsible");
const serverUrl = 'http://127.0.0.1:3001/api/contacts';
const inputField = document.querySelector('.input-field');

document.addEventListener('DOMContentLoaded', async ()=>{
  await loadContacts();
  inputField.addEventListener('input', (event)=> event.target.value.length > 2 || event.target.value.length === 0 ? loadContacts(event.target.value) : null);
});

async function loadContacts(query) {

    progressDiv.classList.remove('hide');
    blockquote.classList.add('hide');

    const params = query ? '?query=' + query : '';
    const contacts = await fetch(serverUrl + params).then(response => response.ok ? response.json() : null).catch(e => null);
    if ( !contacts || !Array.isArray(contacts) ) {
        blockquote.classList.remove('hide');
        progressDiv.classList.add('hide');
        return;
    }

    progressDiv.classList.add('hide');
    blockquote.classList.add('hide');
    console.log(contacts);
    renderContacts(contacts)
    inputField.classList.remove('hide');
}

function renderContacts(contacts) {
    document.querySelectorAll("li").forEach( li => li.remove() );
    for (const contact of contacts) {
        mainUl.append(createLi(contact));
    }
}

function createLi(contact) {
    const [li, i, header, body] = [createElem("li"), createElem("i"), createElem("div"), createElem("div")];

    header.classList.add('collapsible-header');
    header.textContent = contact.name;
    header.prepend(i);

    body.classList.add('collapsible-body');

    i.classList.add('material-icons');
    i.textContent = 'account_circle';

    createCustomFields(contact, header);
    li.append(header, body);
    return li;
}


function createElem(tag) {
    return document.createElement(tag)
}

function createCustomFields(contact, header) {
    if ( contact['custom_fields'] && Array.isArray(contact['custom_fields']) ) {
        const fields = contact['custom_fields'].filter(field => ['PHONE', 'EMAIL'].includes(field['code']));
        console.log(fields);
        fields.forEach(field => {
            if ( field.values && field.values.length > 0 ) {
                header.append(createFieldNode(field.values[0].value));
            }

        });
    }
}

function createFieldNode(value) {
    const span = createElem('span');
    span.classList.add('badge');
    span.textContent = value;
    return span;
}