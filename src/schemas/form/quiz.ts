import { z } from "zod"

export const quizCreationSchema = z.object({
    topic: z.string().min(4, { message: "Topic must be at least 4 characters long"}).max(50),
    amount: z.number().min(1).max(10),
});

export const checkAnswerSchema = z.object({
    questionId: z.string(),
    userAnswer: z.string(),
});