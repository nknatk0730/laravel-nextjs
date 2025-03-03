import { login } from "@/auth/auth";

export default async function page() {


  return (
    <div className="p-4">
      <form action={login} className="space-y-4">
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" className="p-1 border rounded" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" className="p-1 border rounded" />
        </div>
        <button className="border rounded p-1 bg-blue-500 hover:bg-blue-700" type="submit">Login</button>
      </form>
    </div>
  )
}