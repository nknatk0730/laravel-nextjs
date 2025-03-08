'use server';

import { Student } from "@/types/students";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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

// Todo ユーザ作成時にクッキーをセットする

export const createUser = async (formData: FormData): Promise<void> => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("NEXT_PUBLIC_BACKEND_URL が設定されていません");
    }

    const userData = {
      name: formData.get("name")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      password: formData.get("password")?.toString() || "",
      password_confirmation: formData.get("password")?.toString(),
    };

    // CSRFトークンとセッションを取得
    const { xsrfToken, laravelSession } = await getCsrfTokenAndSession(
      backendUrl
    );
    if (!xsrfToken || !laravelSession) {
      throw new Error(
        "CSRFトークンまたは Laravel セッションの取得に失敗しました"
      );
    }

    // console.log("送信するXSRF-TOKEN:", xsrfToken);
    // console.log("送信するCookie:", laravelSession);

    // ユーザー登録リクエスト
    const res = await fetch(`${backendUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
        Cookie: `laravel_session=${laravelSession}`,
        Accept: "application/json",
      },
      body: JSON.stringify(userData),
    });

    console.log("登録リクエスト結果:", res.status, res.statusText);
    // set-cookieがあるかを確認
    const setCookie = res.headers.get("set-cookie");
    // console.log(setCookie);
    if (setCookie) {
      const cookieStore = await cookies();
      const sessionMatch = setCookie.match(/laravel_session=([^;]+)/);
      const xsrfTokenMatch = setCookie.match(/XSRF-TOKEN=([^;]+)/);
      if (sessionMatch && xsrfTokenMatch) {
        cookieStore.set("XSRF-TOKEN", xsrfTokenMatch[1], { httpOnly: true });
        cookieStore.set("laravel_session", sessionMatch[1], { httpOnly: true });
      }
    }
  } catch (error) {
    console.error("ユーザー登録処理中にエラーが発生:", error);
  }

  redirect("/dashboard");
};

export const getCsrfTokenAndSession = async (backendUrl: string) => {
  try {
    const csrfResponse = await fetch(`${backendUrl}/sanctum/csrf-cookie`, { method: "GET" });

    if (!csrfResponse.ok) {
      throw new Error(`CSRF取得エラー: ${csrfResponse.status} ${csrfResponse.statusText}`);
    }

    const setCookieHeader = csrfResponse.headers.get("set-cookie");
    if (!setCookieHeader) {
      throw new Error("CSRF Cookie が取得できませんでした");
    }

    // Cookie 解析処理
    const parseCookie = (name: string) =>
      setCookieHeader
        .split(",")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(`${name}=`))
        ?.split(";")[0]
        ?.split("=")[1];

    const xsrfToken = parseCookie("XSRF-TOKEN");
    const laravelSession = parseCookie("laravel_session");

    if (!xsrfToken || !laravelSession) {
      throw new Error("必要なCookie情報が不足しています");
    }

    return { xsrfToken, laravelSession };
  } catch (error) {
    console.error("CSRFトークンとセッションの取得中にエラー:", error);
    return { xsrfToken: null, laravelSession: null };
  }
};