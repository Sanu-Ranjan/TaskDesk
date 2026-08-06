const router = require("express").Router();

const { getUsers } = require("../controllers/users.controller");
const { ROUTE_END } = require("../constants/routeEndpoints");
const { authenticate } = require("../middlewares/authenticate");

router.use(authenticate);

router.get(ROUTE_END.users.getAll, getUsers);

module.exports = {
  router,
};
