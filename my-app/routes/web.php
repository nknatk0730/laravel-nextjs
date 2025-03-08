<?php

use App\Http\Controllers\StudentController;
use App\Http\Controllers\TodoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth');

Route::get('/students', [StudentController::class, 'index']);

Route::get('/todos', [TodoController::class, 'index'])->middleware('auth');
Route::post('/create', [TodoController::class, 'store'])->middleware('auth');

require __DIR__.'/auth.php';
