import { createStudent } from "@/server/students";

export default async function page() {


  return (
    <div className="p-4">
      {/* student register */}
      <form action={createStudent} className="space-y-4">
        <div>
          <label htmlFor="name">Name</label>
          <input className="border rounded p-1" type="text" name="name" id="name" />
        </div>
        {/* <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" className="p-1 border rounded" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" className="p-1 border rounded" />
        </div> */}
        <button className="border rounded p-1 bg-blue-500 hover:bg-blue-700" type="submit">Register</button>
      </form>
    </div>
  )
}
