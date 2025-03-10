import { deleteTodo, fetchTodos } from "@/actions/todo";
import { checkAuth, logout } from "@/auth/auth";
import { Button, buttonVariants } from "@/components/ui/button";
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
              <div key={todo.id}>
                <li>{todo.title}</li>
                <form action={deleteTodo}>
                  <input type="hidden" name="id" value={todo.id} />
                  <Button className="p-1 rounded border" type="submit">Delete</Button>
                </form>
              </div>
            ))}
          </ul>
        </div>
      )}

      <form action={logout}>
        <Button className="p-1 rounded border" type="submit">Logout</Button>
      </form>
    </div>
  );
}