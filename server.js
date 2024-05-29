const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use("/api/v1", require("./routes"));
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Connected to DB.`);
      console.log(`Listening for connections at port ${process.env.PORT}`);
    });
  })
  .catch(() => {
    console.log("Failed to Connect to DB.");
  });
