import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Home from './components/home/Home';
import Signin from './components/signin/Signin';
import Navigation from './components/navigation/Navigation';
import blue from '@material-ui/core/colors/blue';
import red from '@material-ui/core/colors/red';
import { Redirect } from 'react-router-dom';
const { ipcRenderer } = window.require('electron');
const Store = window.require('electron-store');
const store = new Store();

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: red,
  },
  status: {
    danger: 'orange',
  },
});

class App extends Component {
  state = {
    isLoggedIn: false,
  };

  componentDidMount() {
    ipcRenderer.on('logged-in', (event, { emailAddress, password }) => {
      this.isLoggedIn = true;
      store.set({
        credentials: {
          emailAddress,
          password,
        },
      });
    });
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <div>
            <Navigation />
            <Switch>
              <Route exact path="/home" render={props => <Home {...props} />} />
              <Route exact path="/signin" component={Signin} />
              <Redirect to="/signin" />
            </Switch>
          </div>
        </BrowserRouter>
      </MuiThemeProvider>
    );
  }
}

export default App;
