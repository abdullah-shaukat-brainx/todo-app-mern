const express = require("express");
const { userServices, utilServices, emailServices } = require("../services");
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

    let FourDigitPin = utilServices.getRandomFourDigit().toString();
    let date = new Date();
    date.setHours(date.getHours() + 1);

    const savedUser = await userServices.addUser({
      email: email,
      password: hashedPassword,
      otp: FourDigitPin,
      otpValidity: date,
      isEmailVerified: false,
    });

    if (!savedUser) {
      return res.status(441).json({ error: "User not Created" });
    }

    const token = jwt.sign(
      {
        email: savedUser.email,
        id: savedUser._id,
        otp: savedUser.otp,
      },
      SECRET_KEY
    );

    await emailServices.sendEmail(
      email,
      `Verify Email`,
      `Click this link to Verify: ${HOST}/user/verifyEmail/${token}`
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

    const user = await userServices.updateUser(
      { email: req.userEmail },
      { password: hashednewPassword }
    );

    if (!user) {
      return res.status(422).json({ error: "Couldn't Update Password!" });
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

    await emailServices.sendEmail(
      email,
      `Reset Password`,
      `Click this link to Reset Password: ${HOST}/user/resetPassword/${token}`
    );

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

    const user = await userServices.updateUser(
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

const verifyEmail = async (req, res) => {
  try {
    let token = req.params.token;
    if (token) {
      let obj = jwt.verify(token, SECRET_KEY);
      req.userEmail = obj.email;
      req.userOtp = obj.otp;
      req.userId = obj.id;
    } else res.status(401).json({ error: "Unauthorized user" });

    const user = await userServices.findUser({
      _id: new mongoose.Types.ObjectId(req.userId),
    });
    const currDate = new Date();

    if (!user) return res.status(415).json({ error: "Email not found!" });

    if (user.otp !== req.userOtp)
      return res.status(415).json({ error: "Wrong OTP Information!" });

    if (user.otpValidity < currDate)
      return res.status(415).json({ error: "OTP has Expired!" });

    const verifiedUser = await userServices.updateUser(
      { _id: new mongoose.Types.ObjectId(req.userId) },
      { otp: undefined, otpValidity: undefined, isEmailVerified: true },
      { new: true }
    );
    if (!verifiedUser)
      return res.status(422).json({ error: "Couldn't Verify Email!" });

    return res
      .status(200)
      .json({ data: user, message: "Email Verified Successfully!." });
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
  verifyEmail,
};