import React from 'react';
import {EditableLabel} from './EditingComponents';
import {localization} from '../client/global';

export class AddGroupButton extends React.Component{
	constructor(props){
		super(props)
		this.onClick = this.onClick.bind(this)
	}
	onClick(){
		this.props.tracksLibrary.addGroup(localization.translate("new_group.name"))
	}
	render(){
		return (
			<div onClick={this.onClick} className="button add-group-button group-item">
				{localization.translate("add_group_button.text")}
			</div>
		)
	}
}

export class GroupItem extends React.Component{
	constructor(props){
		super(props)
		this.divRef = React.createRef()
		this.onColorDisplayClick = this.onColorDisplayClick.bind(this)
		this.onGroupVisibilityClick = this.onGroupVisibilityClick.bind(this)
	}
	onColorDisplayClick(){
		this.props.tracksLibrary.setGroupColor(this.props.group, this.props.tracksLibrary.getNextGroupColor(this.props.group.color))
		this.forceUpdate()
	}
	onGroupVisibilityClick(){
		this.props.tracksLibrary.toggleGroupVisibility(this.props.group)
		this.forceUpdate()
	}
	render(){
		return (
			<div ref={this.divRef} className={"group-item " + (this.props.group.visible ? "" : "invisible")}>
				<div onClick={this.onGroupVisibilityClick} size="" className={"button " + (this.props.group.visible ? "" : "")}>
					{this.props.group.visible ? localization.translate("group.visibility_button.active.text")
					: localization.translate("group.visibility_button.inactive.text")}
				</div>
				<div className="button color-display" onClick={this.onColorDisplayClick} style={{backgroundColor: this.props.group.color}}></div>

				<EditableLabel className="name" object={this.props.group} valueKey="name"/>
			</div>
		)
	}
	componentDidMount(){
		this.setupAttributes()
	}
	componentDidUpdate(){
		this.setupAttributes()
	}
	setupAttributes(){
		this.divRef.current.setAttribute("data-group-index", this.props.tracksLibrary.getGroupIndex(this.props.group))
	}
}

export class GroupsEditor extends React.Component{
	constructor(props){
		super(props)
	}
	componentDidMount(){
		this.props.tracksLibrary.onVisibleGroupsChanged.subscribe(this.forceUpdate.bind(this))
	}
	render(){
		return (
			<div className="groups-editor">
			{Object.values(this.props.tracksLibrary.groups).map((group, i)=>(
				<GroupItem tracksLibrary={this.props.tracksLibrary} group={group} key={group.name+i}/>
			))}
			<AddGroupButton tracksLibrary={this.props.tracksLibrary}/>
			</div>
		)
	}
}

