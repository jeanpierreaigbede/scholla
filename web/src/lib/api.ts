const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const API_ENABLED = !!API_BASE;

/** User-friendly error message (avoids raw "Failed to fetch"). */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === "Failed to fetch" || err.message.includes("Load failed"))
      return "Unable to connect. Check your network.";
    return err.message;
  }
  return "Something went wrong.";
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("schola_token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_ENABLED || !API_BASE) {
    // UI-only mode: no real backend. Return an empty object so screens can render statically.
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[SCHOLA] Backend API disabled, returning mock empty data for", path);
    }
    return {} as T;
  }
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json() as Promise<T>;
}

export type School = {
  id: string;
  name: string;
  address?: string | null;
  picture_url?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  phone?: string | null;
  website_url?: string | null;
};

export const schoolsApi = {
  list: () =>
    API_ENABLED
      ? api<School[]>("/schools")
      : Promise.resolve([]),
};

export const authApi = {
  signup: (data: {
    email: string;
    password: string;
    full_name: string;
    school_name?: string;
    school_id?: string;
  }) =>
    API_ENABLED
      ? api<{ user_id: string; email: string; message: string }>("/auth/signup", {
          method: "POST",
          body: JSON.stringify(data),
        })
      : Promise.resolve({
          user_id: "1",
          email: data.email,
          message: "Mock signup (UI-only mode)",
        }),

  verifyOtp: (data: { email: string; code: string }) =>
    API_ENABLED
      ? api<{ access_token: string; token_type: string }>("/auth/verify-otp", {
          method: "POST",
          body: JSON.stringify(data),
        })
      : Promise.resolve({
          access_token: "mock-token",
          token_type: "bearer",
        }),

  resendOtp: (data: { email: string }) =>
    API_ENABLED
      ? api<{ message: string }>("/auth/resend-otp", {
          method: "POST",
          body: JSON.stringify(data),
        })
      : Promise.resolve({ message: "OK" }),

  login: (data: { email: string; password: string }) =>
    API_ENABLED
      ? api<{ access_token: string; token_type: string }>("/auth/login", {
          method: "POST",
          body: JSON.stringify(data),
        })
      : Promise.resolve({
          access_token: "mock-token",
          token_type: "bearer",
        }),
};

export const usersApi = {
  me: () =>
    API_ENABLED
      ? api<{
          id: number;
          email: string;
          full_name: string;
          school_name: string | null;
          role: string;
          is_verified: boolean;
        }>("/users/me")
      : Promise.resolve({
          id: 1,
          email: "student@example.com",
          full_name: "Mock Student",
          school_name: "Mock SHS",
          role: "student",
          is_verified: true,
        }),
};

// ----- Content / Learn (subjects, modules, lessons, past exams) -----
export type Subject = { id: string; name: string; slug: string; order_index: number };
export type Module = {
  id: string;
  subject_id: string;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  estimated_minutes: number;
  status?: string;
};
export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  content: string;
  order_index: number;
};
export type PastExam = {
  id: string;
  subject_id: string;
  title: string;
  year: number | null;
  order_index: number;
};
export type PastExamQuestion = {
  id: string;
  past_exam_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  order_index: number;
};
export type PastExamResult = {
  attempt_id: string;
  score_percent: number;
  total_questions: number;
  correct_count: number;
  feedback: Array<{
    question_id: string;
    correct: boolean;
    correct_option: string;
    explanation: string | null;
  }>;
};

