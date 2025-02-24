<?php

use App\Http\Controllers\StudentController;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
//     return $request->user();
// });

Route::get('/users', function () {
    return UserResource::collection(User::all());
});

Route::get('/students', [StudentController::class, 'index']);