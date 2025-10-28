import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Main from "./pages/main/Main";
import TeamDetail from "./pages/team/TeamDetail";
import User from "./pages/user/User";
import GroupSearch from "./pages/group/GroupSearch";
import AuthCallback from "./pages/auth/AuthCallback";
import GroupDetail from "./pages/group/GroupDetail";
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
    path: "/auth/callback/",
    element: <AuthCallback />,
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
    path: "/group-search",
    element: <GroupSearch />,
  },
  {
    path: "/group/:id",
    element: <GroupDetail />,
  },
]);
