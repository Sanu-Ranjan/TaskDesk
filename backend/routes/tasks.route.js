const router = require("express").Router();

const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/tasks.controller");
const { ROUTE_END } = require("../constants/routeEndpoints");
const { authenticate } = require("../middlewares/authenticate");

router.use(authenticate);

router.post(ROUTE_END.tasks.add, createTask);
router.get(ROUTE_END.tasks.getAll, getTasks);
router.get(ROUTE_END.tasks.getOne, getTask);
router.post(ROUTE_END.tasks.update, updateTask);
router.delete(ROUTE_END.tasks.delete, deleteTask);

module.exports = {
  router,
};
