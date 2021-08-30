import './TracksEditor.css';
import React from 'react';

import { localization, renderToolboxes } from './client/global';
import { TracksLibrary } from './client/TracksLibrary';
import {Timeline} from './components/Timeline';
import {GroupsEditor} from './components/GroupsEditor';
import {ProjectManipulation} from './components/ProjectManipulation';
import {ContextMenu} from './components/ContextMenu';


class TracksEditor extends React.Component{
  constructor(props){
    super(props)
    this.state = {}

    this.onTranslationChanged = this.onTranslationChanged.bind(this)
    this.onProjectLoaded = this.onProjectLoaded.bind(this)
    localization.loadDefaultLocalization()
    localization.setLocale("en")

    this.tracksLibrary = new TracksLibrary()

    window.tracksLibrary = this.tracksLibrary
    this.tracksLibrary.addTestGroup(this.tracksLibrary.getCurrentDayPosition())
    this.tracksLibrary.addTestGroup(this.tracksLibrary.getCurrentDayPosition())

    this.tracksLibrary.onProjectLoaded.subscribe(this.onProjectLoaded)
  }
  componentDidMount(){
    localization.onTranslationChanged.subscribe(this.onTranslationChanged)
  }
  onTranslationChanged(){
    this.forceUpdate()
  }
  onProjectLoaded(){
    this.forceUpdate()
  }
  render(){
    return (
      <div className="timeline-editor">
        <div className="timeline-editor-horizontal-grid">
          <div className="sidebar">
            <ProjectManipulation tracksLibrary={this.tracksLibrary}/>
            {renderToolboxes()}
          </div>
          <div className="timeline-editor-grid">
            <div className=""></div>
            <GroupsEditor tracksLibrary={this.tracksLibrary}/>
            <Timeline tracksLibrary={this.tracksLibrary}/>
            <ContextMenu tracksLibrary={this.tracksLibrary}/>
          </div>
        </div>
      </div>
    )
  }
}

export default TracksEditor;