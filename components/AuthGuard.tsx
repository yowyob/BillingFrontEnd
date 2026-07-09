"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStoredSeller } from "@/src/api/session";
import { hasPageAccess } from "@/src/api/uiPermissions";
import { toast } from "sonner";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setChecked(false);
    const seller = getStoredSeller();
    if (!seller?.accessToken) {
      router.replace("/login");
      return;
    }
    if (!hasPageAccess(pathname, seller.uiPermissions)) {
      toast.error("You don't have access to that page.");
      router.replace("/dashboard");
      return;
    }
    setChecked(true);
  }, [router, pathname]);

  if (!checked) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-secondary-background">
        <div className="w-8 h-8 border-4 border-secondary-light border-t-secondary-mid rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
