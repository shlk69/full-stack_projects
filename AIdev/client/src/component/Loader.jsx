import React from "react";

const Loader = ({ size = 20 }) => {
  return (
    <div
      className="animate-spin rounded-full border-2 border-white border-t-transparent"
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
};

export default Loader;
