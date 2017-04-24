var app = require('./router.js'),
	DOM = require('../lib/dom.js');

module.exports = class Link extends DOM {

	constructor(props) {
		super(props);
		this.handleClick = this.props.action || this.handleClick.bind(this);
	}

	handleClick(e) {
		if (this.props.to) return Link.to(this.props.to);
		if (this.props.remove) return $(this.props.remove).remove();
		if (this.props.modal) return Link.modal(this.props.modal, this.props.data);
	}

	render() {
		return DOM.createElement(
			'a',
			{ id: this.props.id,
				onmousedown: this.handleClick,
				className: this.props.className,
				style: this.props.style
			},
			this.props.children
		);
	}

	static modal(ModalBox, props) {
		app.dom.appendChild(DOM.createElement(ModalBox, props));
	}

	static to(path) {
		app.emit('render', path);
	}
}