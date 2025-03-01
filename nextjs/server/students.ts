'use server';

import { Student } from "@/types/students";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export const getStudents = async (): Promise<Student[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/students`);
  const students = await res.json();
  return students;
}

// delete Student
export const deleteStudent = async (formData: FormData): Promise<void> => {
  const id = formData.get("id");

  try {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/students/${id}`, {
      method: "DELETE",
    });
    // reload the page
    revalidatePath("/students");
  } catch (error) {
    console.error(error);
  }
}


export const createUser = async (formData: FormData): Promise<void> => {
  const cookieStore = await cookies();

  const studentData = {
    name: formData.get("name") || "",
    email: formData.get("email") || "",
    password: formData.get("password") || "",
    password_confirmation: formData.get("password") || "", // 追加
  }

  const csrfResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/sanctum/csrf-cookie`,
    {
      method: "GET",
      // credentials: "include",
    }
  );
  console.log('csrf-response', csrfResponse);

  // `set-cookie` ヘッダーを取得
  const setCookieHeader = csrfResponse.headers.get("set-cookie");

  if (!setCookieHeader) {
    console.error("CSRF Cookie が取得できませんでした");
    return;
  }

  // `XSRF-TOKEN` をパース
  const xsrfTokenMatch = setCookieHeader
    .split(",") // Cookie のリストを分割
    .map(cookie => cookie.trim()) // 余分なスペースを削除
    .find(cookie => cookie.startsWith("XSRF-TOKEN=")); // XSRF-TOKEN を探す

  if (!xsrfTokenMatch) {
    console.error("XSRF-TOKEN の取得に失敗しました");
    return;
  }

  // XSRF-TOKEN の値を取得
  const xsrfToken = xsrfTokenMatch.split(";")[0].split("=")[1];

  console.log("取得した XSRF-TOKEN:", xsrfToken);

  // Next.js の cookies() を使用して `XSRF-TOKEN` をサーバー側に保存
  // cookieStore.set("XSRF-TOKEN", xsrfToken);

  // `laravel_session` をパース
  const laravelSessionMatch = setCookieHeader
    .split(",")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("laravel_session="));

  if (laravelSessionMatch) {
    const laravelSession = laravelSessionMatch.split(";")[0].split("=")[1];
    console.log("取得した laravel_session:", laravelSession);

    // Next.js の cookies() を使用して `laravel_session` をサーバー側に保存
    cookieStore.set("laravel_session", laravelSession);
  } else {
    console.error("laravel_session の取得に失敗しました");
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
      Cookie: `laravel_session=${cookieStore.get("laravel_session")?.value}`,  // ; XSRF-TOKEN=${cookieStore.get("XSRF-TOKEN")?.value}
      accept: "application/json",
    },
    // credentials: "include",
    body: JSON.stringify(studentData),
  });

  const responseText = await res.text();

  console.log("登録リクエスト結果:", res.status, res.statusText);
  console.log("レスポンス:", responseText);

  // // logout
  // export const logout = async (): Promise<void> => {
  //   try {
  //     await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/logout`, {
  //       method: "POST",
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
};