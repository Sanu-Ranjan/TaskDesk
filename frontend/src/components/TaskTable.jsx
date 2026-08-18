import { useNavigate } from "react-router-dom";

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

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusClass(s) {
  return STATUS_BADGE[s] || "bg-secondary-subtle text-secondary-emphasis";
}
function priorityClass(p) {
  return PRIORITY_BADGE[p] || "bg-light text-dark";
}

// Renders a list of tasks as a table on md+ screens and as stacked
// cards on small screens. `showProject` adds a Project column/row.
function TaskTable({ tasks, showProject = false }) {
  const navigate = useNavigate();

  function open(id) {
    navigate(ROUTES.TASK_DETAIL.replace(":id", id));
  }

  return (
    <>
      {/* table on md and up */}
      <div className="table-responsive bg-white rounded shadow-sm d-none d-md-block">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Task</th>
              {showProject && <th>Project</th>}
              <th>Owner</th>
              <th>Priority</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t._id} role="button" onClick={() => open(t._id)}>
                <td className="fw-medium">{t.name}</td>
                {showProject && <td>{t.project?.name || "-"}</td>}
                <td>{(t.owners || []).map((o) => o.name).join(", ") || "-"}</td>
                <td>
                  <span className={`badge ${priorityClass(t.priority)}`}>
                    {t.priority}
                  </span>
                </td>
                <td>{fmtDate(t.dueDate)}</td>
                <td>
                  <span className={`badge ${statusClass(t.status)}`}>
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* stacked cards below md */}
      <div className="d-md-none d-flex flex-column gap-2">
        {tasks.map((t) => (
          <div
            key={t._id}
            className="card shadow-sm"
            role="button"
            onClick={() => open(t._id)}
          >
            <div className="card-body py-2">
              <div className="d-flex justify-content-between align-items-start mb-1">
                <span className="fw-medium">{t.name}</span>
                <span className={`badge ${statusClass(t.status)}`}>
                  {t.status}
                </span>
              </div>
              <div className="small text-muted">
                {showProject && t.project?.name && (
                  <div>Project: {t.project.name}</div>
                )}
                <div>
                  Owner: {(t.owners || []).map((o) => o.name).join(", ") || "-"}
                </div>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span className={`badge ${priorityClass(t.priority)}`}>
                    {t.priority}
                  </span>
                  <span>Due {fmtDate(t.dueDate)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default TaskTable;
