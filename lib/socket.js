/**
 *  WebSocket For Browser
 *
 *  var socket = new WS(uri, { headers: {token: '', cookie: '', ...} })
 */

class WS {
  constructor(uri, option) {
    this._event = {};
    this._wait = [];

    this.socket = new WebSocket(uri, option || {});
    this.init();
  }

  get readyState() {
    return this.socket.readyState;
  }
  get connecting() {
    return WebSocket.CONNECTING === this.readyState;
  }
  get connected() {
    return WebSocket.OPEN === this.readyState;
  }
  get disconnecting() {
    return WebSocket.CLOSING === this.readyState;
  }
  get disconnected() {
    return WebSocket.CLOSED === this.readyState;
  }

  init(socket) {
    var self = this,
        socket = this.socket;

    socket.onmessage = function (e) {
      if (self.connected) {
        var array = JSON.parse(e.data), event = self._event, fn;
        array.forEach(function(data){
          if(fn = event[data[0]]){
            fn.apply(null, data[1])
          }
        })
      }
    }
  }

  on(name, fn) {
    if(WS.ListEventDefault[name]){
      this.socket.addEventListener(name, fn);
    }else{
      this._event[name] = fn;
    }
  }

  emit(name, ...value) {
    if (this.disconnecting || this.disconnected) return;

    var fn = value[value.length - 1],
        data = [name, value];

    if ('function' === typeof fn) {
      this.on(name, fn);
      data[1].pop();
      data[2] = 1;
    }

    this.connecting ? this.wait(data) : this.send([data]);
  }

  wait(data) {
    this._wait.push(data);

    if (!this.waiting) {
      var self = this;

      this.waiting = setInterval(function () {

        switch (self.readyState) {

          case 1:
            self.send(self._wait);
            self.stop_wait();
            return;

          case 2:
          case 3:
            if (self.waiting) self.stop_wait();
            return;

        }
      }, 1000);
    }
  }

  stop_wait() {
    clearInterval(this.waiting);
    delete this.waiting;
    this._wait = [];
  }

  /**
   *  array: [ [event_name, event_data] ]
   *
   *  => socket.emit(event_name, ...event_data);
   */

  send(array) {
    this.socket.send(JSON.stringify(array));
  }
}

WS.ListEventDefault = {open: 1, close: 1, error: 1};

module.exports = WS;