import React from 'react';
import { Link, useLocation } from "react-router-dom";

const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
const account = localStorage.getItem("account") || "";


function AccountButtons({ account, isLoggedIn }) {
  if (isLoggedIn) {
    return (
      <nav className="bg-white border-gray-200 dark:bg-gray-900">
        <div className="flex justify-between items-center mx-auto max-w-screen-xl p-4">
          <div className="flex items-center space-x-6 rtl:space-x-reverse">
            <span className="text-2xl font-semibold text-indigo-500 dark:text-white hover:underline">
              {account}
            </span>
            <Link to={"/Logout"} className="text-2xl text-gray-500 dark:text-white hover:underline">
              Logout
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return null;
}

function Navbar({ account = "", isLoggedIn = false }) {
  const location = useLocation();  // Menggunakan hook useLocation untuk mendapatkan URL saat ini

  // Fungsi untuk memeriksa apakah link aktif
  const isActive = (path) => location.pathname === path;

  return (
    <header>
      <AccountButtons account={account} isLoggedIn={isLoggedIn} />
      <nav className="bg-gray-50 dark:bg-gray-700">
        <div className="max-w-screen-xl px-6 py-4 mx-auto">
          <div className="flex justify-between items-center">
            <ul className="flex space-x-10 rtl:space-x-reverse text-2xl font-medium mt-0">
              <li>
                <Link
                  to="/Home"
                  className={`text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 ${isActive("/Home") ? "text-indigo-600 dark:text-indigo-400" : ""}`}
                  aria-current={isActive("/Home") ? "page" : undefined}
                >
                  Home
                </Link>
              </li>
              {!isLoggedIn && (
                <>
                  <li>
                    <Link
                      to="/Login"
                      className={`text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 ${isActive("/Login") ? "text-indigo-600 dark:text-indigo-400" : ""}`}
                      aria-current={isActive("/Login") ? "page" : undefined}
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/Signup"
                      className={`text-gray-900 dark:text-white hover:text-blue-700 dark:hover:text-blue-400 ${isActive("/Signup") ? "text-indigo-600 dark:text-indigo-400" : ""}`}
                      aria-current={isActive("/Signup") ? "page" : undefined}
                    >
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
