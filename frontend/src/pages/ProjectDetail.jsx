import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";

import AppLayout from "../components/AppLayout";
import TaskFormModal from "../components/TaskFormModal";
import TaskTable from "../components/TaskTable";
import { apiGet } from "../utils/api";
import { API_ENDPOINTS } from "../constants/api";
import { ROUTES } from "../constants/route";
import { TASK_STATUSES, SORT_OPTIONS } from "../constants/task";

const PAGE_LIMIT = 10;

function ProjectDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  // URL-driven filters + sort
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

  // load project name once
  useEffect(() => {
    (async () => {
      try {
        const body = await apiGet(API_ENDPOINTS.PROJECTS.GET_BY_ID(id));
        setProject(body.data);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [id]);

  // load filter option sources once
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
        // filters just stay empty if this fails
      }
    })();
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { project: id, page, limit: PAGE_LIMIT, sort };
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
  }, [id, page, sort, owner, tag, status]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <AppLayout>
      <Link to={ROUTES.DASHBOARD} className="text-decoration-none small">
        &larr; Back to Dashboard
      </Link>

      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between gap-2 mt-3 mb-1">
        <h4 className="fw-bold mb-0">
          Project: {project ? project.name : "..."}
        </h4>
        <button
          className="btn btn-primary btn-sm flex-shrink-0"
          onClick={() => setShowCreate(true)}
        >
          + New Task
        </button>
      </div>
      {project?.description && (
        <p className="text-muted">{project.description}</p>
      )}

      {/* filters + sort */}
      <div className="row g-2 my-3">
        <div className="col-6 col-md-auto">
          <select
            className="form-select form-select-sm"
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
        </div>

        <div className="col-6 col-md-auto">
          <select
            className="form-select form-select-sm"
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
        </div>

        <div className="col-6 col-md-auto">
          <select
            className="form-select form-select-sm"
            value={status}
            onChange={(e) =>
              patchParams({ status: e.target.value, page: null })
            }
          >
            <option value="">All statuses</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="col-6 col-md-auto ms-md-auto">
          <select
            className="form-select form-select-sm"
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
      </div>

      {error && <p className="text-danger">Error: {error}</p>}

      {tasks.length === 0 && loading ? (
        <p className="text-muted">Loading tasks...</p>
      ) : (
        <div
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {tasks.length === 0 ? (
            <p className="text-muted">No tasks match these filters.</p>
          ) : (
            <TaskTable tasks={tasks} />
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
                  className={`page-item ${
                    page >= totalPages ? "disabled" : ""
                  }`}
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

      {showCreate && (
        <TaskFormModal
          lockedProjectId={id}
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            loadTasks();
          }}
        />
      )}
    </AppLayout>
  );
}

export default ProjectDetail;
