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
import { Redirect } from 'react-router-dom';

const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

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
    '&>input[tyle=button]': {
      background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      borderRadius: 3,
      border: 0,
      color: 'white',
      height: 48,
      padding: '0 30px',
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    },
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

const mockData = {
  projectTaskDetail: [],
  isRequestWorktimeDisabled: true,
  worktimeConfirmer: '-',
  projectTaskReference: [
    {
      project: {
        projectCode: 'BH004',
        projectName: null,
        projectDescription: 'R&amp;D-SSOL全社業務',
        companyCode: null,
        startDate: null,
        endDate: null,
      },
      allTasks: [
        {
          taskId: 'BH00400101',
          taskDescription: 'R&amp;D-SSOL全社業務',
          upperCategoryTaskId: null,
          startDate: 1459436400000,
          endDate: 1585580400000,
          middleTasks: [
            {
              taskId: 'BH00400101-99',
              taskDescription: 'プロジェクト管理',
              upperCategoryTaskId: 'BH00400101',
              startDate: 1459436400000,
              endDate: 1585580400000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BH00400101-T20000001',
              taskDescription: '10.新卒研修',
              upperCategoryTaskId: 'BH00400101',
              startDate: 1459436400000,
              endDate: 1585580400000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BH00400101-T20000002',
              taskDescription: '11.IBSカレッジ',
              upperCategoryTaskId: 'BH00400101',
              startDate: 1459436400000,
              endDate: 1585580400000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BH00400101-T20000003',
              taskDescription: '20.新卒採用支援',
              upperCategoryTaskId: 'BH00400101',
              startDate: 1459436400000,
              endDate: 1585580400000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BH00400101-T20000004',
              taskDescription: '21.中途採用支援',
              upperCategoryTaskId: 'BH00400101',
              startDate: 1459436400000,
              endDate: 1585580400000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BH00400101-T20000005',
              taskDescription: '30.他部門問合せ対応',
              upperCategoryTaskId: 'BH00400101',
              startDate: 1459436400000,
              endDate: 1585580400000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BH00400101-T20000006',
              taskDescription: '31.他部門PJ支援',
              upperCategoryTaskId: 'BH00400101',
              startDate: 1459436400000,
              endDate: 1585580400000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BH00400101-T20000007',
              taskDescription: '32.他部門施策支援',
              upperCategoryTaskId: 'BH00400101',
              startDate: 1459436400000,
              endDate: 1585580400000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BH00400101-T20000008',
              taskDescription: '40.情シス支援',
              upperCategoryTaskId: 'BH00400101',
              startDate: 1459436400000,
              endDate: 1585580400000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BH00400101-T20000009',
              taskDescription: '41.営業部支援',
              upperCategoryTaskId: 'BH00400101',
              startDate: 1459436400000,
              endDate: 1585580400000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BH00400101-T20000010',
              taskDescription: '50.IBS標準策定',
              upperCategoryTaskId: 'BH00400101',
              startDate: 1459436400000,
              endDate: 1585580400000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BH00400101-T20000011',
              taskDescription: '51.IBS案件審議',
              upperCategoryTaskId: 'BH00400101',
              startDate: 1459436400000,
              endDate: 1585580400000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BH00400101-T20000012',
              taskDescription: '90.その他',
              upperCategoryTaskId: 'BH00400101',
              startDate: 1459436400000,
              endDate: 1585580400000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
          ],
          lowerTasks: null,
          taskLevel: '1',
        },
      ],
      allTasksMap: null,
    },
    {
      project: {
        projectCode: 'BH013',
        projectName: null,
        projectDescription: 'HITO-Link_パフォーマンス_PPT保守運用',
        companyCode: null,
        startDate: null,
        endDate: null,
      },
      allTasks: [
        {
          taskId: 'BH01300101',
          taskDescription: 'HITO-Link_P_PPT保守運用',
          upperCategoryTaskId: null,
          startDate: 1522508400000,
          endDate: 1735570800000,
          middleTasks: [
            {
              taskId: 'BH01300101-99',
              taskDescription: 'プロジェクト管理',
              upperCategoryTaskId: 'BH01300101',
              startDate: 1522508400000,
              endDate: 1735570800000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BH01300101-T20000001',
              taskDescription: '保守運用',
              upperCategoryTaskId: 'BH01300101',
              startDate: 1522508400000,
              endDate: 1735570800000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BH01300101-T20000002',
              taskDescription: '改善施策',
              upperCategoryTaskId: 'BH01300101',
              startDate: 1522508400000,
              endDate: 1735570800000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
          ],
          lowerTasks: null,
          taskLevel: '1',
        },
      ],
      allTasksMap: null,
    },
    {
      project: {
        projectCode: 'BK032',
        projectName: null,
        projectDescription: 'HITO-Linkサービス開発_2018_パフォーマンス',
        companyCode: null,
        startDate: null,
        endDate: null,
      },
      allTasks: [
        {
          taskId: 'BK03200101',
          taskDescription: 'HLサービス開発_2018_P',
          upperCategoryTaskId: null,
          startDate: 1522508400000,
          endDate: 1553958000000,
          middleTasks: [
            {
              taskId: 'BK03200101-30',
              taskDescription: '自社開発(※非利用)',
              upperCategoryTaskId: 'BK03200101',
              startDate: 1522508400000,
              endDate: 1553958000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BK03200101-99',
              taskDescription: 'プロジェクト管理',
              upperCategoryTaskId: 'BK03200101',
              startDate: 1522508400000,
              endDate: 1553958000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BK03200101-T20000001',
              taskDescription: '要件定義',
              upperCategoryTaskId: 'BK03200101',
              startDate: 1522508400000,
              endDate: 1553958000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BK03200101-T20000002',
              taskDescription: '基本設計',
              upperCategoryTaskId: 'BK03200101',
              startDate: 1522508400000,
              endDate: 1553958000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BK03200101-T20000003',
              taskDescription: '詳細設計',
              upperCategoryTaskId: 'BK03200101',
              startDate: 1522508400000,
              endDate: 1553958000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BK03200101-T20000004',
              taskDescription: '製造・単体テスト',
              upperCategoryTaskId: 'BK03200101',
              startDate: 1522508400000,
              endDate: 1553958000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BK03200101-T20000005',
              taskDescription: '結合テスト',
              upperCategoryTaskId: 'BK03200101',
              startDate: 1522508400000,
              endDate: 1553958000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BK03200101-T20000006',
              taskDescription: 'システムテスト',
              upperCategoryTaskId: 'BK03200101',
              startDate: 1522508400000,
              endDate: 1553958000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BK03200101-T20000007',
              taskDescription: 'ユーザ受入テスト',
              upperCategoryTaskId: 'BK03200101',
              startDate: 1522508400000,
              endDate: 1553958000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BK03200101-T20000008',
              taskDescription: '保守運用',
              upperCategoryTaskId: 'BK03200101',
              startDate: 1522508400000,
              endDate: 1553958000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BK03200101-T20000009',
              taskDescription: '改善施策',
              upperCategoryTaskId: 'BK03200101',
              startDate: 1522508400000,
              endDate: 1553958000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
          ],
          lowerTasks: null,
          taskLevel: '1',
        },
      ],
      allTasksMap: null,
    },
    {
      project: {
        projectCode: 'BG358',
        projectName: null,
        projectDescription:
          'ｼｽﾃﾑｿﾘｭｰｼｮﾝ事業部HITO-Linkｻｰﾋﾞｽ開発部HITO-LinkﾊﾟﾌｫｰﾏﾝｽG',
        companyCode: null,
        startDate: null,
        endDate: null,
      },
      allTasks: [
        {
          taskId: 'BG35800101',
          taskDescription: '自部門作業',
          upperCategoryTaskId: null,
          startDate: 1522508400000,
          endDate: 4102326000000,
          middleTasks: [
            {
              taskId: 'BG35800101-99',
              taskDescription: 'プロジェクト管理',
              upperCategoryTaskId: 'BG35800101',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800101-T10000300',
              taskDescription: 'その他',
              upperCategoryTaskId: 'BG35800101',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800101-T10000301',
              taskDescription: '各種会議',
              upperCategoryTaskId: 'BG35800101',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800101-T10000302',
              taskDescription: '部門管理業務',
              upperCategoryTaskId: 'BG35800101',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800101-T10000303',
              taskDescription: '採用活動',
              upperCategoryTaskId: 'BG35800101',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
          ],
          lowerTasks: null,
          taskLevel: '1',
        },
        {
          taskId: 'BG35800201',
          taskDescription: 'プレ･受注活動',
          upperCategoryTaskId: null,
          startDate: 1522508400000,
          endDate: 4102326000000,
          middleTasks: [
            {
              taskId: 'BG35800201-99',
              taskDescription: 'プロジェクト管理',
              upperCategoryTaskId: 'BG35800201',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800201-T10000300',
              taskDescription: 'その他',
              upperCategoryTaskId: 'BG35800201',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800201-T10000301',
              taskDescription: '各種会議',
              upperCategoryTaskId: 'BG35800201',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800201-T10000302',
              taskDescription: '部門管理業務',
              upperCategoryTaskId: 'BG35800201',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800201-T10000303',
              taskDescription: '採用活動',
              upperCategoryTaskId: 'BG35800201',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
          ],
          lowerTasks: null,
          taskLevel: '1',
        },
        {
          taskId: 'BG35800301',
          taskDescription: '教育・研修・勉強会',
          upperCategoryTaskId: null,
          startDate: 1522508400000,
          endDate: 4102326000000,
          middleTasks: [
            {
              taskId: 'BG35800301-99',
              taskDescription: 'プロジェクト管理',
              upperCategoryTaskId: 'BG35800301',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800301-T10000300',
              taskDescription: 'その他',
              upperCategoryTaskId: 'BG35800301',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800301-T10000301',
              taskDescription: '各種会議',
              upperCategoryTaskId: 'BG35800301',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800301-T10000302',
              taskDescription: '部門管理業務',
              upperCategoryTaskId: 'BG35800301',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800301-T10000303',
              taskDescription: '採用活動',
              upperCategoryTaskId: 'BG35800301',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
          ],
          lowerTasks: null,
          taskLevel: '1',
        },
        {
          taskId: 'BG35800401',
          taskDescription: '待機',
          upperCategoryTaskId: null,
          startDate: 1522508400000,
          endDate: 4102326000000,
          middleTasks: [
            {
              taskId: 'BG35800401-99',
              taskDescription: 'プロジェクト管理',
              upperCategoryTaskId: 'BG35800401',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800401-T10000300',
              taskDescription: 'その他',
              upperCategoryTaskId: 'BG35800401',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800401-T10000301',
              taskDescription: '各種会議',
              upperCategoryTaskId: 'BG35800401',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800401-T10000302',
              taskDescription: '部門管理業務',
              upperCategoryTaskId: 'BG35800401',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800401-T10000303',
              taskDescription: '採用活動',
              upperCategoryTaskId: 'BG35800401',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
            {
              taskId: 'BG35800401-T10000330',
              taskDescription: 'アサイン待ち',
              upperCategoryTaskId: 'BG35800401',
              startDate: 1522508400000,
              endDate: 4102326000000,
              middleTasks: null,
              lowerTasks: [],
              taskLevel: '2',
            },
          ],
          lowerTasks: null,
          taskLevel: '1',
        },
      ],
      allTasksMap: null,
    },
  ],
  isCancelWorktimeDisabled: true,
  isCopyWorktimeDisabled: false,
};

export default withStyles(styles)(Home);
