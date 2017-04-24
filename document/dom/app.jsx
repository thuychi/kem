var { app, DOM } = require('kem/dom');

function checking(next){
	if(true) next();
}

class View extends DOM {
	render() {
		return <div>Section Content</div>;
	}
}

class Controller extends DOM {
	constructor(props) {
		super(props);
		this.state = {section: null, header: null, footer: ''};
	}
	action(){
		this.setState({
			header: <div>Header</div>,
			footer: 'Footer'
		});
		return View;
	}
	render() {
		return (
			<div id="main">
				<div id="header">{this.state.header}</div>
				<div id="section">{this.state.section}</div>
				<div id="footer">{this.state.footer}</div>
			</div>
		)
	}
}

var uri = '/';

app.use(checking);
app.use(uri, Controller);
app.use(uri, checking, Controller);
app.use(uri, checking, Controller, 'action');

app.handle();