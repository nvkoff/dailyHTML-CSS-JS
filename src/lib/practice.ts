import { Question, Track } from "./content-types";
import { getLesson, listLessons } from "./content";

export type PracticeQuestion = Question & { lessonId: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function buildPracticeSet(
  track: Track,
  completedIds: Set<string>,
  count = 10,
): Promise<PracticeQuestion[]> {
  const lessons = await listLessons(track);
  const eligible = lessons.filter((l) => completedIds.has(l.id));

  const pool: PracticeQuestion[] = [];
  for (const meta of eligible) {
    const lesson = await getLesson(meta.id);
    if (!lesson) continue;
    for (const q of lesson.questions) {
      pool.push({ ...q, lessonId: lesson.id });
    }
  }

  return shuffle(pool).slice(0, Math.min(count, pool.length));
}
