const STATUS_STYLES = {
  "To Do": "bg-secondary-subtle text-secondary-emphasis",
  "In Progress": "bg-warning-subtle text-warning-emphasis",
  Completed: "bg-success-subtle text-success-emphasis",
  Blocked: "bg-danger-subtle text-danger-emphasis",
};

function TaskCard({ task }) {
  const statusClass =
    STATUS_STYLES[task.status] || "bg-secondary-subtle text-secondary-emphasis";

  const owners = task.owners || [];

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <span className={`badge rounded-pill mb-2 ${statusClass}`}>
          {task.status}
        </span>
        <h6 className="card-title fw-bold">{task.name}</h6>

        <div className="text-muted small mb-2">
          {task.project?.name && <div>Project: {task.project.name}</div>}
          {task.team?.name && <div>Team: {task.team.name}</div>}
          <div>Time to complete: {task.timeToComplete} day(s)</div>
        </div>

        {owners.length > 0 && (
          <div className="d-flex align-items-center gap-1 flex-wrap">
            {owners.map((o) => (
              <span
                key={o._id}
                className="badge rounded-pill bg-light text-dark border"
                title={o.email}
              >
                {o.name}
              </span>
            ))}
          </div>
        )}

        {task.tags?.length > 0 && (
          <div className="mt-2 d-flex gap-1 flex-wrap">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="badge bg-primary-subtle text-primary-emphasis"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
