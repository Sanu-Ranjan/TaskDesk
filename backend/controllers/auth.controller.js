const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { SALT_ROUNDS, JWT_EXPIRES_IN } = require("../constants/index");
const cookieConfig = require("../constants/cookie");
const { dbError, failure, serverError, success } = require("../utils/res");
const { dbTask } = require("../utils/wrapper");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json(failure("name, email and password are required"));
    }

    const { data: existingUser, error } = await dbTask(() =>
      User.findOne({ email }),
    );
    if (error) {
      console.log("Error finding existing user", error);
      return dbError(res);
    }
    if (existingUser) {
      return res.status(409).json(failure("Email already registered"));
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ name, email, password: hashedPassword });

    const { error: err } = await dbTask(() => user.save());
    if (err) {
      console.log("Error adding new user", err);
      return dbError(res);
    }

    return res.status(201).json(success(null, "user registered"));
  } catch (error) {
    console.log("Error at signup controller : ", error);
    return serverError(res);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json(failure("email and password are required"));
    }

    const { data: user, error } = await dbTask(() => User.findOne({ email }));
    if (error) {
      console.log("Error finding existing user : ", error);
      return dbError(res);
    }
    if (!user) {
      return res.status(401).json(failure("Invalid email or password"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(failure("Invalid email or password"));
    }

    const jwt_secret = process.env.JWT_SECRET;
    const token = jwt.sign({ name: user.name, email: user.email }, jwt_secret, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.cookie("token", token, {
      ...cookieConfig,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(success(null, "User logged in"));
  } catch (error) {
    console.log("Error at controller : login ", error);
    return serverError(res);
  }
};

const me = async (req, res) => {
  try {
    const { data: user, error } = await dbTask(() =>
      User.findOne({ email: req.user.email }).select("-password"),
    );
    if (error) {
      console.log("Error finding user : ", error);
      return dbError(res);
    }
    if (!user) {
      return res.status(404).json(failure("User not found"));
    }

    return res.status(200).json(success(user, "User fetched"));
  } catch (error) {
    console.log("Error at controller : me ", error);
    return serverError(res);
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", cookieConfig);
    return res.status(200).json(success(null, "User logged out"));
  } catch (error) {
    console.log("Error at controller : logout ", error);
    return serverError(res);
  }
};

module.exports = {
  signup,
  login,
  me,
  logout,
};
