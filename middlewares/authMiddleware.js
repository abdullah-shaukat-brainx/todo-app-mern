const { jwtServices, userServices } = require("../services");
const auth = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token) {
      token = token.split(" ")[1];

      let user = jwtServices.verifyToken(token, process.env.SECRET_KEY);
      req.userId = user?.id;
      req.userEmail = user?.email;


      const userVerified = await userServices.findUser({
        email: req.userEmail,
      });
      if (userVerified.is_email_verfied === false) {
        return res.status(401).json({ error: "User not verified" });
        
      }
      next();
    } else {
      return res.status(401).json({ error: "Unauthorized user" });
    }
  } catch (e) {
    console.log(e);
    return res.status(401).json({ error: "Unauthorized user" });
  }
};
module.exports = auth;
