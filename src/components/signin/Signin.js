import React, { Component } from 'react';
import { StyledButton } from './../styled-components/StyledComponents';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import './Signin.css';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const styles = {
  header: {
    marginTop: '10vw',
    textAlign: 'center',
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    '&>div': {
      minWidth: '300px',
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
};

class Signin extends Component {
  state = {
    emailAddress: '',
    password: '',
  };

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  signIn = event => {
    ipcRenderer.send('credentials', {
      ...this.state,
    });
  };

  render() {
    return (
      <div className={this.props.classes.container}>
        <div className={this.props.classes.header}>
          <h1> Sign in</h1>
          <p> with your Account</p>
        </div>
        <form
          noValidate
          autoComplete="off"
          className={this.props.classes.container}
        >
          <TextField
            id="email-address"
            label="Email address"
            value={this.state.emailAddress}
            onChange={this.handleChange('emailAddress')}
            margin="normal"
          />

          <TextField
            id="password"
            label="Password"
            type="password"
            value={this.state.password}
            onChange={this.handleChange('password')}
            margin="normal"
          />
        </form>
        <div className={this.props.classes.btn}>
          <StyledButton
            variant="contained"
            size="large"
            onClick={this.signIn}
            color="primary"
          >
            Signin
          </StyledButton>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Signin);
