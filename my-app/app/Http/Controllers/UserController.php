<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        // get user
        $user = User::find(1);

        return view('user', ['user' => $user]);
    }

    public function dashboard(User $user)
    {
        return response()->json($user);
    }
}
