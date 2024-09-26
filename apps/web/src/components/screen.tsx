import React from "react";

export const DashScreen = ({ children }: { children: React.ReactNode }) => {
  return <div className="h-full w-full items-center justify-center">{children}</div>;
};
