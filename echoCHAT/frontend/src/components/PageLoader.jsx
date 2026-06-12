import React from "react";

const PageLoader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-base-100">
      <span className="loading loading-ring loading-xl text-primary"></span>

      <div className="text-center">
        <h2 className="text-xl font-semibold">Loading...</h2>
      </div>
    </div>
  );
};

export default PageLoader;
