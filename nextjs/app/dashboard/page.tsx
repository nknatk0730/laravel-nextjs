import { checkAuthStatus, getCsrf, logout } from "@/auth/auth";
import { cookies } from "next/headers"
import { redirect } from "next/navigation";

export default async function page() {
  const cookieStore = await cookies();
  const session = cookieStore.get("laravel_session");

  if (!session) {
    redirect("/login");
  }



  return (
    <div className="p-4 space-y-4">
      <h1>dashboard</h1>
      <form action={logout}>
        <button className="p-1 rounded border" type="submit">Logout</button>
      </form>

      <form action={checkAuthStatus}>
        <button className="p-1 rounded border" type="submit">Check Auth Status</button>
      </form>
      
      <form action={getCsrf}>
        <button className="p-1 rounded border" type="submit">get Status</button>
      </form>
    </div>

  )
}
