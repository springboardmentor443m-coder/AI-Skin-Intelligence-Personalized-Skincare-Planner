import { useState } from "react";
import AuthPage from "./AuthPage.jsx";
import Dashboard from "./Dashboard.jsx";

const TOKEN_KEY = "skincare_token";

export default function App() {
  const [token, setToken] = useState(() =>
    localStorage.getItem(TOKEN_KEY)
  );

  function handleAuthenticated(newToken) {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  if (!token) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  return <Dashboard token={token} onLogout={handleLogout} />;
}
