const express = require("express");
const router = express.Router();

const { userController } = require("../controllers");
const auth = require("../middlewares")

router.use(express.urlencoded({ extended: false }));


router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/changePassword", auth.auth, userController.changePassword)
router.post("/forgetPassword",userController.forgetPassword)
router.put("/resetPassword/:token", userController.resetPassword)

module.exports = router;
