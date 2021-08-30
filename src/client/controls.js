export class Controls{
    constructor(){
        this.setupEventListeners()

        this.pressedKeys = {}
    }

    setupEventListeners(){
        window.addEventListener("keydown", (e)=>{
            this.pressedKeys[e.code] = true
        })
        window.addEventListener("keyup", (e)=>{
            this.pressedKeys[e.code] = false
        })
    }

    isKeyPressed(code){
        if(code in this.pressedKeys) return false
        return this.pressedKeys[code]
    }
}