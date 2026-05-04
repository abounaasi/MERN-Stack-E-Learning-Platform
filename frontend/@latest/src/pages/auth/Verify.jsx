import React, { useState } from "react";
import "./auth.css";
import { Link } from "react-router-dom";

const Verify = () => {
  const [otp, setOtp] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log(otp);
  };
  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Verify Account</h2>
        <form onSubmit={submitHandler}>
          <label htmlFor="otp">Otp</label>
          <input
            type="number"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" className="common-btn">
            Verify
          </button>
        </form>
        <p>
          Go to <Link to="/login">Login</Link> page
        </p>
      </div>
    </div>
  );
};

export default Verify;
