import { Localization } from './Localization';
import { CounterLinesToolbox, CounterLinesContainer } from '../components/CounterLines';

export var localization = new Localization()

//TODO: needs refactor
export function renderToolboxes(){
	return [
		<CounterLinesToolbox/>
	]
}
export function renderTimelineAddons(camera, tracksLibrary){
	return [
		<CounterLinesContainer camera={camera} tracksLibrary={tracksLibrary}/>
	]
}