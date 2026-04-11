"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

interface IChatMessageProps {
  message: Message;
  isStreaming: boolean;
  isFirstInGroup: boolean;
}

export function ChatMessage({ message, isStreaming, isFirstInGroup }: IChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar — only show on first message in a group */}
      {isFirstInGroup ? (
        <Avatar size="sm" className="mt-0.5 shrink-0">
          <AvatarFallback
            className={cn(
              "text-[10px] font-semibold",
              isUser
                ? "bg-blue-600 text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isUser ? "U" : "AI"}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-6 shrink-0" />
      )}

      {/* Message content */}
      {isUser ? (
        <div className="max-w-[70%] rounded-2xl bg-blue-600 px-4 py-2.5 text-sm leading-relaxed text-white dark:bg-blue-500">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      ) : (
        <div className="max-w-[85%] text-sm leading-relaxed text-foreground">
          <p className="whitespace-pre-wrap">
            {message.content}
            {isStreaming && (
              <>
                <span className="sr-only">AI is typing...</span>
                <span className="ml-1 inline-flex items-baseline gap-[3px]" aria-hidden="true">
                  <span className="animate-dot-pulse inline-block h-[5px] w-[5px] rounded-full bg-muted-foreground" />
                  <span className="animate-dot-pulse inline-block h-[5px] w-[5px] rounded-full bg-muted-foreground [animation-delay:160ms]" />
                  <span className="animate-dot-pulse inline-block h-[5px] w-[5px] rounded-full bg-muted-foreground [animation-delay:320ms]" />
                </span>
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
