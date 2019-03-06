/*
 * Copyright (c) 2019 by Pablo Klaschka
 */

const {app, BrowserWindow, Menu, ipcMain, dialog} = require('electron');
const fs = require('fs');
const xmldoc = require('xmldoc');

// Behalten Sie eine globale Referenz auf das Fensterobjekt.
// Wenn Sie dies nicht tun, wird das Fenster automatisch geschlossen,
// sobald das Objekt dem JavaScript-Garbagekollektor übergeben wird.

let win;

Menu.setApplicationMenu(null);

let xml = undefined;
let meta = {};
let report;

let template = fs.readFileSync(__dirname + '/assets/report-template.html').toString();

function createWindow() {
    // Erstellen des Browser-Fensters.
    win = new BrowserWindow({
        width: 864,
        height: 544,
        titleBarStyle: "hidden",
        darkTheme: true,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: false
        },
        thickFrame: true,
        icon: __dirname + '/assets/icon.png'
    });

    // und Laden der index.html der App.
    win.loadFile('static/index.html');

    win.setTitle('pklaschka Checklists');

    // Öffnen der DevTools.
    //win.webContents.openDevTools();

    ipcMain.on('requestMeta', (evt) => {
        evt.returnValue = xml.childNamed('meta');
    });

    ipcMain.on('submitMeta', (evt, submittedMeta) => {
        meta = submittedMeta;

        (require('./src/checklist-runner'))(win, meta, xml).then(subReport => {
            report = subReport;
            win.loadFile('static/complete.html');
        })
    });

    ipcMain.on('save', () => {
        let content = template.replace('$$$', report);

        dialog.showSaveDialog(win, {
            filters: [{name: 'HTML', extensions: ['html', 'htm']}]
        }, (fileName) => {
            console.log('Saving to: ' + fileName);
            if (fileName === undefined) {
                console.log("You didn't save the file");
                return;
            }

            fs.writeFile(fileName, content, (err) => {
                if (err) {
                    alert("An error ocurred creating the file " + err.message)
                }

                win.loadFile('static/index.html');
            });
        });
    });

    ipcMain.on('runChecklist', (evt) => {
        dialog.showOpenDialog(win, {
            filters: [
                {name: 'Checklists', extensions: ['xml', 'checklist']}
            ]
        }, (filePaths => {
            if (filePaths) {
                let segments = filePaths[0].split(/[/\\]/);

                win.setTitle(segments[segments.length - 1]);

                fs.readFile(filePaths[0], 'utf-8', (err, data) => {
                    if (err) {
                        alert("An error ocurred reading the file :" + err.message);
                        return;
                    }

                    // Change how to handle the file content
                    xml = new xmldoc.XmlDocument(data);
                    meta = {};
                    report = '';

                    console.log(xml.childNamed('meta'));

                    win.loadFile('static/meta.html');
                });
            }
        }));

        evt.returnValue = true;
    });

    // Ausgegeben, wenn das Fenster geschlossen wird.
    win.on('closed', () => {
        // Dereferenzieren des Fensterobjekts, normalerweise würden Sie Fenster
        // in einem Array speichern, falls Ihre App mehrere Fenster unterstützt.
        // Das ist der Zeitpunkt, an dem Sie das zugehörige Element löschen sollten.
        win = null
    })
}

// Diese Methode wird aufgerufen, wenn Electron mit der
// Initialisierung fertig ist und Browserfenster erschaffen kann.
// Einige APIs können nur nach dem Auftreten dieses Events genutzt werden.
app.on('ready', createWindow);

// Verlassen, wenn alle Fenster geschlossen sind.
app.on('window-all-closed', () => {
    // Unter macOS ist es üblich für Apps und ihre Menu Bar
    // aktiv zu bleiben bis der Nutzer explizit mit Cmd + Q die App beendet.
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    // Unter macOS ist es üblich ein neues Fenster der App zu erstellen, wenn
    // das Dock Icon angeklickt wird und keine anderen Fenster offen sind.
    if (win === null) {
        createWindow()
    }
});

// In dieser Datei können Sie den Rest des App-spezifischen
// Hauptprozess-Codes einbinden. Sie können den Code auch
// auf mehrere Dateien aufteilen und diese hier einbinden.