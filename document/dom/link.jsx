var {DOM, Link} = require('kem/dom');

// go to an url
Link.to('/path/to/uri');

// show modal box
Link.modal(ModalBox, { property });

// render to DOM
<Link to="/path/to/uri">Label</Link>
<Link to="/path/to/uri" action={onClick}>Label</Link>

<Link modal={ModalBox} data={{ property }}>Label</Link>