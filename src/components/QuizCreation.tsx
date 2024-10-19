"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useForm } from "react-hook-form";
import { quizCreationSchema } from "@/schemas/form/quiz";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Import QueryClientProvider

type Props = {
  topicParam: string;
};

type Input = z.infer<typeof quizCreationSchema>;

const QuizCreation = ({ topicParam }: Props) => {
  const router = useRouter();
  const [finished, setFinished] = React.useState(false);

  const form = useForm<Input>({
    resolver: zodResolver(quizCreationSchema),
    defaultValues: {
      amount: 3,
      topic: topicParam,
    },
  });

  const { mutate: getQuestions } = useMutation({
    mutationFn: async ({ amount, topic }: Input) => {
      const response = await axios.post("/api/game", {
        amount,
        topic,
      });
      return response.data;
    },
    onSuccess: ({ gameId }) => {
      setFinished(true);
      setTimeout(() => {
        router.push(`/play/mcq/${gameId}`);
      }, 1000);
    },
    onError: () => {
      console.error("Error fetching questions");
    },
  });

  function onSubmit(input: Input) {
    getQuestions({
      amount: input.amount,
      topic: input.topic,
    });
  }

  form.watch();

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold text-2x">Quiz Creation</CardTitle>
          <CardDescription>Choose a topic</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a topic..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter an amount..."
                        {...field}
                        type="number"
                        min={1}
                        max={10}
                        onChange={(e) => {
                          form.setValue("amount", parseInt(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="ml-16" type="submit">Submit</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

// Wrap your component in QueryClientProvider
const queryClient = new QueryClient();

const QuizCreationWrapper = (props: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <QuizCreation {...props} />
    </QueryClientProvider>
  );
};

export default QuizCreationWrapper;
