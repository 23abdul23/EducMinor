import React, { useEffect, useRef, useState } from "react";
import { Route, Routes, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";


import Home from "./views/Home";
import AdminLogin from "./views/AdminLogin";
import Issue from "./views/Issue";
import Retrieve from "./views/Retrieve";
import CertificateTemplate from "./views/CertificateTemplate";
import Certificates from "./views/Certificates";
import UserLogin from "./views/UserLogin";
import UserCertificates from "./views/UserCertificates";
import VerifyCertificate from "./views/VerifyCertificate";

const backendBaseUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:4000";


const HomeRedirect = () => {
  const navigate = useNavigate();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (redirected) return;
    const role =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("authRole")
        : null;

    console.log("🔁 Redirecting based on role:", role);

    if (role === "user") navigate("/user", { replace: true });
    else navigate("/admin", { replace: true });

    setRedirected(true);
  }, [navigate, redirected]);

  return null;
};

const ProtectedRoute = ({ allowedRole, redirectTo }) => {
  const navigate = useNavigate();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    const role =
      typeof window !== "undefined"
        ? window.sessionStorage.getItem("authRole")
        : null;

    if (hasNavigated) return;
    console.log(
      `🛡️ Checking access for role "${role}" (allowed: ${allowedRole})`
    );

    if (!role) {
      setHasNavigated(true);
      navigate(redirectTo, { replace: true });
      return;
    }

    if (role !== allowedRole) {
      setHasNavigated(true);
      navigate(role === "admin" ? "/admin" : "/user", { replace: true });
    }
  }, [allowedRole, redirectTo, navigate, hasNavigated]);

  return <Outlet />;
};



const App = () => {
  
  return (
    <>
      
    </>
  )
}

export default App
