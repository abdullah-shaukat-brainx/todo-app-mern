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
    } else res.status(401).json({ error: "Unauthorized user" });
    next();
  } catch (e) {
    res.status(401).json({ error: "Unauthorized user" });
    console.log(e);
  }
};
module.exports = auth;
