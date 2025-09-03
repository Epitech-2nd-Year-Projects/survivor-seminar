"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  avatar?: string;
  unread?: number;
};

type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
};

const conversations: Conversation[] = [
  { id: "c1", name: "Javier (JEB)", lastMessage: "Let's align by Friday.", unread: 2 },
  { id: "c2", name: "Nina", lastMessage: "Ok pour le deck.", unread: 0 },
  { id: "c3", name: "Team Dev", lastMessage: "Build succeeded ✅", unread: 0 },
];

const initialMessages: Record<string, Message[]> = {
  c1: [
    { id: "m1", from: "them", text: "Hello team, remember the objectives.", time: "09:12" },
    { id: "m2", from: "me",   text: "Noté, on s'en occupe.",                time: "09:14" },
  ],
  c2: [
    { id: "m1", from: "them", text: "Ok pour le deck export PDF.", time: "10:02" },
  ],
  c3: [
    { id: "m1", from: "them", text: "Build succeeded ✅", time: "09:58" },
  ],
};

export default function MessagesPage() {
  const [selected, setSelected] = React.useState(conversations[0].id);
  const [messages, setMessages] = React.useState<Record<string, Message[]>>(initialMessages);
  const [query, setQuery] = React.useState("");
  const [text, setText] = React.useState("");

  const current = conversations.find((c) => c.id === selected)!;
  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => ({
      ...prev,
      [selected]: [
        ...(prev[selected] ?? []),
        { id: Math.random().toString(36).slice(2), from: "me", text: t, time },
      ],
    }));
    setText("");
  }

  React.useEffect(() => {
    const el = document.getElementById("chat-scroll");
    if (el) el.scrollTop = el.scrollHeight;
  }, [selected, messages[selected]?.length]);

  return (
    <div className="flex flex-1 gap-4 p-4">
      <Card className="w-full md:w-80">
        <CardHeader className="pb-2">
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Rechercher…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="mt-3 space-y-1">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left rounded-lg px-3 py-2 hover:bg-muted ${
                  selected === c.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={c.avatar ?? ""} />
                    <AvatarFallback>
                      {c.name
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{c.name}</span>
                      {!!c.unread && <Badge>{c.unread}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {c.lastMessage}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle>{current.name}</CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <div
            id="chat-scroll"
            className="h-[60vh] overflow-y-auto p-4 space-y-3"
          >
            {(messages[selected] ?? []).map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.from === "me" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    m.from === "me"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{m.text}</p>
                  <div
                    className={`mt-1 text-[10px] opacity-70 ${
                      m.from === "me"
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t p-3">
            <Input
              placeholder="Écrire un message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button type="submit">Envoyer</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
