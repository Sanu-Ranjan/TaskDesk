import { useState } from "react";

import Navigation from "./Navigation";
import TopBar from "./TopBar";

// Shared shell for authenticated pages: sidebar + top bar + main
// content area. On small screens the sidebar collapses into an
// off-canvas drawer toggled from the top bar.
function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex">
      <Navigation open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main
          className="flex-grow-1 p-3 p-md-4 bg-light"
          style={{ minWidth: 0 }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
