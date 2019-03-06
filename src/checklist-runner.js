/*
 * Copyright (c) 2019 by Pablo Klaschka
 */

const {BrowserWindow, ipcMain} = require('electron');
const screenshot = require('./screenshot');

let win;

let currentItem = '';

ipcMain.on('requestItemText', (evt) => {
    evt.returnValue = currentItem;
});

module.exports = parseChecklist;

/**
 *
 * @param {BrowserWindow} window
 * @param {Object} meta
 * @param {XmlDocument} xml
 * @return {Promise<string>} The HTML string of the report
 */
async function parseChecklist(window, meta, xml) {
    win = window;

    let reportHTML = `<h1>${xml.attr.name} (v${xml.attr.version})</h1>
<h2>Meta-Info</h2>
<table>
<thead>
<th>Key</th>
<th>Value</th>
</thead>
<tbody>
`;

    for (let key in meta) {
        reportHTML += `
        <tr>
        <td>${key}</td><td>${meta[key]}</td>
        </tr>
        `
    }
    reportHTML += `</tbody></table> <h2>Checklist</h2>`;

    reportHTML += await runGroup(xml);
    return reportHTML;
}

/**
 *
 * @param {XmlElement} group
 * @param {boolean} [inner=false] Group is an inner group, i.e., it resembles a `<group>` node
 * @return {Promise<string>}
 */
async function runGroup(group, inner) {
    if (inner === undefined)
        inner = false;

    let reportHTML = inner ? `<li class="group"><h3>${group.attr.title}</h3><ul>` : '<ul>';
    for (let child of group.children) {
        if (!child.text && child.name !== 'meta') {
            // "Valid" item or screenshot node
            if (child.name === 'item') {
                // child is a checklist item
                try {
                    await runItem(child.val);
                    reportHTML += `<li class="success">&checkmark; ${child.val}</li>`
                } catch (e) {
                    reportHTML += `<li class="failure">&cross; ${child.val}</li>`;
                    reportHTML += await getScreenshotCode();
                    break;
                }
            } else if (child.name === 'screenshot') {
                reportHTML += await getScreenshotCode();
            } else if (child.name === 'group') {
                // Parse group
                // noinspection JSCheckFunctionSignatures
                reportHTML += await runGroup(child, true)
            } else {
                // Invalid node type
                throw new TypeError('Expected node to be of type item, ' +
                    'screenshot or group, but was ' + child.name)
            }
        }
    }
    reportHTML += ('</ul>' + (inner ? '</li>' : ''));
    return reportHTML;
}

/**
 *
 * @param {string} item
 * @return {Promise<void>}
 */
function runItem(item) {
    ipcMain.removeAllListeners('continue');
    ipcMain.removeAllListeners('abort');

    win.loadFile('static/item.html');
    return new Promise((resolve, reject) => {
        currentItem = item;
        ipcMain.on('continue', () => {
            resolve();
        });
        ipcMain.on('abort', () => {
            reject();
        });
    });
}

async function getScreenshotCode() {
    const url = await screenshot();
    return '<li><img src="'+url+'" alt="Red dot" /></li>'
}