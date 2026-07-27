const router = require("express").Router();

const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
} = require("../controllers/teams.controller");
const { ROUTE_END } = require("../constants/routeEndpoints");
const { authenticate } = require("../middlewares/authenticate");

router.use(authenticate);

router.post(ROUTE_END.teams.add, createTeam);
router.get(ROUTE_END.teams.getAll, getTeams);
router.get(ROUTE_END.teams.getOne, getTeam);
router.post(ROUTE_END.teams.update, updateTeam);
router.delete(ROUTE_END.teams.delete, deleteTeam);

module.exports = {
  router,
};
