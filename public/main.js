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
  view.setBounds({ x: 0, y: 0, width: 700, height: 800 });
  view.webContents.loadURL('https://www.tamgr.com/IBS/login');

  view.webContents.on('did-finish-load', resolver);
  view.webContents.on('did-navigate', (event, url) => {
    // After login
    if (url === 'https://www.tamgr.com/IBS/work-condition') {
      afterLogin();
      view.webContents.toggleDevTools();
    }

    // On Session timeout
    if (url === 'https://www.tamgr.com/sessionTimeout') {
      view.webContents.loadURL('https://www.tamgr.com/IBS/login');
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
        }).catch(error => {
          reject(error);
        });
      });`,
    )
    .then(result => {
      mainWindow.webContents.send('project-data', result);
    })
    .catch(error => {
      console.error('Error: ', error);
    });
});

// Request daily attendance
ipcMain.on('request-daily-attendance', (event, data) => {
  const _data = JSON.parse(JSON.stringify(data));
  const promises = _data.map(item => approve(item));

  Promise.all(promises).then(results => {
    mainWindow.webContents.send('request-result', results);
  });
});

const approve = item =>
  view.webContents
    .executeJavaScript(
      `new Promise((resolve, reject) => {
        const csrfToken = document.querySelector("meta[name='_csrf']").content;
        const postData = url => {
          return fetch(url, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify(new Date(${item.dailyAttendance.workDate})),
          }).then(response => {
            return response.json();
          });
        };
      
        const p1 = postData('https://www.tamgr.com/IBS/retrieveDailyAttendance');
        const p2 = postData(
          'https://www.tamgr.com/IBS/retrieveDailyAttendanceProjectTasks',
        );
      
        Promise.all([p1, p2])
          .then(results => {
            resolve(results);
          })
          .catch(error => {
            reject(error);
          });
      });`,
    )
    .then(([dailyAttendance, projectTasks]) => {
      const {
        dailyAttendance: {
          userId,
          companyCode,
          shift: { shiftId },
          approvalCondition,
        },
      } = dailyAttendance;

      const { projectTaskDetail } = projectTasks;
      const isChanged = projectTaskDetail.some(task => {
        const [projectAndTask] = item.dailyAttendance.projectsAndTasks;
        return task.projectCode === projectAndTask.projectCode;
      });
      console.error(isChanged);

      const [projectAndTasks] = item.dailyAttendance.projectsAndTasks;
      const [loggedHour] = projectAndTasks.loggedHours;
      if (isChanged) {
        loggedHour.changed = 'true';
        loggedHour.serialNumber = '1';
      }

      return {
        dailyAttendance: Object.assign({}, item.dailyAttendance, {
          userId,
          companyCode,
          shift: { shiftId: +shiftId },
        }),
        approvalCondition,
        requestType: item.requestType,
      };
    })
    .then(item => {
      console.error(item.approvalCondition);
      return item.approvalCondition !== '0'
        ? Promise.resolve({
            code: item.approvalCondition,
            status: 'unmodified',
          })
        : view.webContents.executeJavaScript(
            `new Promise((resolve, reject) => { 
        console.error(${JSON.stringify(item)});
    const csrfToken = document.querySelector("meta[name='_csrf']").content;
    fetch('https://www.tamgr.com/IBS/requestApproval', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
      },
      body: JSON.stringify(${JSON.stringify(item)}),
    }).then(response => {
      resolve({ code: 2, status: 'new' });
    }).catch(error => {
      reject(error);
    });
  });`,
          );
    })
    .then(result => {
      return result;
    })
    .catch(result => {
      console.error(result);
      return { code: 500 };
    });
