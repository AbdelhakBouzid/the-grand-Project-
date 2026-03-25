import { Shell } from '../../components/shell';

export default function ExamsPage() {
  return (
    <Shell title="Exam Archive">
      <p className="mb-4 text-sm text-gray-700">Browse archived exams using subject and year filters.</p>
      <ul className="list-disc space-y-2 pl-5 text-sm">
        <li>List exams: <code>GET /exam-archive?page=1&limit=10&subject=physics&year=2022</code></li>
        <li>Add exam set (teacher/admin): <code>POST /exam-archive</code></li>
      </ul>
    </Shell>
  );
}
