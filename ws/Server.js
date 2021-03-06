/*!
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */

'use strict';

var safeBuffer = require('safe-buffer'),
  crypto = require('crypto'),
  http = require('http'),
  url = require('url'),
  PerMessageDeflate = require('./PerMessageDeflate'),
  Extensions = require('./Extensions'),
  constants = require('./Constants'),
  WebSocket = require('./server'),
  Event = require('./Event'), 
  Buffer = safeBuffer.Buffer,

  async = require('../lib/async');

/**
 * Class representing a WebSocket server.
 *
 * @extends EventEmitter
 */
class WebSocketServer extends Event {
  /**
   * Create a `WebSocketServer` instance.
   *
   * @param {Object} options Configuration options
   * @param {String} options.host The hostname where to bind the server
   * @param {Number} options.port The port where to bind the server
   * @param {http.Server} options.server A pre-created HTTP/S server to use
   * @param {Function} options.verifyClient An hook to reject connections
   * @param {Function} options.handleProtocols An hook to handle protocols
   * @param {String} options.path Accept only connections matching this path
   * @param {Boolean} options.noServer Enable no server mode
   * @param {Boolean} options.clientTracking Specifies whether or not to track clients
   * @param {(Boolean|Object)} options.perMessageDeflate Enable/disable permessage-deflate
   * @param {Number} options.maxPayload The maximum allowed message size
   * @param {Function} callback A listener for the `listening` event
   */
  constructor (options, callback) {

    super();

    this.options = Object.assign({
      maxPayload: 100 * 1024 * 1024,
      perMessageDeflate: true,
      handleProtocols: null,
      clientTracking: true,
      verifyClient: null,
      noServer: false,
      backlog: null, // use default (511 as implemented in net.js)
      server: null,
      host: null,
      path: null,
      port: null
    }, options);

    this.path = options.path;
    this.clients = [];

    this._server = options.server;
    this._connect = [];

    this._server.on('listening', () => this.emit('listening'));
    this._server.on('error', (err) => this.emit('error', err));
    this._server.on('upgrade', (req, socket, head) => {
      this.handleUpgrade(req, socket, head, (client) => {
        this._connect.forEach(function(fn){ fn(client) });

        client.add = (id) => {

          client._id = id;

          client._onsendin = (room, array) => {
            this.clients.each(function($){
              if($.room[room] === true){
                $.send([array]);
              }
            });
          };

          client._onsendto = (room, array) => {
            this.clients.each(function($){
              if($.room[room] === true && id !== $._id){
                $.send([array]);
              }
            })
          };

        };

      });
    });
  }

  get(id){
    this._senduser = id;
    return this;
  }

  del(id){
    async.each(this.clients, function(client, index){
      if(id === client._id) {
        this.clients.splice(index, 1);
      }
    })
  }

  createRoom(room, user_array){
    async.each(this.clients, function(client){
      if(user_array.indexOf(client._id) > -1){
        client.room[room] = 1;
      }
    })
  }

  userRoom(room){
    var user_array = [], client = null, has_user = {};
    for(var i = 0, n = this.clients.length; i < n; i++){
      client = this.clients[i];

      if(has_user[client._id]) continue;

      if(room === client.room[room]){
        has_user[client._id] = 1;
        user_array.push(client._id);
      }
    }
    
    return user_array;
  }

  emit(name, ...array) {
    var fn, data;

    if(Event.EVENT_DEFAULT[name]){
      if(fn = this._event[name]) fn(array[1]);
      return;
    }else if(this._senduser){
      fn = this._senduser;

      data = [name, array];
      
      async.each(this.clients, function(client){
        if(fn === client._id){
          client.send([data]);
        }
      });
      this._senduser = null;
    }else{

      data = [name, array];

      async.each(this.clients, function(client){
        client.send([data]);
      });
    }
  }

  connect(fn){
    this._connect.push(fn);
  }

  /**
   * Close the server.
   *
   * @param {Function} cb Callback
   * @public
   */
  close (cb) {
    //
    // Terminate all associated clients.
    //
    if (this.clients) {
      async.each(this.clients, function(client){
        client.terminate();
      })
    }

    var server = this._server;

    if (server) {
      this._server = null;

      //
      // Close the http server if it was internally created.
      //
      if (this.options.port != null) return server.close(cb);
    }

    if (cb) cb();
  }

  /**
   * See if a given request should be handled by this server instance.
   *
   * @param {http.IncomingMessage} req Request object to inspect
   * @return {Boolean} `true` if the request is valid, else `false`
   * @public
   */
  shouldHandle (req) {
    if (this.options.path && url.parse(req.url).pathname !== this.options.path) {
      return false;
    }

    return true;
  }

