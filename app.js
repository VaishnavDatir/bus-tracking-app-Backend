const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");

const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const busRoutes = require("./routes/bus");

const app = express();

require("dotenv").config();

app.use(helmet());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Header", "Content-Type,Authorization");
  res.setHeader("Content-Type", "application/json; charset=UTF-8");
  next();
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/bus", busRoutes);

app.use((error, req, res, next) => {
  console.log("in app.js error: " + error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  const code = error.code || -4;

  res.status(status).json({
    success: false,
    message: message,
    data: data,
    code: code,
  });
});

const MONGODB_URI = process.env.DB_CONNECTION_STRING;

const activeUsers = [];

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const server = app.listen(process.env.PORT || 8080, () => {
      console.log(
        `🌍 is listening at http://localhost:${process.env.PORT || 8080}`
      );
    });

    const io = require("./socket").init(server);

    io.on("connection", (socket) => {
      console.log("client connected...", socket.id);

      socket.on("disconnect", function () {
        console.log("client disconnect...", socket.id);
        console.log(activeUsers);

        const index = activeUsers.findIndex(
          (_item) => _item.client_id === "30abNEN9TcuLE82XAAAD"
        );
        console.log(index);

        activeUsers.splice(index, 1);
        console.log(activeUsers);

        io.emit("message", [...activeUsers]);
      });

      socket.on("message", function (data) {
        var gotD = JSON.parse(data);

        const index = activeUsers.findIndex(
          (_item) => _item.client_id === socket.id
        );

        if (index < 0) {
          activeUsers.push({
            client_id: socket.id,
            data: gotD,
          });
        } else {
          activeUsers[index].data = gotD;
        }
        io.emit("message", [...activeUsers]);
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
