import Navigation from "./Navigation";
import TopBar from "./TopBar";

// Shared shell for authenticated pages: sidebar + top bar + main
// content area. Pages render their content as children.
function AppLayout({ children }) {
  return (
    <div className="d-flex">
      <Navigation />

      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        <TopBar />
        <main className="flex-grow-1 p-4 bg-light" style={{ minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
