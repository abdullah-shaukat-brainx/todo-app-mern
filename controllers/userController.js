const express = require("express");
const { userServices, utilServices } = require("../services");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || 10);
const SECRET_KEY = process.env.SECRET_KEY;
const mongoose = require("mongoose");

const HOST = process.env.HOST;

const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ error: "Cannot accept an empty field!" });
    }

    if (!utilServices.isValidEmailFormat(email))
      return res.status(422).json({ error: "Wrong Format for Email!" });

    if (!utilServices.isValidPasswordFormat(password))
      return res.status(422).json({
        error:
          "Wrong Format for Password: Ensure Atleast 8 characters, atleast 1 uppercase, one lowercase and one numeric character!",
      });

    const user = await userServices.findUser({ email: email.toLowerCase() });
    if (user) {
      return res.status(422).json({ error: "User already exist!" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    if (!hashedPassword) {
      return res.status(500).json({ error: "Something went wrong" });
    }

    const savedUser = userServices.addUser({
      email: email,
      password: hashedPassword,
    });

    if (!savedUser) {
      return res.status(441).json({ error: "User not Created" });
    }

    const token = jwt.sign(
      {
        email: savedUser.email,
        id: savedUser._id,
      },
      process.env.SECRET_KEY
    );
    return res.status(200).json({
      data: { User: savedUser, Token: token },
      message: "Signup successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json("Something went wrong at server!");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.send("Cannot accept an empty field!");

    const user = await userServices.findUser({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "User does not exist!" });
    }
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword)
      return res.status(404).json({ error: "Password does not match!" });

    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
      },
      SECRET_KEY
    );
    return res.status(200).json({
      data: { User: user, Token: token },
      message: "Login successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json("Something went wrong at server!");
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword)
      return res.send("Cannot accept an empty field!");

    if (newPassword !== confirmNewPassword)
      return res
        .status(422)
        .json({ error: "Password and Confirm Password not same!" });

    if (!utilServices.isValidPasswordFormat(newPassword))
      return res.status(422).json({
        error:
          "Wrong Format for new Password: Ensure Atleast 8 characters, atleast 1 uppercase, one lowercase and one numeric character!",
      });

    const matchUser = await userServices.findUser({ email: req.userEmail });
    if (!matchUser) {
      return res.status(404).json({ error: "User does not exist!" });
    }
    const matchPassword = await bcrypt.compare(oldPassword, matchUser.password);
    if (!matchPassword)
      return res
        .status(404)
        .json({ error: "Unable to verify the current (old) password" });

    const hashednewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const user = await userServices.updatePassword(
      { email: req.userEmail },
      { password: hashednewPassword }
    );

    if (!user) {
      return res.status(422).json({ error: "Couldnt Update Password!" });
    }

    return res
      .status(200)
      .json({ data: user, message: "Password Successfully Updated." });
  } catch (e) {
    console.log(e);
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(404).json({ error: "Cannot accept an empty field!" });

    const user = await userServices.findUser({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: "Invaid Email!" });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      SECRET_KEY
    );

    console.log(`${HOST}/user/resetPassword/${token}`); // -- Send token using SMTP at email here --

    return res.status(200).json({
      data: { User: user, Token: token },
      message:
        "Token for Password Reset Generated Successfully. Check email (CONSOLE) for reset link.",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json("Something went wrong!");
  }
};

const resetPassword = async (req, res) => {
  try {
    let token = req.params.token; //When integraing frontend then token comes from client side in body or req headers
    if (token) {
      let { id } = jwt.verify(token, SECRET_KEY);
      req.userId = id;
    } else res.status(401).json({ error: "Unauthorized user" });

    const { newPassword, confirmNewPassword } = req.body;

    if (!newPassword || !confirmNewPassword)
      return res.send("Cannot accept an empty field!");

    if (newPassword !== confirmNewPassword)
      return res
        .status(422)
        .json({ error: "Password and Confirm Password not same!" });

    if (!utilServices.isValidPasswordFormat(newPassword))
      return res.status(422).json({
        error:
          "Wrong Format for new Password: Ensure Atleast 8 characters, atleast 1 uppercase, one lowercase and one numeric character!",
      });

    const hashednewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const user = await userServices.updatePassword(
      { _id: new mongoose.Types.ObjectId(req.userId) },
      { password: hashednewPassword }
    );

    if (!user) {
      return res.status(422).json({ error: "Couldn't Reset Password!" });
    }

    return res
      .status(200)
      .json({ data: user, message: "Password Successfully Updated." });
  } catch (e) {
    console.log(e);
    return res.status(401).json({ error: "Unauthorized User!!!." });
  }
};

module.exports = {
  login,
  signup,
  changePassword,
  forgetPassword,
  resetPassword,
};
