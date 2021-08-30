import React from 'react';
import {EditableLabel} from './EditingComponents';
import {localization} from '../client/global';
import {MakeOpenFileDialog} from '../utils';

export class ProjectManipulation extends React.Component{
    constructor(props){
        super(props)
        this.onOpenFileButtonPressed = this.onOpenFileButtonPressed.bind(this)
        this.onSaveFileButtonPressed = this.onSaveFileButtonPressed.bind(this)
        this.openedFilepath = ""
    }

    render(){
        let openedFilenameLabel = ""
        if(this.openedFilepath!=""){
            let filepath = this.openedFilepath
            if(this.openedFilepath instanceof File) filepath = this.openedFilepath.name
            openedFilenameLabel = localization.translate("current_filepath_label.text") + ":\n" + filepath
        }
        return [
            (<div className="sidebar-title-container">
                <EditableLabel className="project-title" object={this.props.tracksLibrary} valueKey="title"/>
            </div>),
            (<div className="sidebar-section">
                <div className="label">{openedFilenameLabel}</div>
                <div onClick={this.onSaveFileButtonPressed} className="button">{localization.translate("save_button.text")}</div>
                <div onClick={this.onOpenFileButtonPressed} className="button">{localization.translate("open_button.text")}</div>
            </div>)
        ]
    }

    onOpenFileButtonPressed(){
        MakeOpenFileDialog(((filepath)=>{
            this.openedFilepath = filepath
            this.props.tracksLibrary.loadFromFile(filepath)
            this.forceUpdate()
        }).bind(this))
    }
    onSaveFileButtonPressed(){
        this.props.tracksLibrary.saveToFile(this.openedFilepath, (filepath)=>{
            this.openedFilepath = filepath
            this.forceUpdate()
        })
    }
}