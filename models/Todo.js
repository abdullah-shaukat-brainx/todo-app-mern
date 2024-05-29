const mongoose = require("mongoose");
const { TODO_STATUS_ENUM } = require("../constants/index");
const TodoSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum:TODO_STATUS_ENUM,
      default: "Uncompleted",
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Todo = mongoose.model("Todo", TodoSchema);

module.exports = Todo;