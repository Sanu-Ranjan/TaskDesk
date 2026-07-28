const Task = require("../models/Task");
const { dbError, failure, serverError, success } = require("../utils/res");
const { dbTask } = require("../utils/wrapper");

const COMPLETED = "Completed";

const lastWeek = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await dbTask(() =>
      Task.find({
        status: COMPLETED,
        updatedAt: { $gte: sevenDaysAgo },
      })
        .populate([
          { path: "project", select: "name" },
          { path: "team", select: "name" },
          { path: "owners", select: "name email" },
        ])
        .sort({ updatedAt: -1 }),
    );
    if (error) {
      console.log("Error fetching last-week report : ", error);
      return dbError(res);
    }

    return res
      .status(200)
      .json(
        success(
          { count: data.length, tasks: data },
          "Tasks completed in the last week",
        ),
      );
  } catch (error) {
    console.log("Error at controller : lastWeek ", error);
    return serverError(res);
  }
};

const pending = async (req, res) => {
  try {
    const { data, error } = await dbTask(() =>
      Task.aggregate([
        { $match: { status: { $ne: COMPLETED } } },
        {
          $group: {
            _id: null,
            totalDays: { $sum: "$timeToComplete" },
            taskCount: { $sum: 1 },
          },
        },
      ]),
    );
    if (error) {
      console.log("Error fetching pending report : ", error);
      return dbError(res);
    }

    const result = data[0] || { totalDays: 0, taskCount: 0 };

    return res
      .status(200)
      .json(
        success(
          { totalDays: result.totalDays, taskCount: result.taskCount },
          "Total days of work pending",
        ),
      );
  } catch (error) {
    console.log("Error at controller : pending ", error);
    return serverError(res);
  }
};

const closedTasks = async (req, res) => {
  try {
    const { groupBy = "team" } = req.query;

    const allowed = ["team", "owner", "project"];
    if (!allowed.includes(groupBy)) {
      return res
        .status(400)
        .json(failure("groupBy must be team, owner or project"));
    }

    let pipeline;
    if (groupBy === "owner") {
      pipeline = [
        { $match: { status: COMPLETED } },
        { $unwind: "$owners" },
        { $group: { _id: "$owners", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "info",
          },
        },
        { $unwind: "$info" },
        { $project: { _id: 1, name: "$info.name", count: 1 } },
        { $sort: { count: -1 } },
      ];
    } else {
      const from = groupBy === "team" ? "teams" : "projects";
      pipeline = [
        { $match: { status: COMPLETED } },
        { $group: { _id: `$${groupBy}`, count: { $sum: 1 } } },
        {
          $lookup: {
            from,
            localField: "_id",
            foreignField: "_id",
            as: "info",
          },
        },
        { $unwind: "$info" },
        { $project: { _id: 1, name: "$info.name", count: 1 } },
        { $sort: { count: -1 } },
      ];
    }

    const { data, error } = await dbTask(() => Task.aggregate(pipeline));
    if (error) {
      console.log("Error fetching closed-tasks report : ", error);
      return dbError(res);
    }

    return res
      .status(200)
      .json(success({ groupBy, results: data }, "Closed tasks grouped"));
  } catch (error) {
    console.log("Error at controller : closedTasks ", error);
    return serverError(res);
  }
};

module.exports = {
  lastWeek,
  pending,
  closedTasks,
};
