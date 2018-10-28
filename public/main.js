const {
  app,
  ipcMain,
  session,
  BrowserView,
  BrowserWindow,
} = require('electron');
const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');

let mainWindow;
let view;

function createWindow() {
  mainWindow = new BrowserWindow({ width: 900, height: 680 });
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`,
  );
  mainWindow.on('closed', () => (mainWindow = null));

  createView();
}

function createView() {
  view = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
    },
  });
  mainWindow.setBrowserView(view);
  view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
  view.webContents.loadURL('https://www.tamgr.com/IBS/login');
  view.webContents.on('did-finish-load', () => {
    view.webContents.insertCSS('html, body { display: hidden !important; }');
  });

  view.webContents.on('did-navigate', (event, url) => {
    view.webContents.insertCSS('html, body { display: hidden !important; }');
    if (url === 'https://www.tamgr.com/IBS/work-condition') {
      view.webContents
        .executeJavaScript(
          `new Promise((resolve, reject) => {
            resolve(document.querySelector("meta[name='_csrf']").content);
        })`,
        )
        .then(result => {
          console.log('Token: ', result);
          session.defaultSession.cookies.get({}, (error, cookies) => {
            console.log(error, cookies);
          });

          mainWindow.webContents.send('csrf-token', result);
        })
        .catch(error => {
          console.error('Token Error: ', error);
        });
    }
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('credentials', (evenet, { emailAddress, password }) => {
  view.webContents
    .executeJavaScript(
      `new Promise((resolve, reject) => {
      document.getElementsByName("username")[0].value = "${emailAddress.trim()}"
      document.getElementsByName("password")[0].value = "${password.trim()}"
      document.getElementById("login_form").submit();
      resolve();
})`,
    )
    .then(result => {
      console.log('Submit', result);
    })
    .catch(error => {
      console.error('Submit Error: ', error);
    });
});
