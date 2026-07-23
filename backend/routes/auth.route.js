const router = require("express").Router();

const { signup } = require("../controllers/auth.controller");
const { ROUTE_END } = require("../constants/routeEndpoints");

router.post(ROUTE_END.auth.signup, signup);
// router.post(ROUTE_END.auth.login,login);
// router.post(ROUTE_END.auth.me,me);
// router.post(ROUTE_END.auth.logout,logout);

module.exports = {
  router,
};
