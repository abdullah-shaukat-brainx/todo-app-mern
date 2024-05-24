const express = require("express");
const { todoServices } = require("../services");
const mongoose = require("mongoose");

const createTodo = async (req, res) => {
  try {
    const { text, status } = req.body;
    if (!text || !status)
      return res
        .status(422)
        .json({ error: "Text and Status fields cant be empty!" });

    const savedTodo = await todoServices.addTodo({
      text: text,
      status: status,
      user: new mongoose.Types.ObjectId(req.userId),
    });

    if (!savedTodo) {
      return res.status(441).json({ error: "Todo not Created" });
    }

    return res.status(200).json({
      data: savedTodo,
      message: "Todo added successfully!",
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Unable to create Todo." });
  }
};

const getTodos = async (req, res) => {
  try {
    const todos = await todoServices.findTodos({
      user: new mongoose.Types.ObjectId(req.userId),
    });
    if (todos.length === 0)
      return res.status(401).json({ error: "No Todo data found against this user." });

    return res.status(200).json({
      data: { Todos: todos },
      message: `Todos for ${req.userId} retrieved successfully`,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Unable to retrieve Todos." });
  }
};

const updateTodo = async (req, res) => {
  try {
    const todoId = req.params.id;
    const { text, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(todoId)) {
      return res.status(400).json({ error: "Invalid Todo ID." });
    }

    if (!todoId || !text || !status)
      return res.status(500).json({ error: "Todo information missing." });

    const updatedTodo = await todoServices.findAndUpdateTodo(
      { _id: new mongoose.Types.ObjectId(todoId) },
      { text: text, status: status },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ error: "Wrong todo Id." });
    }

    res.status(200).json({
      data: updatedTodo,
      message: `Todo with id: ${todoId} updated successfully!`,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Unable to update Todo." });
  }
};

const deleteTodo = async (req, res) => {
  try {
    const todoId = new mongoose.Types.ObjectId(req.params.id);
    if (!todoId)
      return res
        .status(400)
        .json({ error: "Todo id is missing from request parameters." });

    const deletedTodo = await todoServices.findAndDeleteTodo({
      _id: todoId,
    });

    if (!deletedTodo)
      return res
        .status(404)
        .json({ error: "Todo item with the entered id does not exist." });

    return res.status(200).json({
      data: deletedTodo,
      message: `Todo with id: ${todoId} deleted successfully!`,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "Error occoured at the server." });
  }
};

module.exports = {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
};