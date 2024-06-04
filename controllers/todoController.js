const { todoServices } = require("../services");
const mongoose = require("mongoose");

const createTodo = async (req, res) => {
  try {
    const { text, status } = req.body;
    if (!text || !status)
      return res
        .status(422)
        .send({ error: "Text and Status fields cant be empty!" });

    const savedTodo = await todoServices.addTodo({
      text: text,
      status: status,
      user_id: new mongoose.Types.ObjectId(req.userId),
    });

    if (!savedTodo) {
      return res.status(441).send({ error: "Todo not Created" });
    }

    return res.status(200).json({
      // data: savedTodo,
      message: "Todo added successfully!",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: "Unable to create Todo." });
  }
};

const getTodos = async (req, res) => {
  try {
    const todos = await todoServices.findTodos({
      user_id: new mongoose.Types.ObjectId(req.userId),
    });

    return res.status(200).json({
      data: { Todos: todos.reverse() },
      message: `Todos for ${req.userEmail} retrieved successfully`,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: "Unable to retrieve Todos." });
  }
};

const updateTodo = async (req, res) => {
  try {
    const todoId = req.params.id;
    const { text, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      return res.status(400).send({ error: "Invalid Todo ID." });
    }

    if (!todoId || !text || !status)
      return res.status(500).send({ error: "Todo information missing." });

    const updatedTodo = await todoServices.findAndUpdateTodo(
      { _id: new mongoose.Types.ObjectId(todoId) },
      { text: text, status: status },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).send({ error: "Wrong todo Id." });
    }

    res.status(200).json({
      // data: updatedTodo,
      message: `Todo with id: ${todoId} updated successfully!`,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: "Unable to update Todo." });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const todoId = new mongoose.Types.ObjectId(req.params.id);
    if (!todoId)
      return res
        .status(400)
        .send({ error: "Todo id is missing from request parameters." });

    const deletedTodo = await todoServices.findAndDeleteTodo({
      _id: todoId,
    });

    if (!deletedTodo)
      return res
        .status(404)
        .send({ error: "Todo item with the entered id does not exist." });

    return res.status(200).json({
      // data: deletedTodo,
      message: `Todo with id: ${todoId} deleted successfully!`,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: "Error occoured at the server." });
  }
};

module.exports = {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
};
