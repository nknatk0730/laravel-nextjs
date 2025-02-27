<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\StudentController;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::middleware(['auth:sanctum'])->get('/student', function (Request $request) {
//     return $request->user();
// });

// Route::post('/register', [RegisteredUserController::class, 'store'])
//     ->middleware('guest')
//     ->name('register');


// Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
//     ->middleware('auth')
//     ->name('logout');

Route::get('/users', function () {
    return UserResource::collection(User::all());
});

Route::get('/students', [StudentController::class, 'index']);
Route::delete('/students/{student}', [StudentController::class, 'destroy']);
Route::post('/students', [StudentController::class, 'store']);