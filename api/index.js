const app = require("express")();
const http = require("http").createServer(app);
// instancia no servidor
const io = require("socket.io")(http);

// CONEXÃO ESTABELECIDA
io.on("connection", (socket) => {
  socket.on("register", (nickname) => {
    socket.nickname = nickname;
    socket.emit("register", nickname);
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
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
