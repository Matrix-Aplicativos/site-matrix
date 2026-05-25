"use client";

import React from "react";

interface ColetaStatusBadgeProps {
  status: string;
  getStatusText: (status: string) => string;
  getStatusClass: (status: string) => string;
  className: string;
}

export default function ColetaStatusBadge({
  status,
  getStatusText,
  getStatusClass,
  className,
}: ColetaStatusBadgeProps) {
  return (
    <span className={`${className} ${getStatusClass(status)}`}>
      {getStatusText(status)}
    </span>
  );
}
