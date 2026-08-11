import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { apiGet } from "../utils/api";
import { API_ENDPOINTS } from "../constants/api";
import { ROUTES } from "../constants/route";
import { TASK_STATUSES, SORT_OPTIONS } from "../constants/task";

const PAGE_LIMIT = 10;

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

// Tasks belonging to one team, with owner/tag/status filters, sort,
// and pagination. Filters live in the URL so the view is shareable.
function TeamTasks({ teamId }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [allTags, setAllTags] = useState([]);

  const owner = searchParams.get("owner") || "";
  const tag = searchParams.get("tag") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page")) || 1);

  const patchParams = useCallback(
    (updates) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([k, v]) => {
        if (v === "" || v === null || v === undefined) next.delete(k);
        else next.set(k, v);
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    (async () => {
      try {
        const [userRes, tagRes] = await Promise.all([
          apiGet(API_ENDPOINTS.USERS.GET_ALL),
          apiGet(API_ENDPOINTS.TAGS.BASE),
        ]);
        setUsers(userRes.data);
        setAllTags(tagRes.data);
      } catch {
        // filters just stay empty
      }
    })();
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { team: teamId, page, limit: PAGE_LIMIT, sort };
      if (owner) params.owner = owner;
      if (tag) params.tags = tag;
      if (status) params.status = status;
      const body = await apiGet(API_ENDPOINTS.TASKS.BASE, params);
      setTasks(body.data.tasks);
      setTotalPages(body.data.pagination.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [teamId, page, sort, owner, tag, status]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  function fmtDate(d) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <>
      <h6 className="text-uppercase text-muted small mt-5 mb-3">Tasks</h6>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <select
          className="form-select form-select-sm"
          style={{ width: "auto" }}
          value={owner}
          onChange={(e) => patchParams({ owner: e.target.value, page: null })}
        >
          <option value="">All owners</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        <select
          className="form-select form-select-sm"
          style={{ width: "auto" }}
          value={tag}
          onChange={(e) => patchParams({ tag: e.target.value, page: null })}
        >
          <option value="">All tags</option>
          {allTags.map((t) => (
            <option key={t._id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          className="form-select form-select-sm"
          style={{ width: "auto" }}
          value={status}
          onChange={(e) => patchParams({ status: e.target.value, page: null })}
        >
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="form-select form-select-sm ms-auto"
          style={{ width: "auto" }}
          value={sort}
          onChange={(e) => patchParams({ sort: e.target.value, page: null })}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-danger">Error: {error}</p>}

      {tasks.length === 0 && loading ? (
        <p className="text-muted">Loading tasks...</p>
      ) : (
        <div
          style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.15s" }}
        >
          {tasks.length === 0 ? (
            <p className="text-muted">No tasks match these filters.</p>
          ) : (
            <div className="table-responsive bg-white rounded shadow-sm">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Owner</th>
                    <th>Priority</th>
                    <th>Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr
                      key={t._id}
                      role="button"
                      onClick={() =>
                        navigate(ROUTES.TASK_DETAIL.replace(":id", t._id))
                      }
                    >
                      <td className="fw-medium">{t.name}</td>
                      <td>{t.project?.name || "-"}</td>
                      <td>
                        {(t.owners || []).map((o) => o.name).join(", ") || "-"}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            PRIORITY_BADGE[t.priority] || "bg-light text-dark"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td>{fmtDate(t.dueDate)}</td>
                      <td>
                        <span
                          className={`badge ${
                            STATUS_BADGE[t.status] ||
                            "bg-secondary-subtle text-secondary-emphasis"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => patchParams({ page: page - 1 })}
                  >
                    Prev
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (n) => (
                    <li
                      className={`page-item ${n === page ? "active" : ""}`}
                      key={n}
                    >
                      <button
                        className="page-link"
                        onClick={() => patchParams({ page: n })}
                      >
                        {n}
                      </button>
                    </li>
                  ),
                )}
                <li
                  className={`page-item ${page >= totalPages ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => patchParams({ page: page + 1 })}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      )}
    </>
  );
}

export default TeamTasks;
