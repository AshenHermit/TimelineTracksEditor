import React from 'react';
import {mod} from 'mathjs'
import { localization } from '../client/global';

export class Canvas extends React.Component{
    // props: {camera, }
    constructor(props){
        super(props)
        this.state = {}
        
        this.canvasRef = React.createRef()
        this.canvasContainer = null
        this.canvas = null
        this.ctx = null
        
        this.canvasScale = 1
        this.resizeCanvas = this.resizeCanvas.bind(this)

        this.resizeCanvas()

        this.cameraSize = this.props.camera.getSize()
        this.cameraPos = this.props.camera.getPosition()

        
        this.dayRegistry = {}
        this.dateFieldsPreviousValues = []
        this.startDrawingDateIndex = 1

        this.drawnDayIsMarked = false
    }
    refreshDateFieldsPreviousValues(){
        this.dateFieldsPreviousValues = [-1,-1,-1,-1,-1]
    }
    resizeCanvas(){
        if(this.canvas==null) return
        
        this.canvasScale = 1
        this.canvas.width = this.canvasContainer.clientWidth * this.canvasScale
        this.canvas.height = this.canvasContainer.clientHeight * this.canvasScale
    }
    componentDidMount(){
        this.canvas = this.canvasRef.current
        this.ctx = this.canvas.getContext('2d')
        this.canvasContainer = this.canvas.parentNode

        new ResizeObserver(this.resizeCanvas)
            .observe(this.canvasContainer)
    }
    render(){
        return (
            <div className="canvas-conatiner">
                <canvas className="timeline-canvas canvas" ref={this.canvasRef}></canvas>
            </div>
        )
    }
    update(){
        this.draw()
    }
    //TODO: too long function
    drawDateOfColumn(columnXPos, columnIndex){
        if(!localization.isLoaded) return
        
        columnXPos+=this.cameraSize.x/2
        let dayPos = Math.floor(this.cameraPos.x) + columnIndex
        if(!(dayPos in this.dayRegistry)){
            let date = new Date(this.props.tracksLibrary.dayToDateTimestamp(dayPos))
            this.dayRegistry[dayPos] = [date.getDay(), localization.translate("day." + date.getDay() + ".name"), date.getDate(), localization.translate("month." + date.getMonth() + ".name"), date.getFullYear()]
        }
        
        this.ctx.font = "16px monospace"
        this.ctx.fillStyle = "#fff"

        if(columnXPos>0-this.cameraSize.x+30){
            var rowCount = 0
            for (let i = 0; i < this.dateFieldsPreviousValues.length; i++) {
                if(i<this.startDrawingDateIndex) continue
    
                const lastDateField = this.dateFieldsPreviousValues[i]
                if(lastDateField != this.dayRegistry[dayPos][i]){
                    let xPos = columnXPos
                    if(lastDateField == -1){
                        this.ctx.textAlign = "left"
                        xPos = 16
                    }else{
                        this.ctx.textAlign = "center"
                        //TODO: kludge
                        if(i==3){
                            this.ctx.textAlign = "left"
                            xPos-=this.cameraSize.x/2.0
                        }
                    }
                    this.ctx.fillText(this.dayRegistry[dayPos][i], xPos, 16+rowCount*16)
                    this.dateFieldsPreviousValues[i] = this.dayRegistry[dayPos][i]
                }
                rowCount+=1
            }
        }
        //day mark 
        if(this.dayRegistry[dayPos][0] == 6 || this.dayRegistry[dayPos][0] == 0){
            this.drawnDayIsMarked = true
        }else{
            this.drawnDayIsMarked = false
        }
        
    }
    draw(){
        this.refreshDateFieldsPreviousValues()

        if(this.ctx==null) return
        this.ctx.globalAlpha = 1.0
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        
        var columnsCount = Math.floor(this.canvas.width/this.cameraSize.x/2)*2+4
        for (let i = 0; i < columnsCount; i++) {
            let pos = i
            let rightColumnXPos = this.canvas.width/2.0+(pos - Math.floor(columnsCount/2)-mod(this.cameraPos.x, 1.0))*this.cameraSize.x

            this.ctx.globalAlpha = 1.0
            this.drawDateOfColumn(rightColumnXPos, pos - Math.floor(columnsCount/2))

            if(Math.floor(i+this.cameraPos.x-columnsCount/2)%2 == 0){
                this.ctx.fillStyle = "#303030"
                if(this.drawnDayIsMarked){
                    this.ctx.fillStyle = "#383838"
                }
            }else{
                this.ctx.fillStyle = "#2c2c2c"
                if(this.drawnDayIsMarked){
                    this.ctx.fillStyle = "#393939"
                }
            }
            
            
            this.ctx.globalAlpha = 0.7
            this.ctx.fillRect(rightColumnXPos, 0, this.cameraSize.x, this.canvas.height)
        }
    }
}