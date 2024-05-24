const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = process.env.PORT || 3000;

require("dotenv").config();

const { userRoutes, todoRoutes, testRoutes } = require("./routes");

app.use(express.json());
app.use("/user", userRoutes);
app.use("/todo", todoRoutes);
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Connected to DB.`);
      console.log(`Listening for connections at port ${PORT}`);
    });
  })
  .catch(() => {
    console.log("Failed to Connect to DB.");
  });