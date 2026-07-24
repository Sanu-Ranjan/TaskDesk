const router = require("express").Router();

const { signup, login, me, logout } = require("../controllers/auth.controller");
const { ROUTE_END } = require("../constants/routeEndpoints");
const { authenticate } = require("../middlewares/authenticate");

router.post(ROUTE_END.auth.signup, signup);
router.post(ROUTE_END.auth.login, login);
router.post(ROUTE_END.auth.me, authenticate, me);
router.post(ROUTE_END.auth.logout, logout);

module.exports = {
  router,
};
