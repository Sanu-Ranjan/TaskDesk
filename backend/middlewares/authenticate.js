const jwt = require("jsonwebtoken");

const { failure, serverError, dbError } = require("../utils/res");

async function authenticate(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json(failure("Not authenticated"));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.log("Error: ", err);
      return res.status(401).json(failure("Invalid or expired token"));
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.log("Error at middleware : authenticate ", error);
    return serverError(res);
  }
}

module.exports = {
  authenticate,
};
