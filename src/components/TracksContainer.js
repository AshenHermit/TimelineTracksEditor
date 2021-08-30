import React from 'react';
import {clip} from 'mathjs'
import {EditableLabel} from './EditingComponents';

class TrackStretchRegion extends React.Component{
    static Direction = Object.freeze({"Start":0, "End":1})
    constructor(props){
        super(props)
        this.additionalClasses = ["left", "right"]
        this.additionalClassName = this.additionalClasses[this.props.direction]
        this.isUsing = false
        this.divRef = React.createRef()

        this.showCount = true
        this.trackOfCopies = this.props.track
        this.startPositionCopy = this.props.track.startPosition
        this.endPositionCopy = this.props.track.endPosition
    }
    componentDidMount(){
        this.setupEventListeners()
        this.updatePositionCopies()
    }
    componentDidUpdate(){
        this.updatePositionCopies()
    }
    updatePositionCopies(){
        if(this.props.track != this.trackOfCopies){
            this.trackOfCopies = this.props.track
            this.startPositionCopy = this.props.track.startPosition
            this.endPositionCopy = this.props.track.endPosition
        }
    }
    startUsing(showCount = true){
        this.showCount = showCount
        this.isUsing = true
        document.body.style.cursor = "e-resize"
        this.forceUpdate()
    }
    stopUsing(){
        this.isUsing = false

        this.startPositionCopy = Math.round(this.startPositionCopy)
        this.endPositionCopy = Math.round(this.endPositionCopy)
        document.body.style.cursor = ""
        this.forceUpdate()
    }
    drag(directionX){
        //TODO: needs refactor
        if(this.props.direction == TrackStretchRegion.Direction.Start){
            this.startPositionCopy += directionX / this.props.camera.getSize().x
            let newPos = Math.min(this.props.track.endPosition, Math.round(this.startPositionCopy))
            if(newPos!=this.props.track.startPosition){
                this.props.track.startPosition = newPos
                this.props.tracksLibrary.signalAboutTrackChange()
                this.forceUpdate()
            }
        }
        if(this.props.direction == TrackStretchRegion.Direction.End){
            this.endPositionCopy += directionX / this.props.camera.getSize().x
            let newPos = Math.max(this.props.track.startPosition, Math.round(this.endPositionCopy))
            if(newPos!=this.props.track.endPosition){
                this.props.track.endPosition = newPos
                this.props.tracksLibrary.signalAboutTrackChange()
                this.forceUpdate()
            }
        }
    }
    setupEventListeners(){
        this.divRef.current.addEventListener("mousedown", (e)=>{
            if(e.button == 0) this.startUsing()
        })
        window.addEventListener("mouseup", (e)=>{
            if(e.button == 0) this.stopUsing()
        })
        window.addEventListener("mousemove", (e)=>{
            if(this.isUsing){
                this.drag(e.movementX)
            }
        })
    }
    render(){
        var length = (this.props.track.endPosition-this.props.track.startPosition)+1
        return (
            <div className={"stretch-region " + this.additionalClassName} ref={this.divRef}>
                {(this.isUsing&&this.showCount) ? (<div className="label">{length}</div>) : ""}
            </div>
        )
    }
}

