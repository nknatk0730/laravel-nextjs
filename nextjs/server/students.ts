'use server';

import { Student } from "@/types/students";
import { revalidatePath } from "next/cache";
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


export const createStudent = async (formData: FormData): Promise<void> => {
  const studentData = {
    name: formData.get("name"), 
    // email: formData.get("email"),
    // password: formData.get("password"),
  }

  try {
    // const csrf = await fetch(
    //   `${process.env.NEXT_PUBLIC_BACKEND_URL}/sanctum/csrf-cookie`,
    //   {
    //     method: "GET",
    //     credentials: "include",
    //   }
    // );
    // 2️⃣ `set-cookie` ヘッダーから `XSRF-TOKEN` を取得
    // const setCookieHeader = csrf.headers.get("set-cookie");
    // if (!setCookieHeader) {
    //   throw new Error("No Set-Cookie header found");
    // }

    // // 3️⃣ XSRF-TOKEN を正規表現で抽出
    // const match = setCookieHeader.match(/XSRF-TOKEN=([^;]+)/);
    // const xsrfToken = match ? decodeURIComponent(match[1]) : null;

    // if (!xsrfToken) {
    //   throw new Error("CSRF token not found in response headers");
    // }

    // console.log("CSRF Token:", xsrfToken);

    // const csrfToken = csrf.headers.get("set-cookie")?.match(/XSRF-TOKEN=([^;]+)/)?.[1];

    {/*const res = */} await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "X-XSRF-TOKEN": decodeURIComponent(xsrfToken || ""), // デコードしてセット
      },
      credentials: "include",
      body: JSON.stringify(studentData),
    });

    // console.log("Response status:", res.status);
    // console.log("Response headers:", res.headers);

    // const text = await res.text(); // JSONでない可能性があるため `.text()` で確認
    // console.log("Response body:", text);

    // Laravel の JSON レスポンスを取得
    // if (!res.ok) {
    //   throw new Error("Failed to register student");
    // }

    // const data = await res.json();
    // console.log("Registered student:", data);
    // reload the page
    revalidatePath("/students");
  } catch (error) {
    console.error(error);
  }

  redirect("/students");
}

// logout
export const logout = async (): Promise<void> => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/logout`, {
      method: "POST",
    });
  } catch (error) {
    console.error(error);
  }
}