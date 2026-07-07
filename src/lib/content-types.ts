import { z } from "zod";

export const trackSchema = z.enum(["css", "html", "js"]);
export type Track = z.infer<typeof trackSchema>;

const mcqQuestion = z.object({
  type: z.literal("mcq"),
  prompt: z.string(),
  code: z.string().optional(),
  language: z.enum(["css", "html", "js"]).optional(),
  options: z.array(z.string()).min(2),
  answer: z.number().int().nonnegative(),
  explanation: z.string().optional(),
});

const predictQuestion = z.object({
  type: z.literal("predict"),
  prompt: z.string(),
  code: z.string(),
  language: z.enum(["css", "html", "js"]),
  options: z.array(z.string()).min(2),
  answer: z.number().int().nonnegative(),
  explanation: z.string().optional(),
});

const fixBugQuestion = z.object({
  type: z.literal("fix-bug"),
  prompt: z.string(),
  language: z.enum(["css", "html", "js"]),
  broken: z.string(),
  mustInclude: z.array(z.string()).default([]),
  mustNotInclude: z.array(z.string()).default([]),
  hint: z.string().optional(),
  explanation: z.string().optional(),
});

const writeToMatchQuestion = z.object({
  type: z.literal("write-to-match"),
  prompt: z.string(),
  html: z.string(),
  targetCss: z.string(),
  startingCss: z.string(),
  mustInclude: z.array(z.string()).default([]),
  mustNotInclude: z.array(z.string()).default([]),
  hint: z.string().optional(),
  explanation: z.string().optional(),
});

export const questionSchema = z.discriminatedUnion("type", [
  mcqQuestion,
  predictQuestion,
  fixBugQuestion,
  writeToMatchQuestion,
]);

export type Question = z.infer<typeof questionSchema>;
export type McqQuestion = z.infer<typeof mcqQuestion>;
export type PredictQuestion = z.infer<typeof predictQuestion>;
export type FixBugQuestion = z.infer<typeof fixBugQuestion>;
export type WriteToMatchQuestion = z.infer<typeof writeToMatchQuestion>;

export const lessonSchema = z.object({
  id: z.string(),
  track: trackSchema,
  unit: z.string(),
  order: z.number().int().nonnegative(),
  title: z.string(),
  description: z.string(),
  xp: z.number().int().positive().default(10),
  questions: z.array(questionSchema).min(1),
});

export type Lesson = z.infer<typeof lessonSchema>;

export type LessonMeta = Omit<Lesson, "questions"> & {
  questionCount: number;
};

export function gradeQuestion(question: Question, answer: unknown): boolean {
  if (question.type === "mcq" || question.type === "predict") {
    return typeof answer === "number" && answer === question.answer;
  }
  if (question.type === "fix-bug" || question.type === "write-to-match") {
    if (typeof answer !== "string") return false;
    const submitted = answer;
    const included = question.mustInclude.every((s) =>
      normalize(submitted).includes(normalize(s)),
    );
    const excluded = question.mustNotInclude.every(
      (s) => !normalize(submitted).includes(normalize(s)),
    );
    return included && excluded;
  }
  return false;
}

function normalize(s: string) {
  return s.replace(/\s+/g, " ").trim();
}
