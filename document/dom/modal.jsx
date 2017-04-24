var {DOM, Modal} = require('kem/dom');

class OtherModal extends Modal {

	// using if Modal Box not full in browser
	notFull(){}

	// next button
	next(){
		
		// close without any action
		this.emit('close');

		// closing and working some action
		this.emit('done');
	}

	header(){
		return 'string_or_DOM';
	}
	section(){
		return 'string_or_DOM';
	}
	footer(){
		return 'string_or_DOM';
	}
}