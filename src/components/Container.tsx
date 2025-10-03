// components/Container.tsx
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div
      className={`px-4 py-8 sm:px-8 sm:py-16 max-w-7xl mx-auto ${className}`}
    >
      {children}
    </div>
  );
}
