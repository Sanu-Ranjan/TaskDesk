import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

import Navigation from "../components/Navigation";
import { apiGet } from "../utils/api";
import { API_ENDPOINTS } from "../constants/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const PALETTE = [
  "#4f46e5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

// count completed tasks per team name from the last-week task list
function countByTeam(tasks) {
  const map = {};
  tasks.forEach((t) => {
    const name = t.team?.name || "Unknown";
    map[name] = (map[name] || 0) + 1;
  });
  return map;
}

const BAR_OPTIONS = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
};

function ChartCard({ title, empty, children }) {
  return (
    <div className="col-12 col-lg-6">
      <div className="card shadow-sm h-100">
        <div className="card-body">
          <h6 className="fw-bold mb-3">{title}</h6>
          {empty ? (
            <p className="text-muted small mb-0">No data to display.</p>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

function Reports() {
  const [lastWeek, setLastWeek] = useState(null);
  const [pending, setPending] = useState(null);
  const [closedByTeam, setClosedByTeam] = useState([]);
  const [closedByOwner, setClosedByOwner] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [lw, pend, team, owner] = await Promise.all([
          apiGet(API_ENDPOINTS.REPORTS.LAST_WEEK),
          apiGet(API_ENDPOINTS.REPORTS.PENDING),
          apiGet(API_ENDPOINTS.REPORTS.CLOSED_TASKS, { groupBy: "team" }),
          apiGet(API_ENDPOINTS.REPORTS.CLOSED_TASKS, { groupBy: "owner" }),
        ]);
        setLastWeek(lw.data);
        setPending(pend.data);
        setClosedByTeam(team.data.results);
        setClosedByOwner(owner.data.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const lastWeekByTeam = lastWeek ? countByTeam(lastWeek.tasks) : {};
  const pendingByProject = pending?.byProject || [];

  const lastWeekBar = {
    labels: Object.keys(lastWeekByTeam),
    datasets: [
      {
        label: "Completed tasks",
        data: Object.values(lastWeekByTeam),
        backgroundColor: PALETTE[0],
      },
    ],
  };

  const pendingBar = {
    labels: pendingByProject.map((p) => p.name),
    datasets: [
      {
        label: "Pending days",
        data: pendingByProject.map((p) => p.totalDays),
        backgroundColor: PALETTE[3],
      },
    ],
  };

  const teamPie = {
    labels: closedByTeam.map((c) => c.name),
    datasets: [
      { data: closedByTeam.map((c) => c.count), backgroundColor: PALETTE },
    ],
  };

  const ownerPie = {
    labels: closedByOwner.map((c) => c.name),
    datasets: [
      { data: closedByOwner.map((c) => c.count), backgroundColor: PALETTE },
    ],
  };

  return (
    <div className="d-flex">
      <Navigation />

      <main
        className="flex-grow-1 p-4 bg-light"
        style={{ minHeight: "100vh", minWidth: 0 }}
      >
        <h4 className="fw-bold mb-4">Reports</h4>

        {error && <p className="text-danger">Error: {error}</p>}
        {loading && <p className="text-muted">Loading reports...</p>}

        {!loading && (
          <>
            {/* summary stats */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-3">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <div className="text-muted small">Completed last week</div>
                    <div className="fs-3 fw-bold">
                      {lastWeek ? lastWeek.count : 0}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <div className="text-muted small">Pending work (days)</div>
                    <div className="fs-3 fw-bold">
                      {pending ? pending.totalDays : 0}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <div className="text-muted small">Pending tasks</div>
                    <div className="fs-3 fw-bold">
                      {pending ? pending.taskCount : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* four chart panels, matching the reports screen */}
            <div className="row g-4">
              <ChartCard
                title="Total Work Done Last Week"
                empty={Object.keys(lastWeekByTeam).length === 0}
              >
                <Bar data={lastWeekBar} options={BAR_OPTIONS} />
              </ChartCard>

              <ChartCard
                title="Total Days of Work Pending"
                empty={pendingByProject.length === 0}
              >
                <Bar data={pendingBar} options={BAR_OPTIONS} />
              </ChartCard>

              <ChartCard
                title="Tasks Closed by Team"
                empty={closedByTeam.length === 0}
              >
                <div style={{ maxWidth: 340, margin: "0 auto" }}>
                  <Pie data={teamPie} options={{ responsive: true }} />
                </div>
              </ChartCard>

              <ChartCard
                title="Tasks Closed by Owner"
                empty={closedByOwner.length === 0}
              >
                <div style={{ maxWidth: 340, margin: "0 auto" }}>
                  <Pie data={ownerPie} options={{ responsive: true }} />
                </div>
              </ChartCard>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Reports;
