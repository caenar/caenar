const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const router = require("./api/routes/routes");
const sequelize = require("./api/db");
require("dotenv").config();

const env = process.env.NODE_ENV || 'development';
const originUrl = process.env[`ORIGIN_URL_${env.toUpperCase()}`];
console.log("\nNode environment: "+env);
console.log("Origin URL: " + originUrl + "\n");

const { Pool } = require("pg");

const app = express();
app.use(express.json());
app.use(cors({
  origin: originUrl,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

const pool = new Pool({
   user: process.env.DB_USER,
   host: process.env.DB_HOST,
   database: process.env.DB_NAME,
   password: process.env.DB_PASSWORD,
   port: process.env.DB_PORT,
});

pool.query("SELECT NOW()", (err, res) => {
   if (err) {
      console.error("Error executing query:", err);
   } else {
      console.log("Connected to PostgreSQL database");
      console.log("Current date from database:", res.rows[0].now);
      console.log();
   }
   pool.end();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", router);
app.use("/projects", express.static(__dirname + "/assets/projects"));
app.use("/archive", express.static(__dirname + "/assets/archive"));

sequelize
  .sync()
  .then(() => {
    console.log("\nSynced tables.");
  })
  .catch((err) => {
    console.error(err);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
   console.log(`Server running at http://localhost:${PORT}\n`);
});
