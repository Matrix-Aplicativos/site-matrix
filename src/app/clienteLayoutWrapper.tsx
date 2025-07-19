"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function ClientLayoutWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const key = pathname.split("/")[1] || "root";

  // Este componente aplica a 'key' para forçar a remontagem durante a navegação.
  return <div key={key}>{children}</div>;
}
