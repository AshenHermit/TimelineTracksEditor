import App from '../App'
import {EventHandler} from 'event-js'
import {Controls} from './controls'

export class Track{
    constructor(name="track", startPosition, endPosition){
        this.name = name
        this.startPosition = startPosition
        this.endPosition = endPosition
    }
}

export class Group{
    constructor(name="group"){
        this.name = name
        this.visible = true
        this.tracks = []
        this.color = "#6d76af"
    }
    addTrack(track){
        this.tracks.push(track)
    }
}

class Client{
    constructor(){
        /**@type {App}*/
        this.appComponent = null

        this.controls = new Controls()

        this.groups = {}
        this.visibleGroups = []
        this.onVisibleGroupsChanged = new EventHandler(this)
    }

    registerAppComponent(component){
        this.appComponent = component
    }

    getVisibleGroups(){
        return this.visibleGroups
    }
    updateVisibleGroups(){
        this.visibleGroups = []
        Object.keys(this.groups).forEach(groupKey => {
            let group = this.groups[groupKey]
            if(group.visible) this.visibleGroups.push(group)
        })
        this.onVisibleGroupsChanged.publish()
    }
    setGroupVisible(groupName, visible){
        if(!(groupName in this.groups)) return
        this.groups[groupName].visible = visible
        this.updateVisibleGroups()
    }

    getCurrentDayPosition(){
        var date = new Date()
        var date2day = 1000 * 60 * 60 * 24
        var day = Math.floor(date/date2day)
        return day
    }

    addGroup(name){
        this.groups[name] = new Group(name)
    }
    addTrackInGroup(groupName, track){
        this.groups[groupName].addTrack(track)
        this.updateVisibleGroups()
    }
}

export var client = new Client()
window.client = client
client.addGroup("Group 1")
for (let i = 0; i < 10; i++) {
    var start = client.getCurrentDayPosition() + Math.random() * 10.0
    var end = start + Math.random() * 10.0
    client.addTrackInGroup("Group 1", new Track("Track "+(i+1), start, end))
}