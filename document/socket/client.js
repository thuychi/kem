// Client On Browser
var { WS } = require('kem/dom');

// Client On Server
var WS = require('kem/ws/client');

var socket = new WS('ws://localhost:3000');

socket.on('open', fn);
socket.on('close', fn);
socket.on('error', fn);

socket.emit('chat', { data });
socket.on('chat', function(response){});

socket.emit('chat', {data}, function(response){});