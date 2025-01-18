import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Menghapus data login dari localStorage
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("account");

    // Mengarahkan ke halaman Login setelah logout
    navigate("/Search"); // Ubah ke halaman Login
  }, [navigate]);

  return <div>Logging out...</div>;
}

export default Logout;
