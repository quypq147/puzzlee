"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function ParticipantJoinBar() {
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/event/join?code=${code}`);
    }
  };

  return (
    <form
      onSubmit={handleJoin}
      className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-3 shadow-sm"
    >
      <span className="text-sm font-semibold text-primary">Joining as a participant?</span>
      <div className="flex flex-1 items-center gap-2">
        <span className="text-muted-foreground">#</span>
        <Input
          type="text"
          placeholder="Enter code here"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:border-0"
        />
      </div>
      <Button
        type="submit"
        size="icon"
        className="h-8 w-8 rounded-full shrink-0 bg-primary hover:bg-primary/90"
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
