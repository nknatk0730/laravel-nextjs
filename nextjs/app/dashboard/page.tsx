import { fetchTodos } from "@/actions/todo";
import { checkAuth, logout } from "@/auth/auth";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
export default async function page() {
  const user = await checkAuth();
  const todos = await fetchTodos();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p>Welcome, {user.name}</p>
      <p>Email: {user.email}</p>
      <Link href='/create' className={buttonVariants()}>Create Todo</Link>
      
      <h2>Todo List</h2>
      {/* もしTodoが１つ以上あれば表示 */}
      {todos.length > 0 && (
        <div>
          <ul>
            {todos.map((todo) => (
              <li key={todo.id}>{todo.title}</li>
            ))}
          </ul>
        </div>
      )}

      <form action={logout}>
        <button className="p-1 rounded border" type="submit">Logo</button>
      </form>
    </div>
  );
}