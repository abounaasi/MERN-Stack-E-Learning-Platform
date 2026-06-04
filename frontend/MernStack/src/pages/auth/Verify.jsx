import React, { useState } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";

const Verify = () => {
  const [otp, setOtp] = useState("");
  const { btnLoading, verifyOtp } = UserData();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    await verifyOtp(Number(otp), navigate);
  };
  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Verify your account</h2>
        <p className="auth-sub">Enter the 6-digit OTP sent to your email</p>
        <form onSubmit={submitHandler}>
          <label htmlFor="otp">Otp</label>
          <input
            type="number"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button disabled={btnLoading} type="submit" className="common-btn">
            {btnLoading ? "Please Wait..." : "Verify"}
          </button>
        </form>
        <p className="auth-link">
          Back to <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Verify;
