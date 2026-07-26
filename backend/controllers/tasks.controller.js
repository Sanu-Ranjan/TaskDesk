const Task = require("../models/Task");
const { TASK_STATUS } = require("../constants");
const { dbError, failure, serverError, success } = require("../utils/res");
const { dbTask } = require("../utils/wrapper");

const POPULATE = [
  { path: "project", select: "name" },
  { path: "team", select: "name" },
  { path: "owners", select: "name email" },
];

const createTask = async (req, res) => {
  try {
    const { name, project, team, owners, tags, timeToComplete, status } =
      req.body;

    if (!name || !project || !team || !owners || timeToComplete == null) {
      return res
        .status(400)
        .json(
          failure(
            "name, project, team, owners and timeToComplete are required",
          ),
        );
    }

    if (!Array.isArray(owners) || owners.length === 0) {
      return res.status(400).json(failure("owners must be a non-empty array"));
    }

    if (status && !TASK_STATUS.includes(status)) {
      return res.status(400).json(failure("Invalid status value"));
    }

    const task = new Task({
      name,
      project,
      team,
      owners,
      tags,
      timeToComplete,
      ...(status && { status }),
    });

    const { data, error } = await dbTask(() => task.save());
    if (error) {
      console.log("Error creating task : ", error);
      return dbError(res);
    }

    const { data: populated, error: popErr } = await dbTask(() =>
      data.populate(POPULATE),
    );
    if (popErr) {
      console.log("Error populating task : ", popErr);
      return dbError(res);
    }

    return res.status(201).json(success(populated, "Task created"));
  } catch (error) {
    console.log("Error at controller : createTask ", error);
    return serverError(res);
  }
};

const getTasks = async (req, res) => {
  try {
    const { team, owner, tags, project, status } = req.query;

    const filter = {};
    if (team) filter.team = team;
    if (owner) filter.owners = owner;
    if (project) filter.project = project;
    if (status) filter.status = status;
    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim());
      filter.tags = { $in: tagList };
    }

    const { data, error } = await dbTask(() =>
      Task.find(filter).populate(POPULATE).sort({ createdAt: -1 }),
    );
    if (error) {
      console.log("Error fetching tasks : ", error);
      return dbError(res);
    }

    return res.status(200).json(success(data, "Tasks fetched"));
  } catch (error) {
    console.log("Error at controller : getTasks ", error);
    return serverError(res);
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, project, team, owners, tags, timeToComplete, status } =
      req.body;

    if (status && !TASK_STATUS.includes(status)) {
      return res.status(400).json(failure("Invalid status value"));
    }

    if (owners && (!Array.isArray(owners) || owners.length === 0)) {
      return res.status(400).json(failure("owners must be a non-empty array"));
    }

    const { data: task, error: findErr } = await dbTask(() =>
      Task.findById(id),
    );
    if (findErr) {
      console.log("Error finding task : ", findErr);
      return dbError(res);
    }
    if (!task) {
      return res.status(404).json(failure("Task not found"));
    }

    if (name !== undefined) task.name = name;
    if (project !== undefined) task.project = project;
    if (team !== undefined) task.team = team;
    if (owners !== undefined) task.owners = owners;
    if (tags !== undefined) task.tags = tags;
    if (timeToComplete !== undefined) task.timeToComplete = timeToComplete;
    if (status !== undefined) task.status = status;

    const { data, error } = await dbTask(() =>
      task.save().then((t) => t.populate(POPULATE)),
    );
    if (error) {
      console.log("Error updating task : ", error);
      return dbError(res);
    }

    return res.status(200).json(success(data, "Task updated"));
  } catch (error) {
    console.log("Error at controller : updateTask ", error);
    return serverError(res);
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await dbTask(() => Task.findByIdAndDelete(id));
    if (error) {
      console.log("Error deleting task : ", error);
      return dbError(res);
    }
    if (!data) {
      return res.status(404).json(failure("Task not found"));
    }

    return res.status(200).json(success(null, "Task deleted"));
  } catch (error) {
    console.log("Error at controller : deleteTask ", error);
    return serverError(res);
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};
