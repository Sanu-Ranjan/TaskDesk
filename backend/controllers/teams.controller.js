const Team = require("../models/Team");
const { dbError, failure, serverError, success } = require("../utils/res");
const { dbTask } = require("../utils/wrapper");

const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json(failure("name is required"));
    }

    const { data: existing, error: findErr } = await dbTask(() =>
      Team.findOne({ name }),
    );
    if (findErr) {
      console.log("Error finding existing team : ", findErr);
      return dbError(res);
    }
    if (existing) {
      return res.status(409).json(failure("Team name already exists"));
    }

    const team = new Team({ name, description });

    const { data, error } = await dbTask(() => team.save());
    if (error) {
      console.log("Error creating team : ", error);
      return dbError(res);
    }

    return res.status(201).json(success(data, "Team created"));
  } catch (error) {
    console.log("Error at controller : createTeam ", error);
    return serverError(res);
  }
};

const getTeams = async (req, res) => {
  try {
    const { data, error } = await dbTask(() => Team.find().sort({ name: 1 }));
    if (error) {
      console.log("Error fetching teams : ", error);
      return dbError(res);
    }

    return res.status(200).json(success(data, "Teams fetched"));
  } catch (error) {
    console.log("Error at controller : getTeams ", error);
    return serverError(res);
  }
};

const getTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await dbTask(() => Team.findById(id));
    if (error) {
      console.log("Error fetching team : ", error);
      return dbError(res);
    }
    if (!data) {
      return res.status(404).json(failure("Team not found"));
    }

    return res.status(200).json(success(data, "Team fetched"));
  } catch (error) {
    console.log("Error at controller : getTeam ", error);
    return serverError(res);
  }
};

const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const { data: team, error: findErr } = await dbTask(() =>
      Team.findById(id),
    );
    if (findErr) {
      console.log("Error finding team : ", findErr);
      return dbError(res);
    }
    if (!team) {
      return res.status(404).json(failure("Team not found"));
    }

    if (name !== undefined && name !== team.name) {
      const { data: dup, error: dupErr } = await dbTask(() =>
        Team.findOne({ name }),
      );
      if (dupErr) {
        console.log("Error checking duplicate team : ", dupErr);
        return dbError(res);
      }
      if (dup) {
        return res.status(409).json(failure("Team name already exists"));
      }
      team.name = name;
    }
    if (description !== undefined) team.description = description;

    const { data, error } = await dbTask(() => team.save());
    if (error) {
      console.log("Error updating team : ", error);
      return dbError(res);
    }

    return res.status(200).json(success(data, "Team updated"));
  } catch (error) {
    console.log("Error at controller : updateTeam ", error);
    return serverError(res);
  }
};

const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await dbTask(() => Team.findByIdAndDelete(id));
    if (error) {
      console.log("Error deleting team : ", error);
      return dbError(res);
    }
    if (!data) {
      return res.status(404).json(failure("Team not found"));
    }

    return res.status(200).json(success(null, "Team deleted"));
  } catch (error) {
    console.log("Error at controller : deleteTeam ", error);
    return serverError(res);
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
};
