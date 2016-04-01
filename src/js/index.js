import {Test} from "./test";
import EventEmitter from "event-emitter";

class Stage {
	constructor() {
		console.log('test', Test);
		var emitter = new EventEmitter({});
		emitter.on('test', () => new Test());
		emitter.emit('test');
	}
}

window.Stage = Stage;

