const express = require("express");
const router = express.Router();
const auth = require("../middlewares");

const { todoController } = require("../controllers");

router.use(express.urlencoded({ extended: false }));

router.get("/getTodos", auth.auth, todoController.getTodos);
router.post("/createTodo", auth.auth, todoController.createTodo);
router.put("/updateTodo/:id", auth.auth, todoController.updateTodo);
router.delete("/deleteTodo/:id", auth.auth, todoController.deleteTodo);

module.exports = router;
