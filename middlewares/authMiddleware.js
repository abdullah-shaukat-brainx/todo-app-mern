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
        _id: req.userId,
      });
      if (!userVerified.is_email_verified) {
        return res.status(401).send({ error: "User not verified" });
      }
      next();
    } else {
      return res
        .status(401)
        .send({ error: "Unauthorized user: Token not found" });
    }
  } catch (e) {
    console.log(e);
    return res.status(401).send({ error: "Unauthorized user: Invalid Token" });
  }
};
module.exports = auth;
