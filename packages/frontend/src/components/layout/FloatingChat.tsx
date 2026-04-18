"use client";

import { MessageCircle } from "lucide-react";

export function FloatingChat() {
  return (
    <button className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg hover:opacity-90 transition-opacity">
      <MessageCircle className="h-6 w-6" />
      {/* Online dot */}
      <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background" />
    </button>
  );
}
