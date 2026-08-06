const User = require("../models/User");
const { dbError, serverError, success } = require("../utils/res");
const { dbTask } = require("../utils/wrapper");

const getUsers = async (req, res) => {
  try {
    const { data, error } = await dbTask(() =>
      User.find().select("name email").sort({ name: 1 }),
    );
    if (error) {
      console.log("Error fetching users : ", error);
      return dbError(res);
    }

    return res.status(200).json(success(data, "Users fetched"));
  } catch (error) {
    console.log("Error at controller : getUsers ", error);
    return serverError(res);
  }
};

module.exports = {
  getUsers,
};
