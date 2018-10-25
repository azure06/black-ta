import React, { Component } from 'react';
import './App.css';
import { Signin } from './components/signin/Signin';

class App extends Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };
  render() {
    return (
      <div className="App">
        <Signin />
      </div>
    );
  }
}

export default App;
