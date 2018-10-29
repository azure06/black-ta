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
  formControl: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: 'rgba(250,250,250,1)',
    margin: '2vw 2.5vw 0 2.5vw',
    borderRadius: '5px',
    height: 45,
    '&>div': {
      padding: '20px',
    },
  },
  btn: {
    marginTop: '20px',
    textAlign: 'center',
  },
  btnRight: {
    margin: '2vw 2.5vw 0 2.5vw',
    textAlign: 'right',
  },
});

class Home extends Component {
  state = {
    data: null,
    projectCode: '',
    taskId: '',
    middleTaskId: '',
    lowerTaskId: '',
  };

  componentDidMount(nextProps, nextState) {
    ipcRenderer.send('retrieve-daily-attendance-project-tasks', {});
    ipcRenderer.on('project-data', (event, data) => {
      this.setState({
        data,
      });
    });
  }

  importExcelData() {
    /* show a file-open dialog and read the first selected file */
    const o = dialog.showOpenDialog({ properties: ['openFile'] });
    if (!o) return;
    const workbook = XLSX.readFile(o[0]);
    const [sheetName] = workbook.SheetNames;
    const data = workbook.Sheets[sheetName];

    const result = {};

    Object.keys(data).map(key => {
      const w = data[key].w;
      !result[key.substring(1)]
        ? (result[key.substring(1)] = [{ [key]: w }])
        : result[key.substring(1)].push({ [key]: w });
    });
    console.error(result);
  }

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
      console.error(this.state);
    }, 0);
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
        <div className={this.props.classes.btnRight}>
          <StyledButton
            variant="contained"
            size="large"
            onClick={this.importExcelData}
            color="primary"
          >
            Import excel data
          </StyledButton>
        </div>
        <form autoComplete="off">
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
        <div className={this.props.classes.btn}>
          <StyledButton
            variant="contained"
            size="large"
            onClick={this.signIn}
            color="primary"
          >
            Submit
          </StyledButton>
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);
