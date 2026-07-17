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

export type UnitGroup = { unit: string; lessons: LessonMeta[] };
export type SectionGroup = {
  section: string | null;
  sectionOrder: number;
  units: UnitGroup[];
};

export async function listLessonsBySection(
  track: Track,
): Promise<SectionGroup[]> {
  const lessons = await listLessons(track);

  const bySection = new Map<
    string,
    { sectionOrder: number; units: Map<string, LessonMeta[]> }
  >();

  for (const lesson of lessons) {
    const sectionKey = lesson.section ?? "";
    if (!bySection.has(sectionKey)) {
      bySection.set(sectionKey, {
        sectionOrder: lesson.sectionOrder ?? 0,
        units: new Map(),
      });
    }
    const sec = bySection.get(sectionKey)!;
    if (lesson.sectionOrder !== undefined) {
      sec.sectionOrder = Math.min(sec.sectionOrder, lesson.sectionOrder);
    }
    if (!sec.units.has(lesson.unit)) sec.units.set(lesson.unit, []);
    sec.units.get(lesson.unit)!.push(lesson);
  }

  return Array.from(bySection.entries())
    .map(([section, { sectionOrder, units }]) => ({
      section: section === "" ? null : section,
      sectionOrder,
      units: Array.from(units.entries()).map(([unit, lessons]) => ({
        unit,
        lessons,
      })),
    }))
    .sort((a, b) => a.sectionOrder - b.sectionOrder);
}

const VALID_TRACKS: Track[] = [
  "css",
  "html",
  "js",
  "react",
  "react-native",
  "ts",
  "redux",
];

export async function getLesson(id: string): Promise<Lesson | null> {
  const track = id.split("/")[0] as Track;
  if (!VALID_TRACKS.includes(track)) return null;
  const lessons = await readTrack(track);
  return lessons.find((l) => l.id === id) ?? null;
}

export async function listAllLessons(): Promise<Lesson[]> {
  const perTrack = await Promise.all(VALID_TRACKS.map((t) => readTrack(t)));
  return perTrack.flat();
}
