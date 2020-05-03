'use strict'
const progressDiv =  document.querySelector("div.progress");
const blockquote = document.querySelector("blockquote");
const mainUl = document.querySelector("ul.collapsible");
const serverUrl = 'http://127.0.0.1:3001/api/contacts';
const inputField = document.querySelector('.input-field');


const leadStatuses = {
    32880754: "Переговоры",
    32880751: "Первичный контакт",
    32880757: "Принимают решение",
    32880760: "Согласование договора",
    142: "Успешно реализовано",
    143: "Закрыто и не реализовано"
};

document.addEventListener('DOMContentLoaded', async () => {
    const elems = document.querySelectorAll('.collapsible');
    M.Collapsible.init(elems);
    await loadContacts();
});

inputField.addEventListener('input', (event) => {
    if ( event.target.value.length > 2 || event.target.value.length === 0 ) {
        clearContactList();
        loadContacts(event.target.value);
    }
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
    renderContacts(contacts);
    inputField.classList.remove('hide');
}

function renderContacts(contacts) {
    clearContactList();
    for ( const contact of contacts ) {
        mainUl.append(createLi(contact));
    }
}

function clearContactList() {
    document.querySelectorAll("li").forEach( li => li.remove() );
}

function createLi(contact) {
    const [li, header, body] = [createElem("li"),
        createElem("div"),
        createElem("div")];

    fillHeader(contact, header);
    fillBody(contact, body);

    body.classList.add('collapsible-body');

    li.append(header, body);
    return li;
}

function fillHeader(contact, header) {
    const [i, nameSpan] = [createElem("i"),
        createElem("span")];
    header.classList.add('collapsible-header');
    nameSpan.textContent = contact.name;
    nameSpan.style.paddingTop = '5px';
    header.prepend(i, nameSpan);
    i.classList.add('material-icons');
    i.textContent = 'account_circle';
    i.style.paddingTop = '5px';
    createTags(contact, header);
    createCustomFields(contact, header);
}

function fillBody(contact, body) {
    const leads = contact.leads || [];
    leads.forEach(lead => {
        const [leadContainer, leadName,
               pipeline, price] = [createElem('div'), createElem('div'),
                                   createElem('div'), createElem('div')];

        leadContainer.style.display = 'flex';
        leadContainer.style.flexDirection = 'row';
        leadContainer.style.marginBottom = '10px';

        leadName.textContent = lead.name;
        leadName.style.marginRight = '5px';
        leadName.style.fontWeight = '600';

        pipeline.textContent = 'Воронка: ' + leadStatuses[lead["status_id"]];
        pipeline.classList.add("badge");
        pipeline.style.backgroundColor = '#039be5';
        pipeline.style.fontWeight = '600';
        pipeline.style.borderRadius = '2px';
        pipeline.style.color = '#fff';
        pipeline.style.paddingRight = '5px';
        pipeline.style.paddingLeft = '5px';

        price.textContent = lead['price'] + ' ₽';
        price.style.marginLeft = '5px';

        leadContainer.append(leadName, pipeline, price);
        body.append(leadContainer);
    });
}

function createElem(tag) {
    return document.createElement(tag)
}

function createCustomFields(contact, header) {
    if ( contact['custom_fields'] && Array.isArray(contact['custom_fields']) ) {
        const fields = contact['custom_fields'].filter(field => ['PHONE', 'EMAIL'].includes(field['code']));
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
    span.style.paddingTop = '5px';
    span.textContent = value;
    return span;
}

function createTags(contact, header) {
    if ( contact['tags'] && Array.isArray(contact['tags']) ) {
        header.append(createTagsContainer(contact['tags']));
    }
}

function createTagsContainer(tags) {
    let div = createElem("div");
    let ul = createElem('ul');
    div.style.width = '100px';
    div.style.marginLeft = "1em";
    div.append(ul);

    ul.style.width = '500px';

    tags.forEach(tag => tag.name && ul.append(createTagNode(tag.name)));
    return div;
}

function createTagNode(tag) {
    const li = createElem('li');
    li.classList.add('chip');
    li.textContent = tag;
    return li;
}