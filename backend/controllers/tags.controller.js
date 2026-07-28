const Tag = require("../models/Tag");
const { dbError, failure, serverError, success } = require("../utils/res");
const { dbTask } = require("../utils/wrapper");

const createTag = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json(failure("name is required"));
    }

    const { data: existing, error: findErr } = await dbTask(() =>
      Tag.findOne({ name }),
    );
    if (findErr) {
      console.log("Error finding existing tag : ", findErr);
      return dbError(res);
    }
    if (existing) {
      return res.status(409).json(failure("Tag already exists"));
    }

    const tag = new Tag({ name });

    const { data, error } = await dbTask(() => tag.save());
    if (error) {
      console.log("Error creating tag : ", error);
      return dbError(res);
    }

    return res.status(201).json(success(data, "Tag created"));
  } catch (error) {
    console.log("Error at controller : createTag ", error);
    return serverError(res);
  }
};

const getTags = async (req, res) => {
  try {
    const { data, error } = await dbTask(() => Tag.find().sort({ name: 1 }));
    if (error) {
      console.log("Error fetching tags : ", error);
      return dbError(res);
    }

    return res.status(200).json(success(data, "Tags fetched"));
  } catch (error) {
    console.log("Error at controller : getTags ", error);
    return serverError(res);
  }
};

module.exports = {
  createTag,
  getTags,
};
