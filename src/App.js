import logo from './logo.svg';
import './App.css';
import React from 'react';

import {client} from './client/client';

import {Timeline} from './components/Timeline';

class App extends React.Component{
  constructor(props){
    super(props)
    this.state = {}
    client.registerAppComponent(this)
  }
  componentDidMount(){
    client.updateVisibleGroups()
  }
  render(){
    return (
      <div className="app">
        <div className="app-grid">
          <div className=""></div>
          <div className=""></div>
          <Timeline/>
        </div>
      </div>
    )
  }
}

export default App;