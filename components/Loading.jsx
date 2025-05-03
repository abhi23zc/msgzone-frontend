import React from "react";

export default function Loading({className}) {

  return (
    <div
      className={`border-4 border-white border-t-transparent rounded-full
        w-7
        h-7
        animate-spin
        mx-auto
      ${className}` }
      role="status"
      aria-label="Loading"
    />
  );
}