const contentBase = "/content";
export const contentApi = {
  listSubjects: () =>
    API_ENABLED ? api<Subject[]>(`${contentBase}/subjects`) : Promise.resolve([]),

  getSubject: (subjectId: string) =>
    API_ENABLED ? api<Subject>(`${contentBase}/subjects/${subjectId}`) : Promise.resolve(null as unknown as Subject),

  listModules: (subjectId: string) =>
    API_ENABLED
      ? api<Module[]>(`${contentBase}/subjects/${subjectId}/modules`)
      : Promise.resolve([]),

  getModule: (moduleId: string) =>
    API_ENABLED ? api<Module>(`${contentBase}/modules/${moduleId}`) : Promise.resolve(null as unknown as Module),

  listLessons: (moduleId: string) =>
    API_ENABLED
      ? api<Lesson[]>(`${contentBase}/modules/${moduleId}/lessons`)
      : Promise.resolve([]),

  getLesson: (lessonId: string) =>
    API_ENABLED ? api<Lesson>(`${contentBase}/lessons/${lessonId}`) : Promise.resolve(null as unknown as Lesson),

  listPastExams: (subjectId: string) =>
    API_ENABLED
      ? api<PastExam[]>(`${contentBase}/subjects/${subjectId}/past-exams`).catch(() => [])
      : Promise.resolve([]),

  getPastExam: (examId: string) =>
    API_ENABLED ? api<PastExam>(`${contentBase}/past-exams/${examId}`) : Promise.resolve(null as unknown as PastExam),

  getPastExamQuestions: (examId: string) =>
    API_ENABLED
      ? api<PastExamQuestion[]>(`${contentBase}/past-exams/${examId}/questions`)
      : Promise.resolve([]),

  submitPastExam: (examId: string, answers: { question_id: string; selected_option: string }[]) =>
    API_ENABLED
      ? api<PastExamResult>(`${contentBase}/past-exams/${examId}/submit`, {
          method: "POST",
          body: JSON.stringify({ answers }),
        })
      : Promise.resolve(null as unknown as PastExamResult),
};

// ----- Quiz (validation en fin de leçon / chapitre) -----
export type QuizOut = {
  id: string;
  module_id: string | null;
  title: string;
  description: string | null;
};
export type QuizQuestionOut = {
  id: string;
  quiz_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  order_index: number;
};
export type QuizResultOut = {
  score_percent: number;
  total_questions: number;
  correct_count: number;
  feedback: Array<{ question_id: string; correct: boolean; correct_option: string; explanation: string | null }>;
};

const quizBase = "/quiz";
export const quizApi = {
  listByModule: (moduleId: string) =>
    API_ENABLED
      ? api<QuizOut[]>(`${quizBase}?module_id=${encodeURIComponent(moduleId)}`)
      : Promise.resolve([]),

  getQuestions: (quizId: string) =>
    API_ENABLED
      ? api<QuizQuestionOut[]>(`${quizBase}/${quizId}/questions`)
      : Promise.resolve([]),

  submit: (quizId: string, answers: { question_id: string; selected_option: string }[]) =>
    API_ENABLED
      ? api<QuizResultOut>(`${quizBase}/${quizId}/submit`, {
          method: "POST",
          body: JSON.stringify({ answers }),
        })
      : Promise.resolve(null as unknown as QuizResultOut),
};

// ----- Progress -----
export type LessonCompletion = {
  id: string;
  lesson_id: string;
  completed_at: string | null;
  minutes_spent: number;
};
export type SubjectProgress = {
  subject_id: string;
  lessons_completed: number;
  lessons_total: number;
  past_exams_completed: number;
  past_exams_total: number;
  progress_percent: number;
};

const progressBase = "/progress";
export const progressApi = {
  getSubjectProgress: (subjectId: string) =>
    API_ENABLED
      ? api<SubjectProgress>(`${progressBase}/subjects/${subjectId}`)
      : Promise.resolve(null as unknown as SubjectProgress),

  completeLesson: (lessonId: string) =>
    API_ENABLED
      ? api<LessonCompletion>(`${progressBase}/lessons/${lessonId}/complete`, { method: "POST" })
      : Promise.resolve(null as unknown as LessonCompletion),

  listCompletions: () =>
    API_ENABLED
      ? api<LessonCompletion[]>(`${progressBase}/completions`)
      : Promise.resolve([]),
};
