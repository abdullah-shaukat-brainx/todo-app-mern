const express = require("express");
const router = express.Router();

const { todoController } = require("../controllers");

router.use(express.urlencoded({ extended: false }));

router.get("/get_todos", todoController.getTodos);
router.post("/create_todo", todoController.createTodo);
router.put("/update_todo/:id",todoController.updateTodo);
router.delete("/delete_todo/:id", todoController.deleteTodo);

module.exports = router;