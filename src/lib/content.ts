import { promises as fs } from "node:fs";
import path from "node:path";
import {
  Lesson,
  LessonMeta,
  Track,
  lessonSchema,
} from "./content-types";

const CONTENT_ROOT = path.join(process.cwd(), "content", "lessons");

async function readTrack(track: Track): Promise<Lesson[]> {
  const dir = path.join(CONTENT_ROOT, track);
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  const lessons: Lesson[] = [];
  for (const entry of entries) {
    if (!entry.endsWith(".json")) continue;
    const raw = await fs.readFile(path.join(dir, entry), "utf8");
    const parsed = lessonSchema.parse(JSON.parse(raw));
    lessons.push(parsed);
  }
  return lessons.sort((a, b) => a.order - b.order);
}

export async function listLessons(track: Track): Promise<LessonMeta[]> {
  const lessons = await readTrack(track);
  return lessons.map(({ questions, ...rest }) => ({
    ...rest,
    questionCount: questions.length,
  }));
}

export async function listLessonsByUnit(track: Track) {
  const lessons = await listLessons(track);
  const byUnit = new Map<string, LessonMeta[]>();
  for (const lesson of lessons) {
    const list = byUnit.get(lesson.unit) ?? [];
    list.push(lesson);
    byUnit.set(lesson.unit, list);
  }
  return Array.from(byUnit.entries()).map(([unit, lessons]) => ({
    unit,
    lessons,
  }));
}

export async function getLesson(id: string): Promise<Lesson | null> {
  const track = id.split("/")[0] as Track;
  if (!["css", "html", "js"].includes(track)) return null;
  const lessons = await readTrack(track);
  return lessons.find((l) => l.id === id) ?? null;
}
