import {EventHandler} from 'event-js'
import { ReadFile, SaveFile } from '../utils'

export class Track{
    constructor(name="track", startPosition, endPosition){
        this.name = name
        this.startPosition = startPosition
        this.endPosition = endPosition
    }
    importData(data){
        Object.assign(this, data)
        return this
    }
    exportData(){
        return JSON.parse(JSON.stringify(this))
    }
}

export class Group{
    constructor(name="group", color="#6d76af"){
        this.name = name
        this.visible = true
        this.tracks = []
        this.color = color
    }
    addTrack(track){
        this.tracks.push(track)
    }
    
    importData(data){
        Object.assign(this, data)
        this.tracks=this.tracks.map(trackData=>new Track().importData(trackData))
        return this
    }
    exportData(){
        var thisCopy = Object.assign({}, this)
        thisCopy.tracks = thisCopy.tracks.map(track=>track.exportData()) 
        return JSON.parse(JSON.stringify(thisCopy))
    }
    getTrackIndex(track){
        return this.tracks.indexOf(track)
    }
    getTrackByIndex(index){
        if(index===NaN) return null
        if(index==-1) return null
        return this.tracks[index]
    }
    removeTrack(track){
        this.tracks.splice(this.getTrackIndex(track), 1)
    }
}

export class CounterLine{
    constructor(position = -1){
        this.position = position
    }
    importData(data){
        Object.assign(this, data)
        return this
    }
    exportData(){
        return JSON.parse(JSON.stringify(this))
    }
}

export class TracksLibrary{
    constructor(){
        this.title = "New Project"

        this.groupColors = ["#6d76af", "#af6d6d", "#6dafa5", "#7fa070", "#9e729a"]

        this.groups = []
        this.visibleGroups = []
        this.onVisibleGroupsChanged = new EventHandler(this)
        this.onProjectLoaded = new EventHandler(this)
        this.onSomeTrackChanged = new EventHandler(this)

        this.counterLines = []
    }
    addCounterLine(position){
        this.counterLines.push(new CounterLine(position))
    }

    getCounterLineIndex(counterLine){
        return this.counterLines.indexOf(counterLine)
    }
    getCounterLineByIndex(index){
        if(index===NaN) return null
        if(index==-1) return null
        return this.counterLines[index]
    }
    removeCounterLine(counterLine){
        return this.counterLines.splice(this.getCounterLineIndex(counterLine), 1)
    }

    getGroupIndex(group){
        return this.groups.indexOf(group)
    }
    getGroupByIndex(index){
        if(index===NaN) return null
        if(index==-1) return null
        return this.groups[index]
    }
    removeGroup(group){
        this.groups.splice(this.getGroupIndex(group), 1)
        this.updateVisibleGroups()
    }
    removeTrackFromGroup(group, track){
        group.removeTrack(track)
        this.updateVisibleGroups()
    }
    getVisibleTracksCount(groupsCount=-1){
        let count = 0
        for (let i = 0; i < this.groups.length; i++) {
            const group = this.groups[i]
            count += group.tracks.length
            if(groupsCount==0) break
            if(groupsCount!=-1) groupsCount -= 1
        }
        return count
    }

    signalAboutTrackChange(){
        this.onSomeTrackChanged.publish()        
    }

    getVisibleGroups(){
        return this.visibleGroups
    }
    updateVisibleGroups(){
        this.visibleGroups = []
        //TODO: dead code
        // Object.keys(this.groups).forEach(groupKey => {
        //     let group = this.groups[groupKey]
        //     if(group.visible) this.visibleGroups.push(group)
        // })
        this.visibleGroups = this.groups.filter(x=>x.visible)
        this.onVisibleGroupsChanged.publish()
    }
    setGroupVisibility(groupName, visible){
        let group = this.getGroupByName(groupName)
        if(!group) return
        group.visible = visible
        this.updateVisibleGroups()
    }
    getGroupByName(groupName){
        return this.groups.find(x=>x.name==groupName)
    }

    addGroup(name, color=""){
        if(color=="") color = this.getRandomGroupColor()
        this.groups.push(new Group(name, color))
        this.updateVisibleGroups()
    }
    addTrackInGroup(group, track){
        if(!group) return
        group.addTrack(track)
        this.updateVisibleGroups()
    }
    setGroupColor(group, color){
        group.color = color
        this.updateVisibleGroups()
    }
    toggleGroupVisibility(group){
        group.visible = !group.visible
        this.updateVisibleGroups()
    }
    getRandomGroupColor(){
        return this.groupColors[Math.floor(Math.random()*this.groupColors.length)]
    }
    getNextGroupColor(currentColor){
        return this.groupColors[(this.groupColors.indexOf(currentColor)+1)%this.groupColors.length]
    }

    addTestGroup(startDay){
        var groupName = "Test Group " + (Object.keys(this.groups).length+1)
        this.addGroup(groupName)
        let group = this.getGroupByName(groupName)
        for (let i = 0; i < 10; i++) {
            var start = startDay + Math.round(Math.random() * 10.0)
            var end = start + Math.round(Math.random() * 10.0)
            this.addTrackInGroup(group, new Track("Track "+(i+1), start, end))
        }
    }

    dayToDateTimestamp(dayTimestamp){
        let day2date = 1000 * 60 * 60 * 24
        return dayTimestamp*day2date
    }
    dateToDayTimestamp(dateTimestamp){
        let day2date = 1000 * 60 * 60 * 24
        return dateTimestamp/day2date
    }

    getCurrentDayPosition(){
        var date = new Date()
        var day = Math.floor(this.dateToDayTimestamp(date.getTime()))
        return day
    }

    importData(data){
        Object.assign(this, data)
        this.groups = []
        this.counterLines = data.counterLines.map(el=>new CounterLine().importData(el))
        this.groups = data.groups.map(el=>new Group().importData(el))
        this.updateVisibleGroups()
        this.onProjectLoaded.publish()
        return this
    }
    exportData(){
        var thisCopy = Object.assign({}, this)

        delete thisCopy.visibleGroups
        delete thisCopy.onVisibleGroupsChanged
        delete thisCopy.onSomeTrackChanged
        delete thisCopy.onProjectLoaded

        thisCopy.counterLines = thisCopy.counterLines.map(el=>el.exportData()) 
        thisCopy.groups = thisCopy.groups.map(el=>el.exportData())

        return JSON.parse(JSON.stringify(thisCopy))
    }

    loadFromFile(filepath){
        ReadFile(filepath, ((text)=>{
            this.importData(JSON.parse(text))
        }).bind(this))
    }
    saveToFile(filepath, callback){
        if(filepath=="" || filepath instanceof File) filepath = this.title + ".json"
        SaveFile(filepath, JSON.stringify(this.exportData(), null, 2), (filepath)=>{
            callback(filepath)
        })
    }
}