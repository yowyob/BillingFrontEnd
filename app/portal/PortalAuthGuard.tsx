"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPortalSession } from "@/src/api/portalSession";

const PortalAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(false);
    const session = getPortalSession();
    if (!session?.accessToken) {
      router.replace("/portal/login");
      return;
    }
    if (session.mustChangePassword) {
      router.replace("/portal/change-password");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-secondary-background">
        <div className="w-8 h-8 border-4 border-secondary-light border-t-secondary-mid rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default PortalAuthGuard;
