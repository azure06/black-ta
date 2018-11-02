import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import { StyledButton } from './../styled-components/StyledComponents';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Timesheet from './Timesheet';

/* from app code, require('electron').remote calls back to main process */
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;
const dialog = window.require('electron').remote.dialog;
const XLSX = window.require('xlsx');

const styles = theme => ({
  header: {
    marginTop: '4vw',
    color: 'rgba( 59, 59, 59, 1)',
    margin: '0 2.5vw 0 2.5vw',
    paddingLeft: '1vw',
    '&>h1': {
      fontWeight: '500',
    },
  },
  mainContainer: {
    display: 'flex',
    alignContent: 'stretch',
    margin: '2vw',
    boxShadow:
      '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)',
  },
  form: {
    backgroundColor: 'rgba(248,248,248,1)',
    padding: '5vw 2vw 5vw 2vw',
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    width: '25vw',
  },
  formControl: {
    display: 'flex',
    borderRadius: '5px',
    margin: '0 0 2vw 0',
    height: 40,
  },
  inputControl: {
    fontWeight: 500,
  },
  btnContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: '2vw 2.5vw 0 2.5vw',
    textAlign: 'right',
  },
  btnRight: {
    marginRight: '10px',
  },
  table: {
    backgroundColor: 'white',
    margin: '0 2.5vw 0 2.5vw',
    paddingBottom: '2.5vw',
    width: '70vw',
    borderRadius: '5px',
  },
});

class Home extends Component {
  state = {
    data: null,
    projectCode: '',
    taskId: '',
    middleTaskId: '',
    lowerTaskId: '',
    excelData: [],
  };

  componentDidMount(nextProps, nextState) {
    ipcRenderer.send('retrieve-daily-attendance-project-tasks', {});
    ipcRenderer.on('project-data', (event, data) => {
      console.error(data);
      this.setState({
        data,
      });
    });
  }

  importExcelData = () => {
    /* show a file-open dialog and read the first selected file */
    const o = dialog.showOpenDialog({ properties: ['openFile'] });
    if (!o) return;
    const workbook = XLSX.readFile(o[0]);
    const [sheetName] = workbook.SheetNames;
    const data = workbook.Sheets[sheetName];

    const result = {};

    Object.keys(data).forEach(key => {
      const w = data[key].w;
      result[key.substring(1)] = Object.assign(
        { [key]: w },
        result[key.substring(1)],
      );
    });

    const filteredArray = [];

    Object.keys(result).forEach((key, index) => {
      if (Object.keys(result[key]).length !== 3) return;
      const date = result[key][`A${key}`];
      const workStartTime = `${result[key][`B${key}`]} ${
        result[key][`A${key}`]
      }`;
      const workEndTime = `${result[key][`C${key}`]} ${result[key][`A${key}`]}`;
      const tmp = [
        new Date(date),
        new Date(workStartTime),
        new Date(workEndTime),
      ];

      if (tmp.every(d => !isNaN(d))) {
        filteredArray.push(tmp);
      }
      this.setState({ excelData: filteredArray });
    });
  };

  handleChange = (event, type) => {
    if (type === 'project') {
      this.setState({ taskId: '' });
    }
    if (type === 'project' || type === 'task') {
      this.setState({ middleTaskId: '' });
    }
    if (type !== 'lowerTask') {
      this.setState({ lowerTaskId: '' });
    }
    this.setState({ [event.target.name]: event.target.value });
    setTimeout(() => {
      console.log('State change', this.state);
    }, 0);
  };

