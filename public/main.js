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
let viewDidLoad;
let afterLogin;
let resolver;

viewDidLoad = new Promise((resolve, reject) => {
  resolver = resolve;
});

function createWindow() {
  mainWindow = new BrowserWindow({ width: 1200, height: 600 });
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

  view.webContents.on('did-finish-load', resolver);
  view.webContents.on('did-navigate', (event, url) => {
    // After login
    if (url === 'https://www.tamgr.com/IBS/work-condition') {
      afterLogin();
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

// Login
ipcMain.on('credentials', async (event, { emailAddress, password }) => {
  afterLogin = () => {
    mainWindow.webContents.send('logged-in', { emailAddress, password });
  };
  await viewDidLoad;
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

// Retrieve daily attendance
ipcMain.on('retrieve-daily-attendance-project-tasks', evenet => {
  view.webContents
    .executeJavaScript(
      `new Promise((resolve, reject) => {
        const csrfToken = (document.querySelector("meta[name='_csrf']") || {})
          .content;
        fetch('https://www.tamgr.com/IBS/retrieveDailyAttendanceProjectTasks', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
          body: JSON.stringify(new Date()),
        }).then(response => {
          resolve(response.json());
        });
      });`,
    )
    .then(result => {
      console.log('Result: ', result);
      mainWindow.webContents.send('project-data', result);
    })
    .catch(error => {
      console.error('Error: ', error);
    });
});

// Request daily attendance
ipcMain.on('request-daily-attendance', (event, data) => {
  const promises = data.map(item => {
    console.error(item);
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
          body: ${new Date(item.dailyAttendance.workDate).toJSON()},
        }).then(response => {
          resolve(response.json());
        });
      });`,
      )
      .then(result => {
        console.error('result', result);
      })
      .catch(error => {
        console.error('Error: ', error);
      });
  });
});
