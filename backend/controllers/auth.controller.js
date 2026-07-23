const User = require("../models/User");
const bcrypt = require("bcrypt");
const { SALT_ROUNDS } = require("../constants/index");

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

    const { data, error: err } = await dbTask(() => user.save());
    if (err) {
      console.log("Error adding new user", error);
      return dbError(res);
    }

    return res.status(201).json(success(data, "user registered"));
  } catch (error) {
    console.log("Error at signup controller : ", error);
    return serverError(res);
  }
};

const login = async (req, res) => {};

const me = async (req, res) => {};

const logout = async (req, res) => {};

function success(data, message = "Success") {
  return { success: true, message, data };
}

function failure(message, error = null) {
  return { success: false, message, error };
}

function dbError(res) {
  return res.status(500).json(failure("database operation failed"));
}

function serverError(res) {
  return res.status(500).json(failure("Internal server error"));
}

async function dbTask(fn) {
  try {
    const result = await fn();
    return { data: result, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

module.exports = {
  signup,
  login,
  me,
  logout,
};
