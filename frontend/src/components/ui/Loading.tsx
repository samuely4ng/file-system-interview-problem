import React from "react";

const Loading = ({ size = 4, className = "" }) => (
  <span className={`loader h-${size} w-${size} ${className}`} />
);

export default Loading;
