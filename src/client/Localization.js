import * as fs from 'fs';
import {EventHandler} from 'event-js'

var defaultTranslationCSV = `
"message","en","ru"
"new_project.title","New Project","Новый Проект"
"new_track.name","New Track","Дорожка"
"new_group.name","New Group","Группа"
"project_manipulation.save_button.text","Save","Сохранить"
"project_manipulation.open_button.text","Open","Открыть"
`

export class Localization{
	constructor(){
		this.translation = {}
		this.currentLocale = "en"

		this.isLoaded = false

		this.onTranslationChanged = new EventHandler(this)
	}
	loadCSVTranslation(csv){
		csv = csv.replaceAll("\r", "")
		let rows = csv.split("\n")
		rows = rows.filter(x=>x!="")

		let columnKeys = []
		for (var i = 0; i < rows.length; i++) {
			var columns = rows[i].substring(1, rows[i].length-1).split('","')

			if(i==0){
				columnKeys = Array.from(columns)
				columnKeys = columnKeys.splice(1)
			}else{
				var message = columns[0]
				var messageTranslation = {}
				columnKeys.forEach(function(key, i){
					var value = columns[i+1]
					messageTranslation[key] = value
				});
				this.translation[message] = messageTranslation
			}
		}
		this.isLoaded = true
		this.onTranslationChanged.publish()
	}
	loadCSVTranslationFromFile(filename){
		let csv = fs.readFileSync(filename, "utf8")
		this.loadCSVTranslation(csv)
	}
	loadDefaultLocalization(){
		window.fetch("translation.csv").then(res=>res.text()).then((csv)=>{
			this.loadCSVTranslation(csv)
		})
	}
	setLocale(locale){
		this.currentLocale = locale
		this.onTranslationChanged.publish()
	}
	translate(message){
		if(message in this.translation)
			return this.translation[message][this.currentLocale]
		else 
			return message
	}
}