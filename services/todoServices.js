const { Todo } = require("../models");

const addTodo = async (data) => {
  return await Todo.create(data);
};

const findTodos = async (condition) => {
  const todos = await Todo.find(condition);
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

module.exports = {
  addTodo,
  findTodos,
  findAndUpdateTodo,
  findAndDeleteTodo,
};