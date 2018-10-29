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
  view.setBounds({ x: 600, y: 0, width: 0, height: 0 });
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

// Login
ipcMain.on('credentials', (event, { emailAddress, password }) => {
  view.webContents.loadURL('https://www.tamgr.com/IBS/login');
  view.webContents.on('did-finish-load', () => {
    view.webContents
      .executeJavaScript(
        `new Promise((resolve, reject) => {
    document.getElementsByName("username")[0].value = "${emailAddress.trim()}"
    document.getElementsByName("password")[0].value = "${password.trim()}"
    document.getElementById("login_form").submit();
    resolve();
})`,
      )
      .catch(error => {
        console.error('Submit Error: ', error);
      });
  });

  view.webContents.on('did-navigate', (event, url) => {
    view.webContents.insertCSS('html, body { display: hidden !important; }');
    if (url === 'https://www.tamgr.com/IBS/work-condition') {
      mainWindow.webContents.send('logged-in', { emailAddress, password });
    }
  });
});

// Retrieve daily attendance
ipcMain.on('retrieve-daily-attendance-project-tasks', evenet => {
  view.webContents
    .executeJavaScript(
      `new Promise((resolve, reject) => {
        const csrfToken = document.querySelector("meta[name='_csrf']").content;
        fetch('https://www.tamgr.com/IBS/retrieveDailyAttendanceProjectTasks', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
          body: JSON.stringify(new Date())
        }).then(response => { 
          const data = response.json();
          resolve(data);
        });
    })`,
    )
    .then(result => {
      console.log('Token: ', result);
      mainWindow.webContents.send('project-data', result);
    })
    .catch(error => {
      console.error('Token Error: ', error);
    });
});
