import React from 'react';

import { Vector2 } from '../utils';
import { localization } from '../client/global';
import { TracksLibrary, Track } from '../client/TracksLibrary';


class ContextMenuFunctions{
	/** @param {ContextMenu} contextMenu */
	constructor(contextMenu){
		this.contextMenu = contextMenu
		this.tracksLibrary = this.contextMenu.props.tracksLibrary
	}
	deleteTrack(){
		this.tracksLibrary.removeTrackFromGroup(this.contextMenu.selectedGroup, this.contextMenu.selectedTrack)
		this.contextMenu.hide()
	}

	deleteGroup(){
		this.tracksLibrary.removeGroup(this.contextMenu.selectedGroup)
		this.contextMenu.hide()
	}
	addTrackInGroup(){
		let startPos = Math.round(window.camera.getPosition().x)
		this.tracksLibrary.addTrackInGroup(this.contextMenu.selectedGroup, 
			new Track(localization.translate("new_track.name"), startPos, startPos+1))
		let tracksCount = this.tracksLibrary.getVisibleTracksCount(this.tracksLibrary.getGroupIndex(this.contextMenu.selectedGroup))
		window.camera.setPosition(new Vector2(startPos+0.5, tracksCount-8))
	}

	deleteCounter(){
		this.tracksLibrary.removeCounterLine(this.contextMenu.selectedCounterLine)
		this.contextMenu.hide()
	}
}

//TODO: needs refactor
export class ContextMenu extends React.Component{
	static TypeEnum = Object.freeze({"Track": 0, "Group": 1, "Counter":2})
	constructor(props){
		super(props)
		this.divRef = React.createRef()
		this.contextMenuFunctions = new ContextMenuFunctions(this)

		this.currentType = ContextMenu.TypeEnum.Track
		this.specificTypeRenderers = [this.renderTrackMenu.bind(this), this.renderGroupMenu.bind(this), this.renderCounterMenu.bind(this)]
	}
	componentDidMount(){
		this.setupEventListeners()
		this.hide()
	}
	render(){
		return this.specificTypeRenderers[this.currentType]()
	}
	renderTrackMenu(){
		return <div className="context-menu" ref={this.divRef}>
			<div className="label">{localization.translate("context_menu.track.title")}</div>
			{/* TODO: needs refactor */}
			<div onClick={this.contextMenuFunctions.deleteTrack.bind(this.contextMenuFunctions)} className="button">{localization.translate("context_menu.track.delete_button.text")}</div>
		</div>
	}
	renderGroupMenu(){
		return <div className="context-menu" ref={this.divRef}>
			<div className="label">{localization.translate("context_menu.group.title")}</div>
			<div onClick={this.contextMenuFunctions.addTrackInGroup.bind(this.contextMenuFunctions)} className="button">{localization.translate("context_menu.group.add_track_button.text")}</div>
			<div onClick={this.contextMenuFunctions.deleteGroup.bind(this.contextMenuFunctions)}className="button">{localization.translate("context_menu.group.delete_button.text")}</div>
		</div>
	}
	renderCounterMenu(){
		return <div className="context-menu" ref={this.divRef}>
			<div className="label">{localization.translate("context_menu.counter.title")}</div>
			<div onClick={this.contextMenuFunctions.deleteCounter.bind(this.contextMenuFunctions)}className="button">{localization.translate("context_menu.counter.delete_button.text")}</div>
		</div>
	}

	show(xPos, yPos, type){
		this.divRef.current.style.display = ''
		this.currentType = type
		this.forceUpdate()
		this.divRef.current.style.left = "" + xPos +  "px"
		this.divRef.current.style.top = "" + yPos +  "px"
	}
	hide(){
		this.divRef.current.style.display = 'none'
	}

	updateSelectedWithElement(el){
		this.selectedCounterLine = this.props.tracksLibrary.getCounterLineByIndex(el.getAttribute("data-counter-line-index")-0)
		this.selectedGroup = this.props.tracksLibrary.getGroupByIndex(el.getAttribute("data-group-index")-0)
		console.log(this.selectedGroup)
		if(this.selectedGroup) this.selectedTrack = this.selectedGroup.getTrackByIndex(el.getAttribute("data-track-index")-0)
	}

	getElementContextMenuType(el){
		if(el.classList.contains("track")){
			this.updateSelectedWithElement(el)
			return ContextMenu.TypeEnum.Track
		}else if(el.parentNode.classList.contains("track")){
			this.updateSelectedWithElement(el.parentNode)
			return ContextMenu.TypeEnum.Track
		}
		else if(el.classList.contains("group-item")){
			this.updateSelectedWithElement(el)
			return ContextMenu.TypeEnum.Group
		}else if(el.parentNode.classList.contains("group-item")){
			this.updateSelectedWithElement(el.parentNode)
			return ContextMenu.TypeEnum.Group
		}
		else if(el.classList.contains("group-renderer")){
			this.updateSelectedWithElement(el)
			return ContextMenu.TypeEnum.Group
		}
		else if(el.classList.contains("counter-line")){
			this.updateSelectedWithElement(el)
			return ContextMenu.TypeEnum.Counter
		}else if(el.parentNode.classList.contains("counter-line")){
			this.updateSelectedWithElement(el.parentNode)
			return ContextMenu.TypeEnum.Counter
		}
		return -1
	}

	setupEventListeners(){
		window.addEventListener('contextmenu', (e)=>{
			let elCtxMenuType = this.getElementContextMenuType(e.target)
			if(elCtxMenuType!=-1){
				e.preventDefault()
				this.show(e.pageX, e.pageY, elCtxMenuType)
				return
			}
		})
		window.addEventListener('click', (e)=>{
			if(e.button==2){
				return
			}
			else{
				if(e.target.classList.contains("context-menu") || e.target.parentNode.classList.contains("context-menu")){
					return
				}
			}

			this.hide()
		})
		window.addEventListener('mousedown', (e)=>{
			if(e.button==0){
				if(e.target.classList.contains("context-menu") || e.target.parentNode.classList.contains("context-menu")){
					return
				}
			}

			this.hide()
		})
	}
}