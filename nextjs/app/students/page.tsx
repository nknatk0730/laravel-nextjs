import { deleteStudent, getStudents } from "@/server/students";

export default async function page() {
  const students = await getStudents();

  return (
    <div className="p-4 space-y-8">
      <div className="space-y-4">
        {students.map((student) => (
          <div key={student.id} className="space-y-2 shadow-2xl rounded p-4">
            <h2>{student.name}</h2>
            <p>Created at: {student.created_at}</p>
            <p>Updated at: {student.updated_at}</p>
            <form action={deleteStudent}>
              <input type="hidden" name="id" value={student.id} />
              <button type="submit" className="p-1 border rounded bg-red-500 hover:bg-red-700">
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
