import React from "react";
import "../styles/Login.css";
import logo from "../assets/logo.png";
import googleLogo from "../assets/google-logo.png";

function Login() {
  const handleGoogleLogin = () => {
    window.location.href =
      "https://hiring.reachinbox.xyz/api/v1/auth/google-login?redirect_to=https://onebox-zeta.vercel.app/onebox";
  };
  return (
    <div className="login-page flex flex-col items-center justify-center">
      <div className="navbar p-5">
        <img src={logo} alt="Logo" width="170px;" className="m-auto" />
      </div>
      <div className="main flex items-center justify-center">
        <div className="container text-center flex items-center justify-center flex-col">
          <h1 className="text-center">Create a new account</h1>
          <button
            className="sign-up-btn text-center flex items-center justify-center"
            onClick={handleGoogleLogin}
          >
            <img src={googleLogo} width="20px" align="Google Logo" />
            <p>Sign Up with Google</p>
          </button>
          <button className="create-acc-btn">Create an Account</button>
          <p>
            Already have an account? <span>Sign In</span>
          </p>
        </div>
      </div>
      <div className="footer p-4 text-center">
        <p>© 2023 Reachinbox. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Login;
