import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Home from './components/home/Home';
import Signin from './components/signin/Signin';
import Navigation from './components/navigation/Navigation';
import blue from '@material-ui/core/colors/blue';
import red from '@material-ui/core/colors/red';
const { ipcRenderer } = window.require('electron');

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
    csrfToken: '',
    value: 0,
  };

  componentDidMount() {
    ipcRenderer.on('csrf-token', (event, csrfToken) => {
      console.error(csrfToken);
      this.csrfToken = csrfToken;
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
              <Route
                exact
                path="/"
                render={props => (
                  <Home {...props} csrfToken={this.state.csrfToken} />
                )}
              />
              <Route exact path="/signin" component={Signin} />
            </Switch>
          </div>
        </BrowserRouter>
      </MuiThemeProvider>
    );
  }
}

export default App;
