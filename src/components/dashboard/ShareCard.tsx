"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Share, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {};

const ShareCard = (props: Props) => {
  const router = useRouter();
  return (
    <Card
      className="hover:cusor-pointer hover:opacity-75"
      onClick={() => {
        router.push("/share");
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-2xl font-bold">Share</CardTitle>
        <Share2 size={28} strokeWidth={2.5} />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Share with your Friends!</p>
      </CardContent>
    </Card>
  );
};

export default ShareCard;