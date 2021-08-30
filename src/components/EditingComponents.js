import React from 'react';

export class EditableLabel extends React.Component{
	constructor(props){
		super(props)
		this.elementRef = React.createRef()
		this.onDoubleClick = this.onDoubleClick.bind(this)
		this.isEditing = false
		this.labelWidth = 0
	}
	componentDidMount(){
		this.setupEventListeners()
		this.componentDidUpdate()
	}
	componentDidUpdate(){
		if("value" in this.elementRef.current){
			this.elementRef.current.value = this.getValue()
			// this.elementRef.current.style.width = "calc(" + (this.labelWidth+16) + "px)"
			this.elementRef.current.size = this.getValue().length
		}else{
			let style = window.getComputedStyle(this.elementRef.current)
			let parentStyle = window.getComputedStyle(this.elementRef.current.parentNode)
			let division = style.fontSize.replace("px", "")-0
			let substract = (parentStyle.padding.replace("px", "")-0)
			this.labelWidth = this.elementRef.current.clientWidth * (Math.max(1, (this.elementRef.current.clientHeight-substract)/division))
		}

	}
	setupEventListeners(){
		window.addEventListener('mousedown', (function(e){
			if(this.isEditing){
				if(e.target != this.elementRef.current){
					this.setEditingState(false)
				}
			}
		}).bind(this));
		window.addEventListener('keydown', (function(e){
			if(this.isEditing){
				if(e.code == "Enter"){
					this.setEditingState(false)
				}
			}
		}).bind(this));
	}
	onDoubleClick(){
		this.setEditingState(!this.isEditing)
	}
	setEditingState(state){
		if(!state){
			this.applyChanges()
		}
		this.isEditing = state
		this.forceUpdate()
	}
	applyChanges(){
		this.props.object[this.props.valueKey] = this.elementRef.current.value
	}
	getValue(){
		return this.props.object[this.props.valueKey]
	}
	render(){
		let className = ("className" in this.props ? this.props.className : "")
		if(this.isEditing){
			return (
				<input type="text" className={className+" editable-label input"} ref={this.elementRef}/>
			)
		}else{
			return (
				<div onDoubleClick={this.onDoubleClick} className={className+" editable-label label"} ref={this.elementRef}>
					{this.getValue()}
				</div>
			)
		}
	}
}

export class ToggleButton extends React.Component{
	constructor(props){
		super(props)
		this.onClick = this.onClick.bind(this)
	}
	onClick(){
		this.setToggleState(!this.isToggled())
	}
	setToggleState(state){
		this.props.object[this.props.valueKey] = state
		this.forceUpdate()
	}
	isToggled(){
		return this.props.object[this.props.valueKey]
	}
	render(){
		let className = ("className" in this.props ? this.props.className : "")
		return (
			<div onClick={this.onClick} className={className + " toggle-button " + (this.isToggled() ? "active" : "inactive")}>
				{this.props.text}
			</div>
		)
	}
}