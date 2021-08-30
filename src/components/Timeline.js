import React from 'react';
import { TracksLibrary } from '../client/TracksLibrary';

import {Canvas} from './Canvas'
import {TracksContainer} from './TracksContainer'
import { Vector2 } from '../utils';
import { localization, renderTimelineAddons } from '../client/global';
import {EventHandler} from 'event-js'

class Camera{
  constructor(position=new Vector2(), size=new Vector2(64,32)){
    this._targetPosition = position
    this.position = Vector2.copy(this._targetPosition)

    this._targetSize = size
    this.size = Vector2.copy(this._targetSize)

    this.zoomSpeed = 0.1
  }

  setPosition(pos){
    this._targetPosition.set(pos.x, pos.y)
  }
  getPosition(){
    return this.position 
  }
  getSize(){
    return this.size
  }

  drag(x, y){
    this._targetPosition.x+=x
    this._targetPosition.y+=y
  }
  zoom(deltaX=0, deltaY=0){
    var newSizeX = Math.max(1, this._targetSize.x+this._targetSize.x*deltaX*this.zoomSpeed)
    var newSizeY = Math.max(1, this._targetSize.y+this._targetSize.y*deltaY*this.zoomSpeed)
    // this._targetPosition.x -= (newSizeX-this._targetSize.x)/2.0
    // this._targetPosition.y += deltaY*newSizeY*this.zoomSpeed*2.0

    this._targetSize.x = newSizeX
    this._targetSize.y = newSizeY
  }
  
  update(){
    this.position.x+=(this._targetPosition.x-this.position.x)/2.0
    this.position.y+=(this._targetPosition.y-this.position.y)/2.0

    this.size.x+=(this._targetSize.x-this.size.x)/2.0
    this.size.y+=(this._targetSize.y-this.size.y)/2.0
  }
}

export class Timeline extends React.Component{
  constructor(props){
    super(props)
    this.state = {"groups": []}

    this.timelineRef = React.createRef()
    this.canvasComponentRef = React.createRef()
    this.tracksContainerRef = React.createRef()

    this.camera = new Camera(new Vector2(this.props.tracksLibrary.getCurrentDayPosition()+0.5, 0))
    window.camera = this.camera
    this.animate = this.animate.bind(this)

    this.mouseMiddlePressed = false

    this.onVisibleGroupsChanged = this.onVisibleGroupsChanged.bind(this)
    this.props.tracksLibrary.onVisibleGroupsChanged.subscribe(this.onVisibleGroupsChanged)

    this.onVisibleGroupsChanged()
  }
  onVisibleGroupsChanged(){
    this.setState({"groups": this.props.tracksLibrary.getVisibleGroups()})
  }
  componentDidMount(){
    this.animate()
    this.props.tracksLibrary.updateVisibleGroups()
    this.setupMouseControls()
  }
  checkIfMouseInCanvas(e){
    var canvasRect = this.canvasComponentRef.current.canvas.getClientRects()[0]
    return e.pageX > canvasRect.x && e.pageY > canvasRect.y 
        && e.pageX < canvasRect.x+canvasRect.width
        && e.pageY < canvasRect.x+canvasRect.height
  }
  setupMouseControls(){
    window.document.addEventListener('mousedown', (e)=>{
      if(this.checkIfMouseInCanvas(e)){
        if(e.button == 1){
          this.mouseMiddlePressed = true
        }
      }
    })
    this.timelineRef.current.addEventListener('wheel', (e)=>{
      if (e.ctrlKey) {
        e.preventDefault()
      }

      if(this.checkIfMouseInCanvas(e)){
        if(e.ctrlKey){
          this.camera.zoom(0,-e.deltaY/100.0)
        }else{
          this.camera.zoom(-e.deltaY/100.0,0)
        }
      }
    }, true)
    window.document.addEventListener('mouseup', (e)=>{
      this.mouseMiddlePressed = false
    })
    window.document.addEventListener('mousemove', (e)=>{
      if(this.mouseMiddlePressed){
        this.camera.drag(-e.movementX/this.camera.size.x, -e.movementY/this.camera.size.y)
      }
    })
  }
  animate(){
    requestAnimationFrame(this.animate)
    this.camera.update()
    this.canvasComponentRef.current.update()
    this.tracksContainerRef.current.update()
    this.update()
  }
  update(){

  }
  render(){
    return (
      <div className="timeline" ref={this.timelineRef}>
        <Canvas ref={this.canvasComponentRef} camera={this.camera} tracksLibrary={this.props.tracksLibrary}/>
        <TracksContainer ref={this.tracksContainerRef} camera={this.camera} groups={this.state.groups} tracksLibrary={this.props.tracksLibrary}/>
        {renderTimelineAddons(this.camera, this.props.tracksLibrary)}
      </div>
    )
  }
}