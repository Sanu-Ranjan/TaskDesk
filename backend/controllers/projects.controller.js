const Project = require("../models/Project");
const { dbError, failure, serverError, success } = require("../utils/res");
const { dbTask } = require("../utils/wrapper");

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json(failure("name is required"));
    }

    const { data: existing, error: findErr } = await dbTask(() =>
      Project.findOne({ name }),
    );
    if (findErr) {
      console.log("Error finding existing project : ", findErr);
      return dbError(res);
    }
    if (existing) {
      return res.status(409).json(failure("Project name already exists"));
    }

    const project = new Project({ name, description });

    const { data, error } = await dbTask(() => project.save());
    if (error) {
      console.log("Error creating project : ", error);
      return dbError(res);
    }

    return res.status(201).json(success(data, "Project created"));
  } catch (error) {
    console.log("Error at controller : createProject ", error);
    return serverError(res);
  }
};

const getProjects = async (req, res) => {
  try {
    const { data, error } = await dbTask(() =>
      Project.find().sort({ createdAt: -1 }),
    );
    if (error) {
      console.log("Error fetching projects : ", error);
      return dbError(res);
    }

    return res.status(200).json(success(data, "Projects fetched"));
  } catch (error) {
    console.log("Error at controller : getProjects ", error);
    return serverError(res);
  }
};

const getProject = async (req, res) => {};

const updateProject = async (req, res) => {};

const deleteProject = async (req, res) => {};

module.exports = {
  createProject,
  getProjects,
};
