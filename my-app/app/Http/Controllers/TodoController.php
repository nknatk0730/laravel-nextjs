<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TodoController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $todo = Todo::create([
            'title' => $request->title,
            'user_id' => $user->id
        ]);

        return response()->json([
            'message' => 'Todo created successfully.',
            'data' => $todo
        ], 201);
    }

    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json($user->todos, 200);
    }

    public function destroy(Todo $todo)
    {
        $user = Auth::user();

        if ($todo->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden',
            ], 403);
        }

        $todo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Todo deleted successfully',
        ], 200);
    }
}
