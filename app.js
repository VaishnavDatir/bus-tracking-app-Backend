const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");

const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const busRoutes = require("./routes/bus");

const app = express();

require("dotenv").config();

app.use(
  cors({
    origin: "*",
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    exposedHeaders: ["x-auth-token"],
  })
);
app.use(helmet());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Header", "Content-Type,Authorization");
  res.setHeader("Content-Type", "application/json; charset=UTF-8");
  next();
}); */

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

/* const activeUsers = [
  {
    client_id: "MY4iB0fwRQW8WKLxhFAAAE",
    data: {
      _id: "617068716812c68a81a5ccfd",
      busType: "Non-AC",
      busStops: [
        "6170660d6812c68a81a5cce7",
        "617066926812c68a81a5ccec",
        "617067bc199bd7817bd8f693",
        "617066b76812c68a81a5ccf6",
        "61706733199bd7817bd8f68b",
        "61706751199bd7817bd8f68c",
        "6170675d199bd7817bd8f68d",
      ],
      busTimings: [
        "00:00",
        "00:10",
        "12:05",
        "12:15",
        "12:30",
        "12:45",
        "13:00",
        "13:15",
      ],
      busProvider: "NMMT",
      busNumber: "101",
      activeDrivers: ["617065970b84ed340fbd7297"],
      __v: 124,
    },
    latitude: "19.1050533",
    longitude: "73.0017933",
  },
  {
    client_id: "MY4iB0fwRQW8WKLxhFAAmm",
    data: {
      bus: {
        _id: "617068a76812c68a81a5cd00",
        busType: "Non-AC",
        busStops: [
          "6170660d6812c68a81a5cce7",
          "617066926812c68a81a5ccec",
          "617067bc199bd7817bd8f693",
          "617066b76812c68a81a5ccf6",
          "61706733199bd7817bd8f68b",
          "61706751199bd7817bd8f68c",
          "6170675d199bd7817bd8f68d",
        ],
        busTimings: [
          "00:00",
          "00:10",
          "12:05",
          "12:15",
          "12:30",
          "12:45",
          "13:00",
          "13:15",
        ],
        busProvider: "NMMT",
        busNumber: "102",
        activeDrivers: [],
        __v: 1,
      },
      latitude: "19.103193",
      longitude: "73.003630",
    },
  },
]; */

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const server = app.listen(
      process.env.PORT || 8080,
      /* "0.0.0.0", */ () => {
        console.log(
          `🌍 is listening at http://localhost:${process.env.PORT || 8080}`
        );
      }
    );

    const io = require("./socket").init(server);

    io.on("connection", (socket) => {
      console.log("client connected...", socket.id);

      socket.on("disconnect", function () {
        console.log("client disconnect...", socket.id);

        const index = activeUsers.findIndex(
          (_item) => _item.client_id === socket.id
        );

        activeUsers.splice(index, 1);

        io.emit("location", [...activeUsers]);
      });

      socket.on("location", function (data) {
        var gotD = JSON.parse(data);

        // console.log("got: ", gotD);

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
        io.emit("location", [...activeUsers]);
      });

      socket.on("userOfDuty", function () {
        console.log("client off duty...", socket.id);

        const index = activeUsers.findIndex(
          (_item) => _item.client_id === socket.id
        );

        activeUsers.splice(index, 1);

        io.emit("location", [...activeUsers]);
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
