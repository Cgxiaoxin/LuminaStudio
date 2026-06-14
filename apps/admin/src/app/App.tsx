import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminRoutes } from "./AdminRoutes";
import { AuthGuard } from "../components/AuthGuard";
import LoginPage from "../pages/LoginPage";

export function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/*" element={<AuthGuard><AdminRoutes /></AuthGuard>} />
      </Routes>
    </BrowserRouter>
  );
}
