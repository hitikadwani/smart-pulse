import { getAuthSession } from "@/lib/nextauth";
import { NextResponse } from "next/server";
import { quizCreationSchema } from "@/schemas/form/quiz";
import axios from "axios";
import { ZodError } from "zod";
import { prisma } from "@/lib/db";

// /api/game
export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        {
          error: "You must be logged in",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, topic } = quizCreationSchema.parse(body);

    // Create a new game entry
    const game = await prisma.game.create({
      data: {
       
        timeStarted: new Date(),
        userId: session.user.id,
        topic,
      },
    });

    // Update or insert topic count
    await prisma.topicCount.upsert({
      where: {
        topic,
      },
      create: {
        topic,
        count: 1,
      },
      update: {
        count: {
          increment: 1,
        },
      },
    });

    // Fetch questions from your API
    const { data } = await axios.post(`${process.env.API_URL}/api/questions`, {
      amount,
      topic,
    });

    // Process the received questions
    const mcqQuestions = data.questions.map((question: {
      question: string;
      answer: string;
      option1: string;
      option2: string;
      option3: string;
    }) => {
      let options = [
        question.answer,
        question.option1,
        question.option2,
        question.option3,
      ];
      options = options.sort(() => Math.random() - 0.5); // Shuffle options

      return {
        question: question.question,
        answer: question.answer,
        options: JSON.stringify(options), // Store options as JSON string
        gameId: game.id,
        
      };
    });

    // Save all questions to the database
    await prisma.question.createMany({
      data: mcqQuestions,
    });

    return NextResponse.json({
      gameId: game.id,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