class TrackRenderer extends React.Component{
    constructor(props){
        super(props)
        this.animate = this.animate.bind(this)

        this.divRef = React.createRef()
        this.nameRef = React.createRef()
        this.stretchRegions = [React.createRef(), React.createRef()]
        
        this.updating = false
    }
    render(){
        return (
            <div className="track" ref={this.divRef} style={{backgroundColor: this.props.group.color}}>
                <TrackStretchRegion ref={this.stretchRegions[0]} track={this.props.track} direction={TrackStretchRegion.Direction.Start} tracksLibrary={this.props.tracksLibrary} camera={this.props.camera}/>
                <EditableLabel className="name" object={this.props.track} valueKey="name" ref={this.nameRef}/>
                <TrackStretchRegion ref={this.stretchRegions[1]} track={this.props.track} direction={TrackStretchRegion.Direction.End} tracksLibrary={this.props.tracksLibrary} camera={this.props.camera}/>
            </div>
        )
    }
    componentDidMount(){
        this.updating = true
        this.animate()
        this.componentDidUpdate()
        this.setupEventListeners()
    }
    componentDidUpdate(){
        this.divRef.current.setAttribute("data-group-index", this.props.tracksLibrary.getGroupIndex(this.props.group))
        this.divRef.current.setAttribute("data-track-index", this.props.group.getTrackIndex(this.props.track))
    }
    componentWillUnmount(){
        this.updating = false
    }
    animate(){
        if(this.updating) requestAnimationFrame(this.animate)
        if(this.divRef.current == null) return
        let containerWidth = this.divRef.current.parentNode.parentNode.parentNode.clientWidth

        let xPos = (this.props.track.startPosition - this.props.camera.getPosition().x)*this.props.camera.getSize().x + containerWidth/2.0
        xPos = Math.max(0, xPos)
        let width = (this.props.track.endPosition + 1 - this.props.camera.getPosition().x)*this.props.camera.getSize().x + containerWidth/2.0 - xPos
        width = Math.max(0, Math.min(width, containerWidth-xPos))
        
        this.divRef.current.style.left = "" + xPos + "px"
        this.divRef.current.style.width = "" + width + "px"
        this.divRef.current.style.height = "" + (this.props.camera.getSize().y*0.8) + "px"
        this.divRef.current.style.marginTop = "" + (this.props.camera.getSize().y*0.2) + "px"
        
        if(this.props.camera.getSize().y<8){
            this.nameRef.current.elementRef.current.style.display = "none"
            for (let i = 0; i < this.stretchRegions.length; i++) {
                this.stretchRegions[i].current.divRef.current.style.display = "none"
            }
        }
        else{
            this.nameRef.current.elementRef.current.style.display = ""
            for (let i = 0; i < this.stretchRegions.length; i++) {
                this.stretchRegions[i].current.divRef.current.style.display = ""
            }
        }
    }

    setupEventListeners(){
        this.divRef.current.addEventListener("mousedown", (e)=>{
            if(e.target.classList.contains("track") && e.button==0){
                this.stretchRegions[0].current.startUsing(false)
                this.stretchRegions[1].current.startUsing(false)
            }
        })
    }
}

class GroupRenderer extends React.Component{
    constructor(props){
        super(props)
        this.divRef = React.createRef()
    }
    render(){
        return (
            <div ref={this.divRef} className="group group-renderer">
                {
                    this.props.group.tracks.map((track, i)=>{
                        return (<TrackRenderer group={this.props.group} track={track} camera={this.props.camera} key={track.name+i} tracksLibrary={this.props.tracksLibrary}/>)
                    })
                }
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


export class TracksContainer extends React.Component{
    constructor(props){
        super(props)

        this.update = this.update.bind(this)
        this.divRef = React.createRef()
        this.verticalScrollRef = React.createRef()
    }
    render(){
        return (
            <div className="tracks-container" ref={this.divRef}>
                <div className="vertical-scroll" ref={this.verticalScrollRef}>
                    {
                        this.props.groups.map((group, i)=>{
                            return (<GroupRenderer group={group} camera={this.props.camera} key={group.name+i} tracksLibrary={this.props.tracksLibrary}/>)
                        })
                    }
                </div>
            </div>
        )
    }
    // called in Timeline
    update(){
        if(this.divRef.current==null) return
        
        this.divRef.current.style.width = ""+this.divRef.current.parentNode.clientWidth+"px"
        this.divRef.current.style.height = ""+(this.divRef.current.parentNode.clientHeight-55)+"px"
        this.divRef.current.style.marginTop = ""+55+"px"

        this.verticalScrollRef.current.style.marginTop = ""+(-this.props.camera.getPosition().y*this.props.camera.getSize().y)+"px"
    }
}
