const router = require("express").Router();

const { createTag, getTags } = require("../controllers/tags.controller");
const { ROUTE_END } = require("../constants/routeEndpoints");
const { authenticate } = require("../middlewares/authenticate");

router.use(authenticate);

router.post(ROUTE_END.tags.add, createTag);
router.get(ROUTE_END.tags.getAll, getTags);

module.exports = {
  router,
};