  save = () => {
    const dailyAttendance = this.state.excelData.map(item => {
      const [date, workStartTime, workEndTime] = item;
      const breakTimeStart = new Date(date);
      const breakTimeEnd = new Date(date);
      breakTimeStart.setHours(date.getHours() + 13);
      breakTimeEnd.setHours(date.getHours() + 14);
      return {
        dailyAttendance: {
          userId: null,
          companyCode: null,
          workDate: date.getTime(),
          workStartTime: workStartTime.getTime(),
          workEndTime: workEndTime.getTime(),
          shift: { shiftId: null },
          breaktimes: [
            {
              breakTimeStart: breakTimeStart.getTime(),
              breakTimeEnd: breakTimeEnd.getTime(),
              serialNumber: 1,
            },
          ],
          projectsAndTasks: [
            {
              loggedHours: [
                {
                  serialNumber: '1',
                  projectCode: this.state.projectCode || null,
                  taskId: this.state.middleTaskId || null,
                  taskDate: date.toJSON(),
                  newSerialNumber: 1,
                  upperTaskId: this.state.taskId || null,
                  effort: '' + ((workEndTime - workStartTime) / 1000 / 60 - 60),
                  remarks: '',
                  changed: 'true',
                },
              ],
              projectCode: this.state.projectCode || null,
            },
          ],
        },
        requestType: 'request-approval-all',
      };
    });

    ipcRenderer.send('request-daily-attendance', dailyAttendance);
  };

  render() {
    const { classes } = this.props;
    const { projectTaskReference } = this.state.data || {
      projectTaskReference: [],
    };

    const project = projectTaskReference.find(
      ref => ref.project.projectCode === this.state.projectCode,
    ) || { allTasks: [] };

    const task = project.allTasks.find(
      task => task.taskId === this.state.taskId,
    ) || { middleTasks: [] };

    const middleTask = task.middleTasks.find(
      middleTask => middleTask.taskId === this.state.middleTaskId,
    ) || { lowerTasks: [] };

    return (
      <div>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" color="inherit">
              Monthly timesheet
            </Typography>
          </Toolbar>
        </AppBar>
        <div className={classes.btnContainer}>
          <div className={classes.btnRight}>
            <StyledButton variant="contained" onClick={this.importExcelData}>
              Import excel data
            </StyledButton>
          </div>
          <div className={classes.btnRight}>
            <StyledButton variant="contained" onClick={this.save}>
              Save
            </StyledButton>
          </div>
        </div>
        <div className={classes.mainContainer}>
          <form className={classes.form} autoComplete="off">
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="project-select">Project</InputLabel>
              <Select
                value={this.state.projectCode}
                onChange={event => this.handleChange(event, 'project')}
                inputProps={{
                  name: 'projectCode',
                  id: 'project-select',
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {projectTaskReference.map(ref => {
                  return (
                    <MenuItem
                      value={ref.project.projectCode}
                      key={ref.project.projectCode}
                    >
                      {ref.project.projectDescription}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="task-select">Task</InputLabel>
              <Select
                value={this.state.taskId}
                onChange={event => this.handleChange(event, 'task')}
                inputProps={{
                  name: 'taskId',
                  id: 'task-select',
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {project.allTasks.map(task => {
                  return (
                    <MenuItem value={task.taskId} key={task.taskId}>
                      {task.taskDescription}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="category-select">Category</InputLabel>
              <Select
                onClose={this.handleClose}
                onOpen={this.handleOpen}
                value={this.state.middleTaskId}
                onChange={event => this.handleChange(event, 'middle-task')}
                inputProps={{
                  name: 'middleTaskId',
                  id: 'demo-controlled-open-select',
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {task.middleTasks.map(middleTask => {
                  return (
                    <MenuItem value={middleTask.taskId} key={middleTask.taskId}>
                      {middleTask.taskDescription}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="subcategory-select">Sub-category</InputLabel>
              <Select
                value={this.state.lowerTaskId}
                onChange={event => this.handleChange(event, 'lower-task')}
                inputProps={{
                  name: 'lowerTaskId',
                  id: 'subcategory-select',
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {middleTask.lowerTasks.map(lowerTask => {
                  return (
                    <MenuItem value={lowerTask.taskId} key={lowerTask.taskId}>
                      {lowerTask.taskDescription}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </form>
          <div className={classes.table}>
            <Timesheet excelData={this.state.excelData} />
          </div>
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);
