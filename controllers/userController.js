const {
  userServices,
  utilServices,
  emailServices,
  jwtServices,
} = require("../services");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

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
          "Wrong Format for Password",
      });

    const user = await userServices.findUser({ email: email });
    if (user) {
      return res.status(422).json({ error: "User already exist!" });
    }


    let FourDigitPin = utilServices.getRandomFourDigit().toString();
    let date = new Date();
    date.setHours(date.getHours() + 1);

    const savedUser = await userServices.addUser({
      email: email,
      password: password,
      otp: FourDigitPin,
      otp_validity: date,
      isEmailVerified: false,
    });

    if (!savedUser) {
      return res.status(441).json({ error: "User not Created" });
    }

    const token = jwtServices.generateTokenWithSecret(
      {
        email: savedUser.email,
        id: savedUser._id,
        otp: savedUser.otp,
      },
      process.env.SECRET_KEY
    );

    emailServices.sendEmail(
      email,
      `Verify Email`,
      `${process.env.HOST}/api/v1/users/verify_email/${token}`
    );

    return res.status(200).json({
      data: { User: savedUser, Token: token },
      message: "Signup successful. Check inbox to verify.",
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

    const user = await userServices.findUser({ email: email });
    if (!user) {
      return res.status(404).json({ error: "User does not exist!" });
    }
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword)
      return res.status(404).json({ error: "Password does not match!" });

    const foundUser = await userServices.findUser({
      email: email,
    });

    if (foundUser.is_email_verified === false) {
      const currDate = new Date()
      if(foundUser.otp_validity>currDate)
        {
          return res.status(434).json({
            message: "Unverified User, Check already sent mail in inbox to verify account!",
          });
        }
      let FourDigitPin = utilServices.getRandomFourDigit().toString();
      let date = new Date();
      date.setHours(date.getHours() + 1);

      const updatedUser = await userServices.updateUser(
        { id: foundUser._id },
        { otp: FourDigitPin, otpValidity: date }
      );

      const token = jwtServices.generateTokenWithSecret(
        {
          email: foundUser.email,
          id: foundUser._id,
          otp: foundUser.otp,
        },
        process.env.SECRET_KEY
      );

      emailServices.sendEmail(
        email,
        `Verify Email`,
        `${process.env.HOST}/api/v1/users/verify_email/${token}`
      );

      return res.status(434).json({
        message: "Unverified User, Check email to verify account!",
      });
    }

    const token = jwtServices.generateTokenWithSecret(
      {
        email: foundUser.email,
        id: foundUser._id,
      },
      process.env.SECRET_KEY
    );

    return res.status(200).json({
      data: { User: user, Token: token }, //this token in headers
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
          "Wrong Format for new Password!",
      });

    const matchUser = await userServices.findUser({ _id: req.userId });
    if (!matchUser) {
      return res.status(404).json({ error: "User does not exist!" });
    }
    const matchPassword = await bcrypt.compare(oldPassword, matchUser.password);
    if (!matchPassword)
      return res
        .status(404)
        .json({ error: "Unable to verify the current (old) password" });

    const user = await userServices.updateUser(
      { email: req.userEmail },
      { password: newPassword },
      { new: true }
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

    const user = await userServices.findUser({ email: email });
    if (!user) {
      return res.status(404).json({ error: "Invaid Email!" });
    }

    const token = jwtServices.generateTokenWithSecret(
      {
        email: user.email,
        id: user._id,
      },
      process.env.SECRET_KEY
    );

    emailServices.sendEmail(
      email,
      `Reset Password`,
      `${process.env.HOST}/api/v1/users/reset_password/${token}`
    );

    return res.status(200).json({
      data: { User: user },
      message:
        "Token for Password Reset Generated Successfully. Check email for reset link.",
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
      let { id } = jwtServices.verifyToken(token, process.env.SECRET_KEY);
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


    const user = await userServices.updateUser(
      { _id: new mongoose.Types.ObjectId(req.userId) },
      { password: newPassword }
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
      let obj = jwtServices.verifyToken(token, process.env.SECRET_KEY);
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
      {
        _id: new mongoose.Types.ObjectId(req.userId),
        is_email_verified: false,
      },
      { otp: undefined, otp_validity: undefined, is_email_verified: true }
    );
    if (!verifiedUser)
      return res
        .status(422)
        .json({ error: "User does not exist or is already verified!" });

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
