"use server";

import { fail, ok, Result } from "@/lib/utils/result";
import { isAdminAuthConfigured, setAdminSession, verifyAdminSecret } from "@/lib/admin-auth";
import type { ErrorType } from "@/lib/types";

export async function loginAdmin(
  secret: string,
): Promise<Result<string, ErrorType, string>> {
  if (!isAdminAuthConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      return ok("Admin access is open in development");
    }
    return fail("server", "ADMIN_SECRET is not configured");
  }

  if (!verifyAdminSecret(secret)) {
    return fail("unauthorized", "Invalid admin secret");
  }

  await setAdminSession();
  return ok("Authenticated");
}
