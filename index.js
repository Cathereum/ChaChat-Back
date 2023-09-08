const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const router = require("./router");
const { addUser, isExistUser, getRoomUsers, removeUser } = require("./usersDB");

const app = express();
app.use(cors({ origin: "*" }));
app.use(router);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  /*new user has join + auto server Messages*/
  socket.on("join", (userToJoin) => {
    socket.join(userToJoin.room);

    const { isExist, currentUser } = addUser(userToJoin);

    const messageToChat = isExist
      ? `${currentUser.userName}, glad to see you again!`
      : `${currentUser.userName}, welcome!`;

    socket.emit("messageToChat", {
      data: { user: { userName: "Admin" }, message: messageToChat },
    });

    socket.broadcast.to(currentUser.room).emit("messageToChat", {
      data: {
        user: { userName: "Admin" },
        message: `${currentUser.userName} has joined`,
      },
    });

    io.to(currentUser.room).emit("usersInRoom", {
      data: { usersInRoom: getRoomUsers(currentUser.room) },
    });
  });

  /*user send message to chat*/
  socket.on("userMessage", ({ userMessage, activeUser }) => {
    const currentUser = isExistUser(activeUser);

    if (currentUser) {
      io.to(currentUser.room).emit("messageToChat", {
        data: { user: currentUser, message: userMessage },
      });
    }
  });

  /*user left chat*/
  socket.on("leftRoom", ({ activeUser }) => {
    const currentUser = removeUser(activeUser);

    if (currentUser) {
      io.to(currentUser.room).emit("messageToChat", {
        data: {
          user: { userName: "Admin" },
          message: `${currentUser.userName} has left`,
        },
      });

      io.to(currentUser.room).emit("usersInRoom", {
        data: { usersInRoom: getRoomUsers(currentUser.room) },
      });
    }
  });

  /*DISCONNECT*/
  io.on("disconnect", () => {
    console.log("Disconnect");
  });
});

server.listen(8082, () => {
  console.log("Server is running");
});
