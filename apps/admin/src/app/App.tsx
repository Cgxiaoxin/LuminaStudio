import { BrowserRouter } from "react-router-dom";
import { AdminRoutes } from "./AdminRoutes";

export function App() {
  return (
    <BrowserRouter>
      <AdminRoutes />
    </BrowserRouter>
  );
}
