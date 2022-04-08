const mysql = require("mysql");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

const mysqlConnection = require("./connection");
const AuthRoutes = require("./routes/auth");
const cookieParser = require("cookie-parser");
const session = require("express-session");

var app = express();

app.use(bodyParser.json());

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    cookie: {
      express: 60 * 60 * 24,
    },
  })
);
app.use("/", AuthRoutes);

app.listen(3000, () => console.log("Listening on port 3000"));
