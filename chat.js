const uuidv4 = require("uuid").v4;

const messages = new Set();
const users = new Map();

const messageExpirationTimeMS = 5 * 60 * 1000;

// Keep track of which names are used so that there are no duplicates
var userNames = (function () {
  var names = {};

  var claim = function (name) {
    if (!name || names[name]) {
      return false;
    } else {
      names[name] = true;
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it
  var getGuestName = function () {
    var name,
      nextUserId = 1;

    do {
      name = "Guest " + nextUserId;
      nextUserId += 1;
    } while (!claim(name));

    return name;
  };

  // serialize claimed names as an array
  var get = function () {
    var res = [];
    for (const user in names) {
      res.push(user);
    }

    return res;
  };

  var free = function (name) {
    if (names[name]) {
      delete names[name];
    }
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGuestName: getGuestName,
  };
})();

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;
    this.userName = userNames.getGuestName();
    this.userId = uuidv4();
    socket.on("getMessages", () => this.getMessages());
    socket.on("message", (value) => this.handleMessage(value));
    socket.on("change:name", (data, fn) => this.changeName(data, fn));
    socket.on("disconnect", () => this.disconnect());
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }

  changeName(data, fn) {
    if (userNames.claim(data.name)) {
      const oldName = this.userName;
      userNames.free(oldName);
      this.userName = data.name;
      console.log(
        `Usuario ${this.userId} ha cambiado su nombre de ${oldName} a ${this.userName}`
      );

      this.socket.broadcast.emit("change:name", {
        oldName,
        newName: this.userName,
      });
      this.socket.broadcast.emit("message", {
        value: `El usuario ${oldName} ha cambiado su nombre a ${data.name}`,
        time: new Date().getTime(),
      });
      fn(true);
    } else fn(false);
  }

  sendMessage(message) {
    console.log(
      `Usuario ${message.id} ha enviado ${message.value}: ${new Date(
        message.time
      ).toLocaleTimeString()}`
    );
    this.io.sockets.emit("message", message);
  }

  getMessages() {
    messages.forEach((message) => this.sendMessage(message));
  }

  handleMessage(value) {
    const message = {
      id: uuidv4(),
      user: users.get(this.socket) || this.userName,
      value: value.value,
      key: value.key,
      time: Date.now(),
    };
    messages.add(message);
    this.sendMessage(message);

    setTimeout(() => {
      messages.delete(message);
      this.io.sockets.emit("deleteMessage", message.id);
    }, messageExpirationTimeMS);
  }

  disconnect() {
    console.log(`El usuario ${this.userId} se ha desconectado`);
    this.socket.broadcast.emit("user:left", this.userName);
    this.socket.broadcast.emit("message", {
      vale: `El usuario ${this.userName} se ha desconectado`,
      time: new Date().getTime(),
    });
    users.delete(this.socket);
    userNames.free(this.userName);
  }
}

function chat(io) {
  io.on("connection", (socket) => {
    var con = new Connection(io, socket);
    const id = con.userId;
    const name = con.userName;
    console.log(`Se ha unido ${id} como ${name}`);
    socket.emit("init", { name: name, users: userNames.get() });
    socket.broadcast.emit("user:joined", name);
    socket.broadcast.emit("message", {
      value: `Se ha unido ${name}`,
      time: new Date().getTime(),
    });
  });
}

module.exports = chat;
