import { createTodo } from "@/actions/todo";
import { checkAuth } from "@/auth/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function page() {
  await checkAuth();

  return (
    <div className="p-4 space-y-4">
      <h1>Create TODO</h1>

      <form action={createTodo} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" />
        </div>
        <Button variant='outline' type="submit">Post</Button>
      </form>
    </div>
  )
}
