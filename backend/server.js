const express = require("express");
const cors = require("cors");
require("./api/data/db");
const bodyParser = require("body-parser");
const projectRouter = require("./api/data/routes/routes");

require('dotenv').config();
const { Pool } = require("pg");

const app = express();
app.use(express.json());
app.use(cors());

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
   }
   pool.end();
});

app.use(bodyParser.json());
app.use("/api/", projectRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
   console.log(`\nServer running at http://localhost:${PORT}`);
});
