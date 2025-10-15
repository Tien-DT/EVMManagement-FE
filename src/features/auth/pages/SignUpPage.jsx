import React from "react";
import SignUpForm from "../components/SignUpForm";

const SignUpPage = () => {
  // Deprecated: signup is admin-only; keeping wrapper if used
  return (
    <div className=" min-h-screen">
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
