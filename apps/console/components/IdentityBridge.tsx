"use client";

import { useEffect } from "react";
import { fw } from "@fireweaveai/web-sdk/start";

type Props = {
  userId: string;
  role: string;
  clinicId: string;
};

// Session restore: binds the signed-in user to FireWeave on every authenticated
// page load, unconditionally (never inside a control-point branch).
export function IdentityBridge({ userId, role, clinicId }: Props) {
  useEffect(() => {
    if (!userId) return;
    void fw.identify(userId, { role, clinicId });
  }, [userId, role, clinicId]);
  return null;
}
