import { NextResponse } from "next/server";
import { quizCreationSchema } from "@/schemas/form/quiz";
import { ZodError } from "zod";
import { strict_output } from "@/lib/arliAi";

// POST /api/questions
export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { amount, topic } = quizCreationSchema.parse(body);

    // Construct prompts for the AI
    const prompts = new Array(amount).fill(
      `Generate a random hard MCQ question about ${topic}.`
    );

    // Generate questions
    let questions = await strict_output(
      "You are a helpful AI that generates MCQ questions and answers. Each answer should not exceed 15 words. Format your response as a JSON array of objects, each containing the fields 'question', 'answer', 'option1', 'option2', and 'option3'. Do not include any additional text or formatting.",
      prompts,
      {
        question: "question",
        answer: "answer with max length of 15 words",
        option1: "option1 with max length of 15 words",
        option2: "option2 with max length of 15 words",
        option3: "option3 with max length of 15 words",
      }
    );

    // Try to parse the questions to ensure they're in the correct format
    try {
      questions = JSON.parse(questions);
    } catch (e) {
      throw new Error("Invalid JSON format from AI response.");
    }

    // Ensure questions are formatted correctly
    if (!Array.isArray(questions)) {
      throw new Error("Invalid response format from AI.");
    }

    // Return response
    return NextResponse.json(
      {
        questions,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues,
        },
        {
          status: 400,
        }
      );
    }

    console.error("Error in /api/questions:", error); // Log error details
    return NextResponse.json(
      {
        error: "An unexpected error occurred.",
      },
      {
        status: 500,
      }
    );
  }
};
