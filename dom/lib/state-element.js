var ArrayAction = require('./state-event');

module.exports = class StateElement {
	constructor(name, value, rootNode) {
		this.isState = 1;
		this.name = name;
		this.value = value;
		this.rootNode = rootNode;
	}

	concat(array) {
		return array.__concat();
	}

	on(fn) {
		this.rootNode.on(this.name, fn);
	}

	__cssAction(node) {
		function callback(value) {
			if (value !== null) {
				'object' === typeof value ? Object.assign(node.style, value) : node.setAttribute('style', value);
			}
		};
		var fn = this.action;

		if (fn) {
			if (this.value !== null) callback(fn.call(null, this.value));
			this.rootNode.on(this.name, function css(data) {
				if (data !== null) callback(fn.call(this, data));
			});
		} else {
			if (this.value !== null) callback(this.value);
			this.rootNode.on(this.name, callback);
		}
	}
	css(fn) {
		/**
		   *	- fn return a string for attribute style
		   * 	- fn argument is an object, string, number
		   *
		   *	- this.setState({style: {width: 10, height: 20}})
		   *  - <div style={this.state.style.css(function(data){ return `width: ${data.width}px; height: ${data.height}%` })} />
		   *	
		   */
		var state = new StateElement(this.name, this.value, this.rootNode);
		state.action = fn;
		return state;
	}

	push(fn) {
		/**
		   *	- fn return an element
		   * 	- fn argument is an array, object, string, number or null, not an element
		   * 	- this.setState({friend: argument});
		   *
		   *	- <div>
		   * 		{this.state.friend.push(function(data){
		   *			return <li>...</li>
		   *		})}
		   *	- </div>
		   */

		var array = new ArrayAction();

		this.rootNode.on(this.name, function push(data) {
			// if is_array && array.is_concat => append
			// if is_array && !array.is_concat => replace
			if (data) {
				if (Array.isArray(data)) {
					if (data.length) {
						if (data.__concat) {
							// append list
							return array.append(array.appendArray(data.map(fn), document.createDocumentFragment()));
						} else {
							// replace list
							return array.replace(array.append(data.map(fn), document.createDocumentFragment()));
						}
					} else {
						// remove child
						return array.remove();
					}
				} else {
					return array.append(fn.call(this, data));
				}
			};

			return array.remove();
		});

		return array.started(this.value.map(fn));
	}

	unshift(fn) {
		/**
   *	- fn return an element
   * 	- fn argument is an array, object, string, number or null, not an element
   * 	- this.setState({friend: argument});
   *
   *	- <div>
   * 		{this.state.friend.prepend(function(data){
   *			return <li>...</li>
   *		})}
   *	- </div>
   */

		var array = new ArrayAction();

		this.rootNode.on(this.name, function unshift(data) {
			// if is_array && array.is_concat => append
			// if is_array && !array.is_concat => replace
			if (data) {
				if (Array.isArray(data)) {
					if (data.length) {
						if (data.__concat) {
							// prepend list
							return array.prepend(array.appendArray(data.map(fn), document.createDocumentFragment()));
						} else {
							// replace list
							return array.replace(array.appendArray(data.map(fn), document.createDocumentFragment()));
						}
					} else {
						// remove child
						return array.remove();
					}
				} else {
					return array.prepend(fn.call(this, data));
				}
			};

			return array.remove();
		});

		return array.started(this.value.map(fn));
	}

	text(fn) {
		var dom = document.createTextNode(this.value);
		dom.nodeValue = fn(this.value);

		this.rootNode.on(this.name, function (data) {
			dom.nodeValue = fn.call(this, data);
		});
		return dom;
	}

	update(fn) {
		/**
		   *	- fn return an element
		   * 	- fn argument is an array, object, string or number, not an element
		   * 	- this.setState({friend: argument});
		   *
		   * 	- <div>{this.state.friend.update(function(data){ return <Friend /> })}</div>
		   * 	- <div>
		   *		{this.state.friend.update(function(data){
		   *			var fragment = document.createDocumentFragment();
		   *			for(var i = 0, n = data.length; i < n; i++){
		   *				fragment.appendChild(...);
		   *			};
		   *			return fragment;
		   *		})}
		   *	- </div>
		   */
		var array = new ArrayAction();

		this.rootNode.on(this.name, function update(data) {
			array.replace(data ? fn.call(this, data) : null);
		});

		return array.start_replace(this.value, fn);
	}
};