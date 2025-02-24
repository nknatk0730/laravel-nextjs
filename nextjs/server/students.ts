'use server';

import { Student } from "@/types/students";
import { revalidatePath } from "next/cache";

export const getStudents = async (): Promise<Student[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/students`);
  const students = await res.json();
  return students;
}

// delete Student
export const deleteStudent = async (formData: FormData): Promise<void> => {
  const id = formData.get("id");

  try {
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/students/${id}`, {
      method: "DELETE",
    });
    // reload the page
    revalidatePath("/students");
  } catch (error) {
    console.error(error);
  }
}