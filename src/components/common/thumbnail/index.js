import React from "react";

export default function Thumbnail({ width, height}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
      width={`${width || "1em"}`}
      height={`${height || "1em"}`}
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19 2H1a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zm-1 14H2V4h16v12zm-3.685-5.123l-3.231 1.605l-3.77-6.101L4 14h12l-1.685-3.123zM13.25 9a1.25 1.25 0 1 0 0-2.5a1.25 1.25 0 0 0 0 2.5z"
        fill="currentColor"
      />
    </svg>
  );
}