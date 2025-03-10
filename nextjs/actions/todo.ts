'use server';

import { checkAuth } from "@/auth/auth";
import { Todo } from "@/types/todo";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export const createTodo = async (formData: FormData) => {
  await checkAuth();

  const title = formData.get("title")?.toString().trim();

  if (!title) {
    throw new Error("タイトルを入力してください。");
  }

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error("BACKEND_URL が設定されていません");
  }

  const cookieStore = await cookies();
  const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;
  const laravelSession = cookieStore.get("laravel_session")?.value;

  if (!xsrfToken || !laravelSession) {
    throw new Error("Unauthorized");
  }

  const res = await fetch(`${backendUrl}/create`, {
    method: 'POST',
    body: JSON.stringify({ title }),
    headers: {
      'Content-Type': 'application/json',
      "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
      Cookie: `laravel_session=${laravelSession}`,
    },
  });

  if (!res.ok) {
    const errorMessage = await res.text();
    throw new Error(`Todoの作成に失敗しました: ${errorMessage}`);
  }

  redirect("/dashboard");
}


export const fetchTodos = cache(async (): Promise<Todo[]> => {
  await checkAuth();

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error("BACKEND_URL が設定されていません");
  }

  const cookieStore = await cookies();
  const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;
  const laravelSession = cookieStore.get("laravel_session")?.value;

  if (!xsrfToken || !laravelSession) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(`${backendUrl}/todos`, {
    headers: {
      "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
      Cookie: `laravel_session=${laravelSession}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch todos: ${response.status}`);
  }

  const todos: Todo[] = await response.json();

  return todos;
});

export const deleteTodo = async (formData: FormData): Promise<void> => {
  await checkAuth();

  const id = formData.get("id")?.toString();
  if (!id) {
    throw new Error("id が指定されていません");
  }

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    throw new Error("BACKEND_URL が設定されていません");
  }

  const cookieStore = await cookies();
  const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;
  const laravelSession = cookieStore.get("laravel_session")?.value;

  if (!xsrfToken || !laravelSession) {
    throw new Error("Unauthorized");
  }

  const res = await fetch(`${backendUrl}/delete/${id}`, {
    method: 'DELETE',
    headers: {
      "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
      Cookie: `laravel_session=${laravelSession}`,
      Accept: "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || '削除に失敗しました');
  }
  
  console.log(data);

  revalidatePath("/dashboard");
}