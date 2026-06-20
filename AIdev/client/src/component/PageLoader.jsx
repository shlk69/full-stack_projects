import React from "react";

const PageLoader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-5">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>

          <div className="absolute inset-0 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>

        <h2 className="text-lg font-medium text-slate-300">Loading...</h2>
      </div>
    </div>
  );
};

export default PageLoader;
