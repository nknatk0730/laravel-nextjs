<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): JsonResponse | Response
    {
        Log::info('認証処理が呼ばれました', ['email' => $request->email]);
    
        try {
            $request->authenticate();
            Log::info('認証成功', ['user' => Auth::user()]);
    
            $request->session()->regenerate();
            return response()->noContent();
        } catch (\Exception $e) {
            Log::error('認証エラー', ['message' => $e->getMessage()]);
            return response()->json(['error' => '認証失敗'], 401);
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): Response
    {
        Log::info('ログアウトAPIが呼ばれました');
        Log::info('現在のログインユーザー:', ['user' => Auth::user()]);

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->noContent();
    }
}
