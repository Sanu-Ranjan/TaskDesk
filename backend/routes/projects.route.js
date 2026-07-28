const router = require("express").Router();

const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require("../controllers/projects.controller");
const { ROUTE_END } = require("../constants/routeEndpoints");
const { authenticate } = require("../middlewares/authenticate");

router.use(authenticate);

router.post(ROUTE_END.projects.add, createProject);
router.get(ROUTE_END.projects.getAll, getProjects);
router.get(ROUTE_END.projects.getOne, getProject);
router.post(ROUTE_END.projects.update, updateProject);
router.delete(ROUTE_END.projects.delete, deleteProject);

module.exports = {
  router,
};
