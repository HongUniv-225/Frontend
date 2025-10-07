import { createBrowserRouter } from "react-router-dom";
import Main from "./pages/main/Main";
import TeamDetail from "./pages/team/TeamDetail";
import User from "./pages/user/User";
import UserSearch from "./pages/user/UserSearch";

export const routes = createBrowserRouter([
  {
    path: "/",
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
