import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Main from "./pages/main/Main";
import TeamDetail from "./pages/team/TeamDetail";
import User from "./pages/user/User";
import UserSearch from "./pages/user/UserSearch";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/main",
    element: <Main />,
  },
  {
    path: "/team-detail",
    element: <TeamDetail />,
  },
  {
    path: "/user",
    element: <User />,
  },
  {
    path: "/user-search",
    element: <UserSearch />,
  },
]);
