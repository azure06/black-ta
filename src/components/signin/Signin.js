import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import red from '@material-ui/core/colors/red';
import './Signin.css';
const electron = window.require('electron');
const ipcRenderer = electron.ipcRenderer;

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: red,
  },
  status: {
    danger: 'orange',
  },
});

export class Signin extends Component {
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
      <MuiThemeProvider theme={theme}>
        <div>
          <div className="header">
            <h1> Sign in</h1>
            <p> with your Account</p>
          </div>
          <form noValidate autoComplete="off" className="signin container">
            <div>
              <TextField
                id="email-address"
                label="Email address"
                value={this.state.emailAddress}
                onChange={this.handleChange('emailAddress')}
                margin="normal"
              />
            </div>
            <div>
              <TextField
                id="password"
                label="Password"
                type="password"
                value={this.state.password}
                onChange={this.handleChange('password')}
                margin="normal"
              />
            </div>
          </form>
          <div className="btn">
            <Button
              variant="contained"
              size="large"
              onClick={this.signIn}
              color="primary"
            >
              Signin
            </Button>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}
