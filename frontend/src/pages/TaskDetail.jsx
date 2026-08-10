import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import Navigation from "../components/Navigation";
import TaskFormModal from "../components/TaskFormModal";
import Modal from "../components/Modal";
import { apiGet, apiPost, apiDelete } from "../utils/api";
import { API_ENDPOINTS } from "../constants/api";
import { ROUTES } from "../constants/route";

const STATUS_BADGE = {
  "To Do": "bg-secondary-subtle text-secondary-emphasis",
  "In Progress": "bg-warning-subtle text-warning-emphasis",
  Completed: "bg-success-subtle text-success-emphasis",
  Blocked: "bg-danger-subtle text-danger-emphasis",
};

const PRIORITY_BADGE = {
  Low: "bg-light text-dark border",
  Medium: "bg-info-subtle text-info-emphasis",
  High: "bg-warning-subtle text-warning-emphasis",
  Urgent: "bg-danger-subtle text-danger-emphasis",
};

function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const loadTask = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const body = await apiGet(API_ENDPOINTS.TASKS.BY_ID(id));
      setTask(body.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  async function markComplete() {
    setBusy(true);
    try {
      await apiPost(API_ENDPOINTS.TASKS.BY_ID(id), { status: "Completed" });
      loadTask();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await apiDelete(API_ENDPOINTS.TASKS.BY_ID(id));
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  function fmtDate(d) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="d-flex">
      <Navigation />

      <main
        className="flex-grow-1 p-4 bg-light"
        style={{ minHeight: "100vh", minWidth: 0 }}
      >
        <button
          className="btn btn-link text-decoration-none p-0 small"
          onClick={() => navigate(-1)}
        >
          &larr; Back
        </button>

        {loading && <p className="text-muted mt-3">Loading task...</p>}
        {error && <p className="text-danger mt-3">Error: {error}</p>}

        {!loading && task && (
          <div className="card shadow-sm mt-3" style={{ maxWidth: 640 }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h4 className="fw-bold mb-0">{task.name}</h4>
                <span
                  className={`badge ${
                    STATUS_BADGE[task.status] ||
                    "bg-secondary-subtle text-secondary-emphasis"
                  }`}
                >
                  {task.status}
                </span>
              </div>

              <dl className="row mb-0">
                <dt className="col-sm-3 text-muted">Project</dt>
                <dd className="col-sm-9">
                  {task.project?.name ? (
                    <Link
                      to={ROUTES.PROJECT_DETAIL.replace(
                        ":id",
                        task.project._id,
                      )}
                    >
                      {task.project.name}
                    </Link>
                  ) : (
                    "-"
                  )}
                </dd>

                <dt className="col-sm-3 text-muted">Team</dt>
                <dd className="col-sm-9">{task.team?.name || "-"}</dd>

                <dt className="col-sm-3 text-muted">Owners</dt>
                <dd className="col-sm-9">
                  {(task.owners || []).map((o) => o.name).join(", ") || "-"}
                </dd>

                <dt className="col-sm-3 text-muted">Tags</dt>
                <dd className="col-sm-9">
                  {(task.tags || []).length > 0
                    ? task.tags.map((t) => (
                        <span
                          key={t}
                          className="badge bg-primary-subtle text-primary-emphasis me-1"
                        >
                          {t}
                        </span>
                      ))
                    : "-"}
                </dd>

                <dt className="col-sm-3 text-muted">Priority</dt>
                <dd className="col-sm-9">
                  <span
                    className={`badge ${
                      PRIORITY_BADGE[task.priority] || "bg-light text-dark"
                    }`}
                  >
                    {task.priority}
                  </span>
                </dd>

                <dt className="col-sm-3 text-muted">Due Date</dt>
                <dd className="col-sm-9">{fmtDate(task.dueDate)}</dd>

                <dt className="col-sm-3 text-muted">Time to Complete</dt>
                <dd className="col-sm-9">{task.timeToComplete} day(s)</dd>
              </dl>

              <hr />

              <div className="d-flex gap-2 flex-wrap">
                {task.status !== "Completed" && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={markComplete}
                    disabled={busy}
                  >
                    Mark as Complete
                  </button>
                )}
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowEdit(true)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setShowDelete(true)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {showEdit && task && (
        <TaskFormModal
          task={task}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            loadTask();
          }}
        />
      )}

      {showDelete && (
        <Modal
          title="Delete Task"
          onClose={() => setShowDelete(false)}
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={busy}
              >
                {busy ? "Deleting..." : "Delete"}
              </button>
            </>
          }
        >
          <p className="mb-0">
            Delete <strong>{task?.name}</strong>? This can't be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

export default TaskDetail;
