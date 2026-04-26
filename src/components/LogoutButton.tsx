"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/login" })}
      style={{
        marginTop: "10px",
        padding: "8px 16px",
        background: "transparent",
        color: "var(--danger)",
        border: "1px solid var(--danger)",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s"
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = "var(--danger)";
        e.currentTarget.style.color = "white";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--danger)";
      }}
    >
      Déconnexion
    </button>
  );
}
