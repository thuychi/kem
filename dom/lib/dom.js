var StateElement = require('./state-element.js'),
	AppendChild = require('./append-child.js'),
	Attribute = require('./attribute.js'),
	Event = require('../../lib/event.js');

module.exports = class DOM extends Event {
	constructor(props) {
		super();

		this.props = props || {};
		this.define = {};
	}

	apply(data) {
		Object.assign(this.define, data);
	}

	set(key, value) {
		this.define[key] = value;
	}
	get(key) {
		return this.define[key] || '';
	}
	get done() {
		if (this.componentDidMount) this.componentDidMount();
		if (this.state) this.__parserState();

		this.dom = this.render() || document.createComment('');
		this.dom._event = this._event;

		if (this.init) this.init();
		if (this.componentWillMount) this.componentWillMount();

		return this.dom;
	}

	__parserState() {
		for (var i in this.state) {
			this.state[i] = new StateElement(i, this.state[i], this);
		}
	}

	setState(list) {
		for (var i in list) {
			this.emit(i, list[i]);
		}
	}

	find(selector) {
		return this.dom.find(selector);
	}
	findAll(selector) {
		return this.dom.findAll(selector);
	}
	css(option) {
		var dom = this.dom.querySelector('style'),
		    arr = [];

		if (!dom) {
			dom = document.createElement('style');
			this.dom.prepend(dom);
		};

		setTimeout(function () {
			for (var className in option) {
				var item = [],
				    cls = option[className];
				for (var key in cls) {
					item.push(key + ':' + cls[key]);
				};
				arr.push(className + '{' + item.join(';') + '}');
			};

			dom.append(arr.join(''));
		}, 0);
	}

	remove() {
		DOM.getDOM(this, 0).remove();
	}

	static CreateDOM(Node, props) {
		var node = new Node(props);
		return node.done;
	}

	static createElement(tag, attr, ...children) {
		switch (typeof tag) {
			case 'function':
				return DOM.CreateDOM(tag, Object.assign({}, attr, { children }));
			case 'string':
				var node = document.createElement(tag);
				Attribute(attr || {}, node);
				AppendChild(children, node);
				return node;
			default:
				return null;
		}
	}

	static getDOM(node, i) {
		if (i > 3) return null;
		if (node && node.dom && node.dom.nodeType) return node.dom;

		DOM.getDOM(node, ++i);
	}
	static render(Node, parent) {
		parent.appendChild(DOM.getDOM(Node, 0));
	}

	static error(){
		var dom = document.createElement('div');
		div.innerHTML = 'This page not found';
		return dom;
	}
}