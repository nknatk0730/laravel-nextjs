'use server';

import { checkAuth } from "@/auth/auth";
import { Todo } from "@/types/todo";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export const createTodo = async (formData: FormData) => {
  await checkAuth();

  const userData = {
    title: formData.get("title")?.toString() || "",
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL が設定されていません");
  }

  const cookieStore = await cookies();
  const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;
  const laravelSession = cookieStore.get("laravel_session")?.value;

  if (!xsrfToken || !laravelSession) {
    throw new Error("Unauthorized");
  }

  await fetch(`${backendUrl}/create`, {
    method: 'POST',
    body: JSON.stringify(userData),
    headers: {
      'Content-Type': 'application/json',
      "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
      Cookie: `laravel_session=${laravelSession}`,
    },
  });
  redirect("/dashboard");
}


export const fetchTodos = cache(async (): Promise<Todo[]> => {
  await checkAuth();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL が設定されていません");
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

  const todos = await response.json();

  console.log(todos);

  return todos;
});