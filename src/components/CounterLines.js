import React from 'react';
import {ToggleButton} from './EditingComponents';
import {TracksLibrary, CounterLine} from '../client/TracksLibrary';
import {localization} from '../client/global';
import {Vector2} from '../utils';

var EditorProperties = {createCounterLine: false}

export class CounterLineComponent extends React.Component{
	constructor(props){
		super(props)
		this.animate = this.animate.bind(this)
		this.divRef = React.createRef()
		this.isAnimating = false

		this.count = 0
		this.countUpdateTimer = 0.0

		this.props.tracksLibrary.onSomeTrackChanged.subscribe(this.forceUpdate.bind(this))
	}
	componentDidMount(){
		this.isAnimating = true
		this.updateCount()
		this.animate()
		this.updateAttributes()
	}
	componentWillUnmount(){
		this.isAnimating = false
	}
	render(){
		this.updateCount()
		return (
			<div className="counter-line" ref={this.divRef}>
				<div className="count">{this.count}</div>
			</div>
		)
	}

	componentDidUpdate(){
		this.updateAttributes()
	}
	updateAttributes(){
		this.divRef.current.setAttribute("data-counter-line-index", this.props.tracksLibrary.getCounterLineIndex(this.props.counterLine))
	}
	
	updateCount(){
		let count = 0
		this.props.tracksLibrary.visibleGroups.forEach((function(group){
			group.tracks.forEach((function(track){
				if(this.props.counterLine.position>=track.startPosition
					&& this.props.counterLine.position<=track.endPosition+1){
					count+=1
				}
			}).bind(this));
		}).bind(this));
		this.count = count
	}

	animate(){
		if(this.isAnimating) window.requestAnimationFrame(this.animate)
		if(!this.divRef.current) return
		let width = 6
		var x = -this.divRef.current.parentNode.parentNode.clientWidth/2.0+(this.props.counterLine.position-this.props.camera.getPosition().x)*this.props.camera.getSize().x
		x-=width/2	
		this.divRef.current.style.left = "" + x + "px"
		this.divRef.current.style.height = "" + this.divRef.current.parentNode.parentNode.clientHeight + "px"
		this.divRef.current.style.width = "" + width + "px"

		this.countUpdateTimer-=1.0/60.0
	}
}

export class CounterLinesContainer extends React.Component{
	constructor(props){
		super(props)
		this.previewCounterLine = new CounterLine(this.props.camera.getPosition().x)
		this.previewCounterLineRef = React.createRef()
		this.divRef = React.createRef()
		this.isAbleToWork = false
		//TODO: move this variable in a controls. and make it relative to timeline rect
		this.mousePosition = new Vector2()
	}
	componentDidMount(){
		this.update()
		this.setupEventListeners()
	}
	
	render(){
		return (
			<div className="counter-lines-container" ref={this.divRef}>
				<CounterLineComponent tracksLibrary={this.props.tracksLibrary} ref={this.previewCounterLineRef} counterLine={this.previewCounterLine} camera={this.props.camera}/>
				{
					this.props.tracksLibrary.counterLines.map(counterLine=>(
						<CounterLineComponent tracksLibrary={this.props.tracksLibrary} counterLine={counterLine} camera={this.props.camera}/>
					))
				}
			</div>
		)
	}
	updateMouseState(e){
		//TODO: also this needs to be moved in some tools controls
		var offsetRect = {x:0, y:0}
		if(e.target.classList.contains("timeline")){
			offsetRect = e.target.getClientRects()[0]
			this.isAbleToWork = true
		}else if(e.target.classList.contains("vertical-scroll")){
			offsetRect = e.target.parentNode.parentNode.getClientRects()[0]
			this.isAbleToWork = true
		}else if(e.target.classList.contains("timeline-canvas")){
			offsetRect = e.target.parentNode.getClientRects()[0]
			this.isAbleToWork = true
		}else if(e.target.classList.contains("group-renderer")){
			offsetRect = e.target.parentNode.parentNode.getClientRects()[0]
			this.isAbleToWork = true
		}else if(e.target.classList.contains("tracks-container")){
			offsetRect = e.target.parentNode.getClientRects()[0]
			this.isAbleToWork = true
		}else{
			this.isAbleToWork = false
		}
		this.mousePosition.set(e.pageX-offsetRect.x, e.pageY-offsetRect.y)
	}
	setupEventListeners(){
		window.addEventListener("mousemove", (e)=>{
			this.updateMouseState(e)
			this.update()
        })
        window.addEventListener("click", (e)=>{
        	this.updateMouseState(e)
        	this.update()
        	this.tryToCreateCounter()
        })
	}
	tryToCreateCounter(){
		if(this.isAbleToWork && EditorProperties.createCounterLine){
			this.props.tracksLibrary.addCounterLine(this.previewCounterLine.position)
		}
		//TODO: change this trick to forceUpdate() everywhere
		this.forceUpdate()
	}
	update(){
		this.previewCounterLineRef.current.divRef.current.style.pointerEvents='none'
		if(this.isAbleToWork && EditorProperties.createCounterLine){
			this.previewCounterLineRef.current.divRef.current.style.display = ''
			this.previewCounterLineRef.current.updateCount()
			this.previewCounterLineRef.current.forceUpdate()
			this.previewCounterLine.position = this.props.camera.getPosition().x 
				+ (this.mousePosition.x-this.divRef.current.parentNode.clientWidth/2)/this.props.camera.getSize().x
		}else{
			this.previewCounterLineRef.current.divRef.current.style.display = 'none'
		}
		
	}
}

export class CounterLinesToolbox extends React.Component{
	constructor(props){
		super(props)
	}
	mouseOverlapping(x, y){
		
	}
	update(){

	}
	render(){
		return (
			<div className="sidebar-section">
				<div className="label">{localization.translate("counter_tools.label")}</div>
                <ToggleButton className="button" object={EditorProperties} valueKey={"createCounterLine"} 
            				text={localization.translate("counter_tools.counter_line_button.text")}/>
            </div>
		)
	}
}