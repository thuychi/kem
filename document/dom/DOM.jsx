var {DOM, app} = require('kem/dom');

// create an element
var a = <a href="/" className="link">Label</a>;

console.log(a.href, a.className, a.html(), a.text());

// append element to DOM List
document.body.append(a);


// create Component

class Div extends DOM {
	render() {
		return (
			<div className="row" id={this.props.id}>Hello World</div>
		)
	}
}

app.dom.append(<Div id="unique-id"/>);


// ================ 	STATE 	 ====================

class Form extends DOM {
	constructor(props) {
		super(props);
		this.state = {list: []};
	}
	componentWillMount() {
		this.on('list', function(text){
			console.log(text);
		});
	}
	submit_form(e){
		e.preventDefault();
		this.emit('list', e.target.text.val());
		// this.setState({ list: e.target.text.val() });
		e.target.text.val('').focus();
	}
	render() {
		return (
			<form onsubmit={this.submit_form.bind(this)}>
				<ul>
					{this.state.list.push(function(text){
						return <li>{text}</li>
					})}
				</ul>
				<input name="text" placeholder="Press text"/>
				<button>Post</button>
			</form>
		)
	}
}

app.dom.append(<Form/>);

//# state element type
this.state = {
	string: '',
	number: 1,
	array: [],
	object_null: null,
	object_dom: <div>OK</div>,
	style: {width: 10, height: 10}
};


//# string & number
{this.state.string}
{this.state.string.text(function(text){
	return 'some ' + text;
})}


//# array

// default using 'push';
{this.state.array} 	
// add element to DOM in the bottom
{this.state.array.push(function(text_or_object){
	return <li>{text_or_object}</li>
})}
// add element to DOM on the top
{this.state.array.unshift(function(data){
	return <a>{data}</a>
})}


//#	object

// replace an element
{this.state.object}
// replace list element
{this.state.object.update(function(array_or_object){

	// using object, DOM element
	return <div>{array_or_object}</div>;

	// using array
	var dom = document.createDocumentFragment();
	for(var i = 0, n = array_or_object.length; i < n; i++){
		dom.append(<li>{array_or_object[i]}</li>);
	}
	return dom;
})}


//# css
<div style={this.state.style.css(function(data){
	return `width: ${data.width}px; height: ${data.height}px; padding: 0px 5px;`
})}/>

//# using this.on('event_name', callback);
this.on('string', function(text){
	console.log(text);
});


//##  Emiting value to change state

// using emit
this.emit('string', 'string value');
this.emit('array', { name, age });

// using setState
this.setState({ string: 'string value', array: { name, age } });



//===================	PROPS   ====================

class Div extends DOM {
	render() {
		return <div id={this.props.id}>Hello {this.props.name}</div>
	}
}

app.dom.append(<Div id="unique-id" name="Thuy Chi"/>);

// props using state on parent element

class Children extends DOM {
	render() {
		return (
			<ul>
				Data on children element:
				{this.props.list.push(function(item){
					return <li>{item}</li>
				})}
			</ul>
		)
	}
}
class Parent extends DOM {
	constructor(props) {
		super(props);
		this.state = {list: []}
	}

	submit(e){
		e.preventDefault();

		this.emit('list', e.target.text.val());

		e.target.text.val('').focus();
	}

	render() {
		return (
			<form onsubmit={this.submit.bind(this)}>
				<Children list={this.state.list}/>
				<input name="text"/>
				<button>Post</button>
			</form>
		)
	}
}

$('body').append(<Parent/>);