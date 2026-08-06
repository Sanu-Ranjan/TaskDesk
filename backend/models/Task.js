const mongoose = require("mongoose");
const {
  TASK_STATUS,
  DEFAULT_TASK_STATUS,
  TASK_PRIORITY,
  DEFAULT_TASK_PRIORITY,
} = require("../constants");

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  owners: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  tags: [{ type: String }],
  timeToComplete: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  priority: {
    type: String,
    enum: TASK_PRIORITY,
    default: DEFAULT_TASK_PRIORITY,
  },
  status: {
    type: String,
    enum: TASK_STATUS,
    default: DEFAULT_TASK_STATUS,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

taskSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Task", taskSchema);
