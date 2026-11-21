import { redirect } from "next/navigation";
import { isAdminAuthenticated, isAdminAuthConfigured } from "@/lib/admin-auth";
import AdminLoginForm from "./login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const authed = await isAdminAuthenticated();
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/admin") ? params.next : "/admin";

  if (authed) redirect(nextPath);

  return (
    <section className="pt-28 md:pt-[10rem] pb-16 md:py-36 px-4 sm:px-6 md:px-[10vw] max-w-xl mx-auto">
      <h2 className="mb-2">Admin login</h2>
      <p className="opacity-60 mb-8">
        {isAdminAuthConfigured()
          ? "Enter the admin secret to manage projects."
          : "Set ADMIN_SECRET in your environment to protect this area. In development, admin access is currently open."}
      </p>
      <AdminLoginForm nextPath={nextPath} />
    </section>
  );
}
