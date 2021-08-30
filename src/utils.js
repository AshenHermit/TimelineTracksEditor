import { localization } from "./client/global";

var electron = null
var dialog = null
var ipcRenderer = null
var fs = null
if("require" in window){
	electron = window.require('electron');
	fs = window.require('fs');
	var {dialog} = window.require('electron').remote;
	var {ipcRenderer} = window.require('electron');
}

Math.mod = function(x,y){
    return x - y * this.floor(x / y)
}

export class Vector2{
	static copy(v){
		return new Vector2(v.x, v.y)
	}
	constructor(x=0,y=0){
		this.x = x
		this.y = y
	}
	set(x,y){
		this.x = x
		this.y = y
	}
}

export function disableContextMenu(){
	
}

export function MakeOpenFileDialog(callback){
	if(!electron){
		var input = document.createElement('input');
		input.type = 'file';

		input.onchange = e => { 
			var file = e.target.files[0];
			console.log(file)
			callback(file)
		}

		input.click();
		return
	}

	dialog.showOpenDialog({properties: ['saveFile'] }).then(function (response) {
		if (!response.canceled) {
			callback(response.filePaths[0])
		} else {
			console.log("no file selected");
		}
	});
}

export function ReadFile(filepath, callback){
	if(!electron){
		let reader = new FileReader()

		reader.readAsText(filepath)
		reader.onload = function() {
			callback(reader.result)
		}
	
		reader.onerror = function() {
			console.log(reader.error)
		}
		return
	}

	if(filepath=="") return
	fs.readFile(filepath, "utf8", (error, data)=>{
		if(error) throw error;
		callback(data)
	})
}

//took this from here: https://stackoverflow.com/questions/66078335/how-do-i-save-a-file-on-my-desktop-using-reactjs
const downloadFile = async (filename, text, type='application/json') => {
  	const blob = new Blob([text], {type : type});
	const a = document.createElement('a');
	a.download = filename;
	a.href = URL.createObjectURL(blob);
	a.addEventListener('click', (e) => {
		setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
	});
	a.click();
};

export function SaveFile(filepath, text, callback){
	if(!electron){
		downloadFile(filepath, text)
		return
	}

	if(!fs.existsSync(filepath)){
		filepath = dialog.showSaveDialogSync({defaultPath: filepath, filters: [{name: "Json", extensions: ["json"]}] });
	}
	if(!filepath) return
	fs.writeFile(filepath, text, (error)=>{
		if(error) throw error;
	})
	callback(filepath)
}

if(ipcRenderer){
	console.log("ipc")
	ipcRenderer.on("applySettings", (event, settings)=>{
		console.log("applying settings")
		localization.setLocale(settings.locale)
	})
	ipcRenderer.send("appIsReady")
}