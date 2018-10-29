import React, { Component } from 'react';
import { StyledButton } from './../styled-components/StyledComponents';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import './Signin.css';
import { Z_FIXED } from 'zlib';
const electron = window.require('electron');
const Store = window.require('electron-store');
const store = new Store();
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
  spinner: {
    position: 'fixed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(230,230,230, 0.50)',
    minWidth: 'unset !important',
    borderRadius: '50%',
    width: '150px',
    height: '150px',
  },
};

class Signin extends Component {
  state = {
    emailAddress: '',
    password: '',
    connecting: false,
  };

  componentDidMount() {
    const credentials = store.get('credentials');
    if (credentials) {
      this.setState({
        emailAddress: credentials.emailAddress,
        password: credentials.password,
      });
    }

    ipcRenderer.on('logged-in', (event, data) => {
      this.setState({
        connecting: false,
      });
      this.props.history.push('/home');
    });
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  signIn = event => {
    this.setState({
      connecting: true,
    });
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
        {this.state.connecting ? (
          <div className={this.props.classes.spinner}>
            <CircularProgress size={100} />
          </div>
        ) : (
          <div />
        )}
      </div>
    );
  }
}

export default withStyles(styles)(Signin);
