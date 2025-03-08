<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TodoController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $user = Auth::user();

        $todo = Todo::create([
            'title' => $request->title,
            'user_id' => $user->id
        ]);

        return response()->json($todo, 201);
    }

    public function index()
    {
        $user = Auth::user();

        return response()->json($user->todos, 200);
    }
}
