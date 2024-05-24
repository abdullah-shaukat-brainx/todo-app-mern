const { userServices } = require("../services");
const SECRET_KEY = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");
const auth = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      token = token.split(" ")[1];

      let user = jwt.verify(token, SECRET_KEY);
      req.userId = user?.id;
      req.userEmail = user?.email;

      const userVerified = userServices.findUser({ email: req.userEmail });

      if (userVerified.isEmailVerfied === false) {
        res.status(401).json({ error: "User not verified" });
      }
    } else res.status(401).json({ error: "Unauthorized user" });
    next();
  } catch (e) {
    res.status(401).json({ error: "Unauthorized user" });
    console.log(e);
  }
};
module.exports = auth;