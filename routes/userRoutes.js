const express = require("express");
const router = express.Router();

const { userController } = require("../controllers");
const auth = require("../middlewares");

router.use(express.urlencoded({ extended: false }));

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/change_password", auth.auth, userController.changePassword);
router.post("/forget_password", userController.forgetPassword);
router.put("/reset_password/:token", userController.resetPassword);
router.put("/verify_email/:token", userController.verifyEmail);

module.exports = router;
