import DashboardPage from "../pages/DashboardPage.jsx";

const applicationRoutes = [
  { path: "/", element: <DashboardPage /> },
  { path: "*", element: <h1>Not Found</h1> },
];

export default applicationRoutes;

