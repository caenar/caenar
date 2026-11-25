"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginAdmin } from "./action";
import { Input } from "@/components/ui/input";
import Loader from "@/components/ui/loader";

export default function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          const result = await loginAdmin(secret);
          if (result.success) {
            toast.success(result.data || "Signed in");
            router.push(nextPath);
            router.refresh();
          } else {
            toast.error(
              typeof result.error.details === "string"
                ? result.error.details
                : "Invalid secret",
            );
          }
        } finally {
          setLoading(false);
        }
      }}
    >
      <label className="grid gap-2">
        <span>Password</span>
        <Input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Hulaan mo"
          autoComplete="current-password"
          required
        />
      </label>
      <div>
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? <Loader /> : "Sign in"}
        </button>
      </div>
    </form>
  );
}
