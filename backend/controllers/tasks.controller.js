const Task = require("../models/Task");
const mongoose = require("mongoose");
const { TASK_STATUS, TASK_PRIORITY } = require("../constants");
const { dbError, failure, serverError, success } = require("../utils/res");
const { dbTask } = require("../utils/wrapper");
const { MAX_LIMIT } = require("../constants/pagination");

const POPULATE = [
  { path: "project", select: "name" },
  { path: "team", select: "name" },
  { path: "owners", select: "name email" },
];

// map priority -> numeric rank for ordered sorting
const PRIORITY_RANK = TASK_PRIORITY.reduce((acc, p, i) => {
  acc[p] = i;
  return acc;
}, {});

// supported sort keys -> mongo sort spec (priority handled separately)
const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  priorityLowHigh: "priorityAsc",
  priorityHighLow: "priorityDesc",
};

const createTask = async (req, res) => {
  try {
    const {
      name,
      project,
      team,
      owners,
      tags,
      timeToComplete,
      dueDate,
      priority,
      status,
    } = req.body;

    if (
      !name ||
      !project ||
      !team ||
      !owners ||
      timeToComplete == null ||
      !dueDate
    ) {
      return res
        .status(400)
        .json(
          failure(
            "name, project, team, owners, timeToComplete and dueDate are required",
          ),
        );
    }

    if (!Array.isArray(owners) || owners.length === 0) {
      return res.status(400).json(failure("owners must be a non-empty array"));
    }

    if (status && !TASK_STATUS.includes(status)) {
      return res.status(400).json(failure("Invalid status value"));
    }

    if (priority && !TASK_PRIORITY.includes(priority)) {
      return res.status(400).json(failure("Invalid priority value"));
    }

    const task = new Task({
      name,
      project,
      team,
      owners,
      tags,
      timeToComplete,
      dueDate,
      ...(priority && { priority }),
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
    const { team, owner, tags, project, status, sort } = req.query;
    const limit = clampLimitPerPage(req.query.limit);

    const filter = {};
    if (team) filter.team = team;
    if (owner) filter.owners = owner;
    if (project) filter.project = project;
    if (status) filter.status = status;
    if (tags) {
      const tagList = tags.split(",").map((t) => t.trim());
      filter.tags = { $in: tagList };
    }

    const { page, totalPages } = await clampPage(req.query.page, limit, filter);
    const skip = (page - 1) * limit;

    const sortSpec = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;
    const isPrioritySort =
      sortSpec === "priorityAsc" || sortSpec === "priorityDesc";

    let query;
    if (isPrioritySort) {
      // enum strings don't sort by rank, so compute a numeric rank
      const dir = sortSpec === "priorityAsc" ? 1 : -1;
      const branches = TASK_PRIORITY.map((p) => ({
        case: { $eq: ["$priority", p] },
        then: PRIORITY_RANK[p],
      }));

      // aggregation does NOT auto-cast strings to ObjectId the way
      // find() does, so cast the id filters explicitly
      const matchStage = { ...filter };
      ["project", "team"].forEach((key) => {
        if (matchStage[key]) {
          matchStage[key] = new mongoose.Types.ObjectId(matchStage[key]);
        }
      });
      if (matchStage.owners) {
        matchStage.owners = new mongoose.Types.ObjectId(matchStage.owners);
      }

      query = Task.aggregate([
        { $match: matchStage },
        {
          $addFields: {
            _priorityRank: {
              $switch: { branches, default: PRIORITY_RANK.Medium },
            },
          },
        },
        { $sort: { _priorityRank: dir, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]).then((docs) => Task.populate(docs, POPULATE));
    } else {
      query = Task.find(filter)
        .populate(POPULATE)
        .sort(sortSpec)
        .skip(skip)
        .limit(limit);
    }

    const { data: tasks, error } = await dbTask(() => query);
    if (error) {
      console.log("Error fetching tasks : ", error);
      return dbError(res);
    }

    return res.status(200).json(
      success(
        {
          tasks,
          pagination: {
            page,
            limit,
            totalPages,
          },
        },
        "Tasks fetched",
      ),
    );
  } catch (error) {
    console.log("Error at controller : getTasks ", error);
    return serverError(res);
  }
};

async function clampPage(page, limit, filter = {}) {
  const { data: count, error } = await dbTask(() =>
    Task.countDocuments(filter),
  );
  const totalPages = Math.max(1, Math.ceil(count / limit));

  page = Math.max(1, page || 1);
  page = Math.min(totalPages, page);
  return { page, totalPages };
}

function clampLimitPerPage(limit) {
  limit = Math.max(1, limit || 1);
  limit = Math.min(MAX_LIMIT.tasks, limit);
  return limit;
}

const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await dbTask(() =>
      Task.findById(id).populate(POPULATE),
    );
    if (error) {
      console.log("Error fetching task : ", error);
      return dbError(res);
    }
    if (!data) {
      return res.status(404).json(failure("Task not found"));
    }

    return res.status(200).json(success(data, "Task fetched"));
  } catch (error) {
    console.log("Error at controller : getTask ", error);
    return serverError(res);
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      project,
      team,
      owners,
      tags,
      timeToComplete,
      dueDate,
      priority,
      status,
    } = req.body;

    if (status && !TASK_STATUS.includes(status)) {
      return res.status(400).json(failure("Invalid status value"));
    }

    if (priority && !TASK_PRIORITY.includes(priority)) {
      return res.status(400).json(failure("Invalid priority value"));
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
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;
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
  getTask,
  updateTask,
  deleteTask,
};
