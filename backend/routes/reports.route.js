const router = require("express").Router();

const {
  lastWeek,
  pending,
  closedTasks,
} = require("../controllers/reports.controller");
const { ROUTE_END } = require("../constants/routeEndpoints");
const { authenticate } = require("../middlewares/authenticate");

router.use(authenticate);

router.get(ROUTE_END.reports.lastWeek, lastWeek);
router.get(ROUTE_END.reports.pending, pending);
router.get(ROUTE_END.reports.closedTasks, closedTasks);

module.exports = {
  router,
};
