const Project = require("../models/Project");
const { dbError, failure, serverError, success } = require("../utils/res");
const { dbTask } = require("../utils/wrapper");
const { MAX_LIMIT } = require("../constants/pagination");

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
    const limit = clampLimitPerPage(req.query.limit);
    const { page, totalPages } = await clampPage(req.query.page, limit);
    const skip = (page - 1) * limit;

    const { data: projects, error } = await dbTask(() =>
      Project.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    );

    if (error) {
      console.log("Error fetching projects : ", error);
      return dbError(res);
    }

    return res.status(200).json(
      success(
        {
          projects,
          pagination: {
            page,
            limit,
            totalPages,
          },
        },
        "Projects fetched",
      ),
    );
  } catch (error) {
    console.log("Error at controller : getProjects ", error);
    return serverError(res);
  }
};

const getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await dbTask(() => Project.findById(id));
    if (error) {
      console.log("Error fetching project : ", error);
      return dbError(res);
    }
    if (!data) {
      return res.status(404).json(failure("Project not found"));
    }

    return res.status(200).json(success(data, "Project fetched"));
  } catch (error) {
    console.log("Error at controller : getProject ");
    return serverError(res);
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const { data: project, error: findErr } = await dbTask(() =>
      Project.findById(id),
    );
    if (findErr) {
      console.log("Error finding project : ", error);
      dbError(res);
    }

    if (!project) {
      return res.status(404).json(failure("Project not found"));
    }

    if (name !== undefined && name !== project.name) {
      const { data: dup, error: dupErr } = await dbTask(() =>
        Project.findOne({ name }),
      );
      if (dupErr) {
        console.log("Error checking duplicate project : ", dupErr);
        return dbError(res);
      }
      if (dup) {
        return res.status(409).json(failure("Project name already exists"));
      }
      project.name = name;
    }
    if (description !== undefined) project.description = description;

    const { data, error } = await dbTask(() => project.save());
    if (error) {
      console.log("Error updating project : ", error);
      return dbError(res);
    }

    return res.status(200).json(success(data, "Project updated"));
  } catch (error) {
    console.log("Error at controller updateProject : ", error);
    serverError(res);
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: project, error: delError } = await dbTask(() =>
      Project.findByIdAndDelete(id),
    );
    if (delError) {
      console.log("Error finding Project : ", error);
      dbError(res);
    }

    if (!project) {
      return res.status(404).json(failure("Project not found"));
    }

    res.status(200).json(success(null, "Project deleted"));
  } catch (error) {
    console.log("Error at controller deleteProject : ", error);
    serverError(res);
  }
};

async function clampPage(page, limit) {
  const { data: count, error } = await dbTask(() => Project.countDocuments());
  const totalPages = Math.ceil(count / limit);

  page = Math.max(1, page || 1);
  page = Math.min(totalPages, page);
  return { page, totalPages };
}

function clampLimitPerPage(limit) {
  limit = Math.max(1, limit || 1);
  limit = Math.min(MAX_LIMIT.projects, limit);
  return limit;
}

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
