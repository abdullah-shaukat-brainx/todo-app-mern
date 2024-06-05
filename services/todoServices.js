const mongoose = require("mongoose");
const { Todo } = require("../models");
const addTodo = async (data) => {
  return await Todo.create(data);
};

const findTodos = async (condition, limit, skip) => {
  const todos = await Todo.find(condition).skip(skip).limit(limit);
  return todos;
};

const findAndUpdateTodo = async (condition, data) => {
  const todo = await Todo.findOneAndUpdate(condition, data);
  return todo;
};

const findAndDeleteTodo = async (condition) => {
  const todo = await Todo.findByIdAndDelete(condition);
  return todo;
};

const aggregateTodoQuery = async (query) => {
  return await Todo.aggregate(query);
};

module.exports = {
  addTodo,
  findTodos,
  findAndUpdateTodo,
  findAndDeleteTodo,
  aggregateTodoQuery,
};
