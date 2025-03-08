'use server';


import { getCsrfTokenAndSession } from "@/server/user";
import { User } from "@/types/user";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export const checkAuth = cache(async (): Promise<User> => {
  const cookieStore = await cookies();
  const laravelSession = cookieStore.get('laravel_session');
  const xsrfToken = cookieStore.get('XSRF-TOKEN');

  if (!laravelSession || !xsrfToken) {
    // 未ログインの場合は「/login」へリダイレクト
    redirect('/login');
  }

  // Laravelの認証状態を確認するエンドポイント（例：/api/userなど）で認証状態を確認する
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const res = await fetch(`${backendUrl}/user`, {
    method: "GET",
    headers: {
      "X-XSRF-TOKEN": decodeURIComponent(xsrfToken.value),
      Cookie: `laravel_session=${laravelSession.value}`,
      Accept: "application/json",
    },
    cache: 'no-store' // 必ず最新の情報を取得
  });

  const data: User = await res.json();

  if (res.status === 401) {
    // 未認証の場合は「/login」へリダイレクト
    redirect('/login');
  }

  return data; // 認証されていればtrue
});

// const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// const getAuthCookies = async () => {
//   const cookieStore = await cookies();
//   return {
//     xsrfToken: cookieStore.get("XSRF-TOKEN")?.value,
//     laravelSession: cookieStore.get("laravel_session")?.value,
//     cookieStore,
//   };
// };

// const updateAuthCookies = (cookieHeader: string, cookieStore: Awaited<ReturnType<typeof cookies>>) => {
//   const sessionMatch = cookieHeader.match(/laravel_session=([^;]+)/);
//   const xsrfTokenMatch = cookieHeader.match(/XSRF-TOKEN=([^;]+)/);

//   if (sessionMatch && xsrfTokenMatch) {
//     cookieStore.set("XSRF-TOKEN", xsrfTokenMatch[1], { httpOnly: true });
//     cookieStore.set("laravel_session", sessionMatch[1], { httpOnly: true });
//   }
// };

// export const checkAuthStatus = async () => {
//   const { xsrfToken, laravelSession, cookieStore } = await getAuthCookies();

//   if (!xsrfToken || !laravelSession) {
//     redirect("/login");
//   }

//   const res = await fetch(`${backendUrl}/user`, {
//     method: "GET",
//     headers: {
//       "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
//       Cookie: `laravel_session=${laravelSession}`,
//       Accept: "application/json",
//     },
//   });

//   const data = await res.json();

//   return data;
// };



// export const checkAuthStatus = async () => {
//   const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
//   const cookieStore = await cookies();
//   const xsrfToken = cookieStore.get("XSRF-TOKEN")?.value;
//   const laravelSession = cookieStore.get("laravel_session")?.value;

//   if (!xsrfToken || !laravelSession) {
//     return redirect("/login");
    
//   }

//   const res = await fetch(`${backendUrl}/user`, {
//     method: "GET",
//     headers: {
//       "X-XSRF-TOKEN": decodeURIComponent(xsrfToken),
//       Cookie: `laravel_session=${laravelSession}`,
//       "Accept": "application/json",
//     },
//   });

//   const data = await res.json();
//   const setCookie = res.headers.get("set-cookie");
//   if (setCookie) {
//     const sessionMatch = setCookie.match(/laravel_session=([^;]+)/);
//     const xsrfTokenMatch = setCookie.match(/XSRF-TOKEN=([^;]+)/);
//     if (sessionMatch && xsrfTokenMatch) {
//       cookieStore.set("XSRF-TOKEN", xsrfTokenMatch[1], { httpOnly: true });
//       cookieStore.set("laravel_session", sessionMatch[1], { httpOnly: true });
//     }
//   }
//   return data;
// };


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

    // console.log("送信するXSRF-TOKEN:", xsrfToken);
    // console.log("送信するCookie:", laravelSession);

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
      console.log("レスポンス:", responseJson);
    } else if (res.status !== 204) {
      console.warn("予期しないレスポンス:", await res.text());
    }
    const setCookie = res.headers.get("set-cookie");
    // console.log("setCookie:", setCookie);
  if (setCookie) {
    const sessionMatch = setCookie.match(/laravel_session=([^;]+)/);
    const xsrfTokenMatch = setCookie.match(/XSRF-TOKEN=([^;]+)/);
    if (sessionMatch && xsrfTokenMatch) {
      const cookieStore = await cookies();
      cookieStore.set("XSRF-TOKEN", xsrfTokenMatch[1], { httpOnly: true });
      cookieStore.set("laravel_session", sessionMatch[1], { httpOnly: true });
    }
  }
  } catch (error) {
    console.error(error);
  }

  redirect('/dashboard');
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
    const xsrfToken = cookieStore.get("XSRF-TOKEN");
    const laravelSession = cookieStore.get("laravel_session");

    if (!xsrfToken || !laravelSession) {
      return redirect("/login");
    }

    const res = await fetch(`${backendUrl}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": decodeURIComponent(xsrfToken.value),
        Cookie: `laravel_session=${laravelSession.value}`,
        Accept: "application/json",
      },
    });

    if (res.status === 204) {
      cookieStore.delete("XSRF-TOKEN");
      cookieStore.delete("laravel_session");
    }

    console.log(res.status, res.statusText);
    console.log("レスポンスボディ:", await res.text());
  } catch (error) {
    console.error(error);
  }

  redirect("/login");
}