import { NavLink, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard.jsx";
import Questionnaire from "./components/Questionnaire.jsx";
import RoutineView from "./components/RoutineView.jsx";

function NavItem({ to, children }) {
  return (
    <NavLink to={to} end className={({ isActive }) => (isActive ? "active" : "")}>
      {children}
    </NavLink>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">dermis</span>
          <span className="brand-tag">skin intelligence</span>
        </div>
        <nav className="app-nav">
          <NavItem to="/">Dashboard</NavItem>
          <NavItem to="/assessment">Assessment</NavItem>
          <NavItem to="/routine">Routine</NavItem>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assessment" element={<Questionnaire />} />
          <Route path="/routine" element={<RoutineView />} />
        </Routes>
      </main>

      <footer className="app-footer">
        Dermis is a skincare guidance tool, not a medical device. Consult a
        dermatologist for diagnosis or treatment of skin conditions.
      </footer>
    </div>
  );
}
