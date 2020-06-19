const app = require("express")();
const http = require("http").createServer(app);
// instancia no servidor
const io = require("socket.io")(http);
let messages = {};
let clients = [];
// CONEXÃO ESTABELECIDA
io.on("connection", (socket) => {
  socket.on("register", (nickname) => {
    socket.nickname = nickname;
    socket.emit("register", nickname);
    clients.push({
      nickname,
      id: socket.id,
      status: 'online'
    });

    io.emit("clientsList", clients);
  });

  socket.on("oldMessages", (id) => {
    socket.emit("oldMessages", messages[id] || []);
  });

  socket.on("privateMessage", (msg) => {
    messages[msg.to] = [];
    const index = messages[msg.to];
    index.push(msg);
    messages[msg.to] = index;
    socket.join(msg.to);
    io.to(msg.to).emit('privateMessage', { ...msg, socketId: socket.id, })

  });

  socket.on("message", (msg) => {
    io.emit("message", {
      ...msg,
      socketId: socket.id,
    });
  });

  socket.on("userIsTyping", (userIsTyping) => {
    socket.broadcast.emit("userIsTyping", {
      userIsTyping,
      nickname: socket.nickname,
    });
  });

  socket.on("statusChange", (data) => {
    const socketIndex = clients.findIndex((client) => client.id === data.id);
    const foundSocket = clients[socketIndex];
    clients[socketIndex] = {
      ...foundSocket,
      status: data.status,
    };

    io.emit("clientsList", clients);
  });

  socket.on("disconnect", () => {
    clients = clients.filter((client) => client.nickname != socket.nickname);
    io.emit('clientsList', clients);
  });
});

const appPort = process.env.PORT || 3000;

http.listen(appPort, () => {
  console.log("listening on" + appPort);
});
