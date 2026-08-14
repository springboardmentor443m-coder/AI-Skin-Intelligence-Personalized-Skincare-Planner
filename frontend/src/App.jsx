import React, { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import { logoutUser } from "./services/api";

export default function App() {
  const [user, setUser] = useState(null);

  // Restore session after page refresh
  // sessionStorage survives refresh but is cleared when the browser tab/session ends.
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const username = sessionStorage.getItem("username");

    if (token && username) {
      setUser(username);
    }
  }, []);

  const handleLoginSuccess = (username) => {
    sessionStorage.setItem("username", username);
    setUser(username);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      {!user ? (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard
          username={user}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}