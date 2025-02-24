<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::all();
        return response()->json($students, 200);
    }

    public function destroy(Request $request, Student $student)
    {
        $student->delete();
        return response()->json(['message' => 'Student deleted successfully'], 200);
    }
}
