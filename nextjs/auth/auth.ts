'use server';


import { getCsrfTokenAndSession } from "@/server/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";



export const checkAuthStatus = async () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const res = await fetch(`${backendUrl}/user`, {
    method: "GET",
    credentials: "include", // Cookie を送信
    headers: {
      "Accept": "application/json",
    },
  });

  const data = await res.json();
  console.log("ログイン状態:", res.status, data);
};


export const login = async (formData: FormData): Promise<void> => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("NEXT_PUBLIC_BACKEND_URL が設定されていません");
    }

    const user = {
      email: formData.get("email")?.toString() || "",
      password: formData.get("password")?.toString() || "",
    };

    // CSRFトークンとセッションを取得
    const { xsrfToken, laravelSession } = await getCsrfTokenAndSession(backendUrl);
    if (!xsrfToken || !laravelSession) {
      throw new Error("CSRFトークンまたは Laravel セッションの取得に失敗しました");
    }

    console.log("送信するXSRF-TOKEN:", xsrfToken);
    console.log("送信するCookie:", laravelSession);

    const cookieStore = await cookies();

    // ユーザー登録リクエスト
    const res = await fetch(`${backendUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
        Cookie: `laravel_session=${laravelSession}`,
        Accept: "application/json",
      },
      body: JSON.stringify(user),
    });

    console.log("登録リクエスト結果:", res.status, res.statusText);
    // JSONレスポンスがあるかを確認
    const contentType = res.headers.get("Content-Type");
    if (contentType?.includes("application/json")) {
      const responseJson = await res.json();
      cookieStore.set("user", JSON.stringify(responseJson), { httpOnly: true });
      console.log("レスポンス:", responseJson);
    } else if (res.status !== 204) {
      console.warn("予期しないレスポンス:", await res.text());
    }

    const setCookie = res.headers.get("set-cookie");
    console.log("setCookie:", setCookie);
  if (setCookie) {
    const sessionMatch = setCookie.match(/laravel_session=([^;]+)/);
    const xsrfTokenMatch = setCookie.match(/XSRF-TOKEN=([^;]+)/);
    if (sessionMatch && xsrfTokenMatch) {
      cookieStore.set("XSRF-TOKEN", xsrfTokenMatch[1], { httpOnly: true });
      cookieStore.set("laravel_session", sessionMatch[1], { httpOnly: true });
    }
  }
    
    // CSRFトークンとセッションを再取得
    // const { xsrfToken: newXsrfToken, laravelSession: newLaravelSession } = await getCsrfTokenAndSession(backendUrl);
    // if (!newXsrfToken || !newLaravelSession) {
    //   throw new Error("CSRFトークンまたは Laravel セッションの取得に失敗しました");
    // }

    // cookieStore.set("XSRF-TOKEN", newXsrfToken, { httpOnly: true });
    // cookieStore.set("laravel_session", newLaravelSession, { httpOnly: true });

  } catch (error) {
    console.error(error);
  }

  // redirect('/dashboard');
}

export const getCsrf = async () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL が設定されていません");
  }
  // CSRFトークンとセッションを取得
  const res = await fetch(`${backendUrl}/sanctum/csrf-cookie`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  const setCookieHeader = res.headers.get("set-cookie");
    if (!setCookieHeader) {
      throw new Error("CSRF Cookie が取得できませんでした");
    }

  console.log(setCookieHeader);
  console.log(res.status, res.statusText);
  console.log("レスポンスボディ:", await res.text());
}

export const logout = async (): Promise<void> => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      throw new Error("NEXT_PUBLIC_BACKEND_URL が設定されていません");
    }

    const cookieStore = await cookies();

    // const { xsrfToken, laravelSession } = await getCsrfTokenAndSession(backendUrl);
    // if (!xsrfToken || !laravelSession) {
    //   throw new Error("CSRFトークンまたは Laravel セッションの取得に失敗しました");
    // }
    const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;
    const laravelSession = cookieStore.get("laravel_session")?.value;

    console.log("送信するXSRF-TOKEN:", xsrfToken);
    console.log("送信するCookie:", laravelSession);

    if (!xsrfToken || !laravelSession) {
      return redirect("/login");
    }

    const res = await fetch(`${backendUrl}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
        Cookie: `laravel_session=${laravelSession}`,
        Accept: "application/json",
      },
      // credentials: "include",
    });

    console.log(res.status, res.statusText);
    console.log("レスポンスボディ:", await res.text());

    if (res.ok) {
      cookieStore.delete("laravel_session");
      cookieStore.delete("XSRF-TOKEN");
      console.log(cookieStore.getAll());
    }
  } catch (error) {
    console.error(error);
  }

  // redirect("/login");
}