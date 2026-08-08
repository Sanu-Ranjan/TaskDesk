import { useEffect, useState } from "react";

import Modal from "./Modal";
import { apiGet, apiPost } from "../utils/api";
import { API_ENDPOINTS } from "../constants/api";
import { TASK_STATUSES, TASK_PRIORITIES } from "../constants/task";

// Create or edit a task. When `task` is passed it's edit mode.
// `lockedProjectId` pins the project (used from the project page).
function TaskFormModal({ task, lockedProjectId, onClose, onSaved }) {
  const isEdit = Boolean(task);

  const [name, setName] = useState(task?.name || "");
  const [project, setProject] = useState(
    task?.project?._id || lockedProjectId || "",
  );
  const [team, setTeam] = useState(task?.team?._id || "");
  const [owners, setOwners] = useState((task?.owners || []).map((o) => o._id));
  const [tags, setTags] = useState((task?.tags || []).join(", "));
  const [timeToComplete, setTimeToComplete] = useState(
    task?.timeToComplete ?? "",
  );
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? task.dueDate.slice(0, 10) : "",
  );
  const [priority, setPriority] = useState(task?.priority || "Medium");
  const [status, setStatus] = useState(task?.status || "To Do");

  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [projRes, teamRes, userRes] = await Promise.all([
          apiGet(API_ENDPOINTS.PROJECTS.BASE, { limit: 100 }),
          apiGet(API_ENDPOINTS.TEAM.GET_TEAMS),
          apiGet(API_ENDPOINTS.USERS.GET_ALL),
        ]);
        setProjects(projRes.data.projects || projRes.data);
        setTeams(teamRes.data);
        setUsers(userRes.data);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  function toggleOwner(id) {
    setOwners((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id],
    );
  }

  async function handleSubmit() {
    setError("");

    if (
      !name.trim() ||
      !project ||
      !team ||
      owners.length === 0 ||
      !dueDate ||
      timeToComplete === ""
    ) {
      setError("Please fill all required fields.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        project,
        team,
        owners,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        timeToComplete: Number(timeToComplete),
        dueDate,
        priority,
        status,
      };

      if (isEdit) {
        await apiPost(API_ENDPOINTS.TASKS.BY_ID(task._id), payload);
      } else {
        await apiPost(API_ENDPOINTS.TASKS.BASE, payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={isEdit ? "Edit Task" : "Create New Task"}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : isEdit ? "Save" : "Create"}
          </button>
        </>
      }
    >
      <div className="mb-3">
        <label className="form-label">Task Name</label>
        <input
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter task name"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Project</label>
        <select
          className="form-select"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          disabled={Boolean(lockedProjectId)}
        >
          <option value="">Select project</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Team</label>
        <select
          className="form-select"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
        >
          <option value="">Select team</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Owners</label>
        <div
          className="border rounded p-2"
          style={{ maxHeight: 120, overflowY: "auto" }}
        >
          {users.map((u) => (
            <div className="form-check" key={u._id}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`owner-${u._id}`}
                checked={owners.includes(u._id)}
                onChange={() => toggleOwner(u._id)}
              />
              <label className="form-check-label" htmlFor={`owner-${u._id}`}>
                {u.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Tags</label>
        <input
          className="form-control"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Comma separated, e.g. UI, Urgent"
        />
      </div>

      <div className="row">
        <div className="col-6 mb-3">
          <label className="form-label">Time to Complete (days)</label>
          <input
            type="number"
            min="0"
            className="form-control"
            value={timeToComplete}
            onChange={(e) => setTimeToComplete(e.target.value)}
          />
        </div>
        <div className="col-6 mb-3">
          <label className="form-label">Due Date</label>
          <input
            type="date"
            className="form-control"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-6 mb-3">
          <label className="form-label">Priority</label>
          <select
            className="form-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 mb-3">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-danger mb-0">{error}</p>}
    </Modal>
  );
}

export default TaskFormModal;
