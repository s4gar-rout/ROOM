"use client";

import { useEffect } from "react";
import { useConversationSocket } from "@/features/conversation/hooks/useConversationSocket";

export default function NotificationListener({ onNotification }: { onNotification?: (notification: unknown) => void }) {
  useConversationSocket({ enabled: true, onNotification: (payload: any) => onNotification?.(payload?.notification || payload) });
  useEffect(() => undefined, []);
  return null;
}
