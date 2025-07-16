"use client";

import { useAuthActions } from "@convex-dev/auth/react";

export default function Home() {
  const { signOut } = useAuthActions();
  return (
    <div>
      zmrd
      <button onClick={() => signOut()}>sign out</button>
    </div>
  );
}
