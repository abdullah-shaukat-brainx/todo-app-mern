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
      return res.status(422).send({ error: "Cannot accept an empty field!" });
    }
    if (!utilServices.isValidEmailFormat(email))
      return res.status(422).send({ error: "Wrong Format for Email!" });

    if (!utilServices.isValidPasswordFormat(password))
      return res.status(422).send({
        error: "Wrong Format for Password",
      });

    const user = await userServices.findUser({ email: email });
    if (user) {
      return res.status(400).send({ error: "User already exist!" });
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
      return res.status(441).send({ error: "User not Created" });
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
      `${process.env.FRONT_END_URL}/users/verify_email/${token}`,
      `Click the given link to verify your email`
    );

    return res.status(200).json({
      // data: { User: savedUser, Token: token },
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
      return res.status(404).send({ error: "Incorrect Credentials!" });
    }
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword)
      return res.status(404).send({ error: "Password does not match!" });

    const foundUser = await userServices.findUser({
      email: email,
    });

    if (!foundUser.is_email_verified) {
      const currDate = new Date();
      if (foundUser.otp_validity > currDate) {
        return res.status(434).send({
          error:
            "Unverified User, Check already sent mail in inbox to verify account!",
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
        `${process.env.FRONT_END_URL}/users/verify_email/${token}`,
        `Click the given link to verify your email.`
      );

      return res.status(434).send({
        error: "Unverified User, Check email to verify account!",
      });
    }

    const token = jwtServices.generateTokenWithSecret(
      {
        email: foundUser.email,
        id: foundUser._id,
      },
      process.env.SECRET_KEY
    );

    return res
      .set("access-control-expose-headers", "access_token")
      .header("access_token", token)
      .status(200)
      .json({
        data: { User: user },
        message: "Login successful",
      });
  } catch (e) {
    console.log(e);
    res.status(500).send("Something went wrong at server!");
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
        .send({ error: "Password and Confirm Password not same!" });

    if (!utilServices.isValidPasswordFormat(newPassword))
      return res.status(422).send({
        error: "Wrong Format for new Password!",
      });

    const matchUser = await userServices.findUser({ _id: req.userId });
    if (!matchUser) {
      return res.status(404).send({ error: "User does not exist!" });
    }
    const matchPassword = await bcrypt.compare(oldPassword, matchUser.password);
    if (!matchPassword)
      return res
        .status(404)
        .send({ error: "Unable to verify the current (old) password" });

    const user = await userServices.updateUser(
      { email: req.userEmail },
      { password: newPassword },
      { new: true }
    );

    if (!user) {
      return res.status(422).send({ error: "Couldn't Update Password!" });
    }

    return res.status(200).json({ message: "Password Successfully Updated." });
  } catch (e) {
    console.log(e);
    return res.status(500).send({ error: "Something went Wrong." });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(404).send({ error: "Cannot accept an empty field!" });

    const user = await userServices.findUser({ email: email });
    if (!user) {
      return res.status(404).send({ error: "Email does not exist!" });
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
      `${process.env.FRONT_END_URL}/users/reset_password/${token}`,
      `Warning: Dont share the link with anyone!!! \nUse the given link to reset your password.`
    );

    return res.status(200).json({
      // data: { User: user },
      message:
        "Token for Password Reset Generated Successfully. Check inbox for reset link.",
    });
  } catch (e) {
    console.log(e);
    res.status(500).send("Something went wrong!");
  }
};

const resetPassword = async (req, res) => {
  try {
    let { token } = req.params;
    if (token) {
      let { id } = jwtServices.verifyToken(token, process.env.SECRET_KEY);
      req.userId = id;
    } else return res.status(401).send({ error: "Unauthorized user" });

    const { newPassword, confirmNewPassword } = req.body;

    if (!newPassword || !confirmNewPassword)
      return res.status(422).send("Cannot accept an empty field!");

    if (newPassword !== confirmNewPassword)
      return res
        .status(422)
        .send({ error: "Password and Confirm Password not same!" });

    if (!utilServices.isValidPasswordFormat(newPassword))
      return res.status(422).send({
        error: "Wrong Format for new Password!",
      });

    const user = await userServices.updateUser(
      { _id: new mongoose.Types.ObjectId(req.userId) },
      { password: newPassword }
    );

    if (!user) {
      return res.status(422).send({ error: "Couldn't Reset Password!" });
    }

    return res
      .status(200)
      .json({ data: user, message: "Password Successfully Updated." });
  } catch (e) {
    console.log(e);
    return res.status(401).send({ error: "Unauthorized User!!!." });
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
    } else res.status(401).send({ error: "Unauthorized user" });

    const user = await userServices.findUser({
      _id: new mongoose.Types.ObjectId(req.userId),
    });
    const currDate = new Date();

    if (!user) return res.status(415).send({ error: "Email not found!" });

    if (user.otp !== req.userOtp)
      return res.status(415).send({ error: "Wrong OTP Information!" });

    if (user.otpValidity < currDate)
      return res.status(415).send({ error: "OTP has Expired!" });

    const verifiedUser = await userServices.updateUser(
      {
        _id: new mongoose.Types.ObjectId(req.userId),
        is_email_verified: false,
      },
      {
        $unset: { otp: "", otp_validity: "" },
        $set: { is_email_verified: true },
      }
    );
    if (!verifiedUser)
      return res
        .status(422)
        .send({ error: "User does not exist or is already verified!" });

    return res.status(200).json({ message: "Email Verified Successfully!." });
  } catch (e) {
    console.log(e);
    return res.status(401).send({ error: "Unauthorized User!!!." });
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
