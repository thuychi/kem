var DOM = require('../lib/dom.js');

module.exports = class Modal extends DOM {

	_close(e) {
		if (/^(modal|modal\-close)$/.test(e.target.className)) this.emit('close');
	}

	get btn_close() {
		if (!this._btn_close) {
			this._btn_close = DOM.createElement(
				'div',
				{ className: 'pull-left' },
				DOM.createElement('a', { className: 'modal-close', onclick: this._close.bind(this) })
			)
		}
		return this._btn_close;
	}

	get btn_next() {
		if (!this._btn_next) {
			this._btn_next = DOM.createElement(
				'div',
				{ className: 'pull-right' },
				DOM.createElement('a', { className: 'modal-done', onclick: this.next.bind(this) })
			)
		}
		return this._btn_next;
	}

	_header() {
		if (!this.header) return null;
		return DOM.createElement(
			'header',
			{ className: 'clearfix' },
			this.next ? this.btn_close : null,
			DOM.createElement(
				'div',
				{ className: 'pull-left', style: 'margin-left: 12px;' },
				DOM.createElement(
					'span',
					{ className: 'modal-text' },
					this.header()
				)
			),
			this.next ? this.btn_next : this.btn_close
		);
	}

	init() {
		var self = this,
		    fn = function () {
			self.remove();
		};
		if (this.notFull) {
			var content = this.find('.modal-content');
			content.css({
				top: (window.innerHeight - content.offsetHeight) / 4 - 10 + 'px'
			});
		};
		this.on('done', fn);
		this.on('close', fn);
	}

	render() {
		return DOM.createElement(
			'div',
			{ className: 'modal', onclick: this._close },
			DOM.createElement(
				'div',
				{ className: this.notFull ? 'modal-content' : 'modal-content fullsize' },
				this._header(),
				this.section(),
				this.footer ? this.footer() : null
			)
		);
	}
}