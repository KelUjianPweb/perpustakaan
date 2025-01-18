import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import Logout from "./pages/Logout.jsx";
import Search from "./pages/Home.jsx";
import App from "./App.jsx";

// Cek status login dari localStorage
const checkLoginStatus = () => {
  return localStorage.getItem("isLoggedIn") === "true";
};

// Komponen ProtectedRoute untuk halaman yang memerlukan login
const ProtectedRoute = ({ children }) => {
  return checkLoginStatus() ? children : <Navigate to="/login" />;
};

// Router dengan logika untuk mengarahkan pengguna berdasarkan status login
const router = createBrowserRouter([
  {
    path: "/", // Halaman default
    element: checkLoginStatus() ? <Navigate to="/app" /> : <Search />,
  },
  {
    path: "/app", // Halaman utama yang memerlukan login
    element: (<ProtectedRoute><App /></ProtectedRoute>
    ),
  },
  {
    path: "/signup", // Halaman signup
    element: !checkLoginStatus() ? <Signup /> : <Navigate to="/app" />,
  },
  {
    path: "/login", // Halaman login
    element: !checkLoginStatus() ? <Login /> : <Navigate to="/app" />,
  },
  {
    path: "/logout", // Halaman logout
    element: <Logout />,
  },
  {
    path: "*", // Fallback route jika tidak ada rute yang cocok
    element: <Navigate to="/" />,
  },
]);

// Menggunakan React 18 dengan root API
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);