  /**
   * Handle a HTTP Upgrade request.
   *
   * @param {http.IncomingMessage} req The request object
   * @param {net.Socket} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @public
   */
  handleUpgrade (req, socket, head, cb) {
    socket.on('error', socketError);

    var version = +req.headers['sec-websocket-version'];

    if (
      req.method !== 'GET' || req.headers.upgrade.toLowerCase() !== 'websocket' ||
      !req.headers['sec-websocket-key'] || (version !== 8 && version !== 13) ||
      !this.shouldHandle(req)
    ) {
      return abortConnection(socket, 400);
    }

    var protocol = (req.headers['sec-websocket-protocol'] || '').split(/, */);

    //
    // Optionally call external protocol selection handler.
    //
    if (this.options.handleProtocols) {
      protocol = this.options.handleProtocols(protocol);
      if (protocol === false) return abortConnection(socket, 401);
    } else {
      protocol = protocol[0];
    }

    //
    // Optionally call external client verification handler.
    //
    if (this.options.verifyClient) {
      var info = {
        origin: req.headers[`${version === 8 ? 'sec-websocket-origin' : 'origin'}`],
        secure: !!(req.connection.authorized || req.connection.encrypted),
        req
      };

      if (this.options.verifyClient.length === 2) {
        this.options.verifyClient(info, (verified, code, message) => {
          if (!verified) return abortConnection(socket, code || 401, message);

          this.completeUpgrade(protocol, version, req, socket, head, cb);
        });
        return;
      } else if (!this.options.verifyClient(info)) {
        return abortConnection(socket, 401);
      }
    }

    this.completeUpgrade(protocol, version, req, socket, head, cb);
  }

  /**
   * Upgrade the connection to WebSocket.
   *
   * @param {String} protocol The chosen subprotocol
   * @param {Number} version The WebSocket protocol version
   * @param {http.IncomingMessage} req The request object
   * @param {net.Socket} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @private
   */
  completeUpgrade (protocol, version, req, socket, head, cb) {
    //
    // Destroy the socket if the client has already sent a FIN packet.
    //
    if (!socket.readable || !socket.writable) return socket.destroy();

    var key = crypto.createHash('sha1')
      .update(req.headers['sec-websocket-key'] + constants.GUID, 'binary')
      .digest('base64');

    var headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${key}`
    ];

    if (protocol) headers.push(`Sec-WebSocket-Protocol: ${protocol}`);

    var offer = Extensions.parse(req.headers['sec-websocket-extensions']), extensions;

    try {
      extensions = acceptExtensions(this.options, offer);
    } catch (err) {
      return abortConnection(socket, 400);
    }

    var props = Object.keys(extensions);

    if (props.length) {
      var serverExtensions = props.reduce((obj, key) => {
        obj[key] = [extensions[key].params];
        return obj;
      }, {});

      headers.push(`Sec-WebSocket-Extensions: ${Extensions.format(serverExtensions)}`);
    }

    //
    // Allow external modification/inspection of handshake headers.
    //
    this.emit('headers', headers);

    socket.write(headers.concat('', '').join('\r\n'));

    var client = new WebSocket([req, socket, head], {
      maxPayload: this.options.maxPayload,
      protocolVersion: version,
      extensions,
      protocol
    });

    this.clients.push(client);
    client.on('close', () => {
      async.each(this.clients, (s, i) => {
        if(client === s){ 
          this.clients.splice(i, 1)
        } 
      })
    });

    socket.removeListener('error', socketError);
    cb(client);
  }
}

module.exports = WebSocketServer;

/**
 * Handle premature socket errors.
 *
 * @private
 */
function socketError () {
  this.destroy();
}

/**
 * Accept WebSocket extensions.
 *
 * @param {Object} options The `WebSocketServer` configuration options
 * @param {Object} offer The parsed value of the `sec-websocket-extensions` header
 * @return {Object} Accepted extensions
 * @private
 */
function acceptExtensions (options, offer) {
  var pmd = options.perMessageDeflate, extensions = {};

  if (pmd && offer[PerMessageDeflate.extensionName]) {
    var perMessageDeflate = new PerMessageDeflate(
      pmd !== true ? pmd : {},
      true,
      options.maxPayload
    );

    perMessageDeflate.accept(offer[PerMessageDeflate.extensionName]);
    extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
  }

  return extensions;
}

/**
 * Close the connection when preconditions are not fulfilled.
 *
 * @param {net.Socket} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} [message] The HTTP response body
 * @private
 */
function abortConnection (socket, code, message) {
  if (socket.writable) {
    message = message || http.STATUS_CODES[code];
    socket.write(
      `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` +
      'Connection: close\r\n' +
      'Content-type: text/html\r\n' +
      `Content-Length: ${Buffer.byteLength(message)}\r\n` +
      '\r\n' +
      message
    );
  }

  socket.removeListener('error', socketError);
  socket.destroy();
}
