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
    project: '',
    task: '',
    category: '',
    subcategory: '',
  };

  componentDidMount(nextProps, nextState) {
    console.error(this.props.data);
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { classes } = this.props;
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
              value={this.state.project}
              onChange={this.handleChange}
              inputProps={{
                name: 'project',
                id: 'project-select',
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="task-select">Task</InputLabel>
            <Select
              value={this.state.task}
              onChange={this.handleChange}
              inputProps={{
                name: 'task',
                id: 'task-select',
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="category-select">Category</InputLabel>
            <Select
              onClose={this.handleClose}
              onOpen={this.handleOpen}
              value={this.state.category}
              onChange={this.handleChange}
              inputProps={{
                name: 'category',
                id: 'demo-controlled-open-select',
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </FormControl>
          <FormControl className={classes.formControl}>
            <InputLabel htmlFor="subcategory-select">Sub-category</InputLabel>
            <Select
              value={this.state.subcategory}
              onChange={this.handleChange}
              inputProps={{
                name: 'subcategory',
                id: 'subcategory-select',
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
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
