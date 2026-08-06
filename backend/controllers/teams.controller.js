const Team = require("../models/Team");
const User = require("../models/User");
const { dbError, failure, serverError, success } = require("../utils/res");
const { dbTask } = require("../utils/wrapper");

const MEMBER_POPULATE = { path: "members", select: "name email" };

const createTeam = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    if (!name) {
      return res.status(400).json(failure("name is required"));
    }

    if (members && !Array.isArray(members)) {
      return res.status(400).json(failure("members must be an array"));
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

    const team = new Team({ name, description, members: members || [] });

    const { data, error } = await dbTask(() =>
      team.save().then((t) => t.populate(MEMBER_POPULATE)),
    );
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
    const { data, error } = await dbTask(() =>
      Team.find().populate(MEMBER_POPULATE).sort({ name: 1 }),
    );
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

    const { data, error } = await dbTask(() =>
      Team.findById(id).populate(MEMBER_POPULATE),
    );
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
    const { name, description, members } = req.body;

    if (members && !Array.isArray(members)) {
      return res.status(400).json(failure("members must be an array"));
    }

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
    if (members !== undefined) team.members = members;

    const { data, error } = await dbTask(() =>
      team.save().then((t) => t.populate(MEMBER_POPULATE)),
    );
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

const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json(failure("userId is required"));
    }

    const { data: user, error: userErr } = await dbTask(() =>
      User.findById(userId),
    );
    if (userErr) {
      console.log("Error finding user : ", userErr);
      return dbError(res);
    }
    if (!user) {
      return res.status(404).json(failure("User not found"));
    }

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

    if (team.members.some((m) => m.toString() === userId)) {
      return res.status(409).json(failure("User is already a member"));
    }

    team.members.push(userId);

    const { data, error } = await dbTask(() =>
      team.save().then((t) => t.populate(MEMBER_POPULATE)),
    );
    if (error) {
      console.log("Error adding member : ", error);
      return dbError(res);
    }

    return res.status(200).json(success(data, "Member added"));
  } catch (error) {
    console.log("Error at controller : addMember ", error);
    return serverError(res);
  }
};

const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

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

    const before = team.members.length;
    team.members = team.members.filter((m) => m.toString() !== userId);
    if (team.members.length === before) {
      return res.status(404).json(failure("Member not found in team"));
    }

    const { data, error } = await dbTask(() =>
      team.save().then((t) => t.populate(MEMBER_POPULATE)),
    );
    if (error) {
      console.log("Error removing member : ", error);
      return dbError(res);
    }

    return res.status(200).json(success(data, "Member removed"));
  } catch (error) {
    console.log("Error at controller : removeMember ", error);
    return serverError(res);
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
};
