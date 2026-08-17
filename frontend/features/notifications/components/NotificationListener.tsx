"use client";

import { useEffect } from "react";
import { useConversationSocket } from "@/features/conversation/hooks/useConversationSocket";

export default function NotificationListener({ onNotification }: { onNotification?: (notification: any) => void }) {
  useConversationSocket({ enabled: true, onNotification: (payload) => onNotification?.(payload?.notification || payload) });
  useEffect(() => undefined, []);
  return null;
}
