"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  BellOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Info,
} from "lucide-react";
import {
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentPushSubscription,
  sendTestPushNotification,
} from "../services/push.service";

export default function NotificationSettings() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    if (!isPushSupported()) {
      setSupported(false);
      setPermission("unsupported");
      return;
    }

    setSupported(true);
    setPermission(Notification.permission);

    if (Notification.permission === "granted") {
      const sub = await getCurrentPushSubscription();
      setIsSubscribed(!!sub);
    } else {
      setIsSubscribed(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkStatus();
  }, [checkStatus]);

  const handleEnable = async () => {
    setLoading(true);
    setTestStatus(null);
    setErrorMessage(null);
    try {
      const res = await subscribeToPush();
      if (res.success && res.subscription) {
        setIsSubscribed(true);
        setPermission("granted");
      } else {
        setPermission(typeof Notification !== "undefined" ? Notification.permission : "default");
        if (res.error) {
          setErrorMessage(res.error);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error enabling notifications:", error);
      setErrorMessage(error.message || "Failed to enable notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setTestStatus(null);
    setErrorMessage(null);
    try {
      const success = await unsubscribeFromPush();
      if (success) {
        setIsSubscribed(false);
      }
    } catch (err) {
      console.error("Error disabling notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    setTestStatus(null);
    try {
      const sent = await sendTestPushNotification();
      if (sent) {
        setTestStatus("Test notification sent! Check your device notifications.");
      } else {
        setTestStatus("Could not trigger test notification. Ensure device is registered.");
      }
    } catch {
      setTestStatus("Failed to send test notification.");
    } finally {
      setLoading(false);
    }
  };

  if (supported === false) {
    return (
      <div className="border border-[#1C1B18]/15 bg-[#F8F4EA] p-6">
        <div className="flex items-center gap-3 text-[#5F554A]">
          <BellOff size={18} />
          <p className="text-xs font-medium">
            Web Push notifications are not supported in this browser environment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full border border-[#1C1B18]/15 bg-[#F8F4EA] p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-[#1C1B18]/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#174D35]/10 text-[#174D35]">
            <Bell size={16} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-normal text-[#1C1B18]">
              Browser Push Notifications
            </h3>
            <p className="text-[10px] uppercase tracking-wider text-[#5F554A]">
              Device Alert Delivery
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {permission === "granted" && isSubscribed && (
          <span className="flex items-center gap-1.5 rounded-full bg-[#174D35]/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#174D35]">
            <CheckCircle2 size={12} /> Active
          </span>
        )}
        {permission === "granted" && !isSubscribed && (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-amber-700">
            <Info size={12} /> Standby
          </span>
        )}
        {permission === "denied" && (
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-red-700">
            <AlertCircle size={12} /> Blocked
          </span>
        )}
        {permission === "default" && (
          <span className="flex items-center gap-1.5 rounded-full bg-[#1C1B18]/5 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#5F554A]">
            Disabled
          </span>
        )}
      </div>

      {/* Description */}
      <p className="mb-6 text-xs font-medium leading-relaxed text-[#5F554A]">
        Receive instant alerts on this browser when you get new messages, room updates, or account status changes even when livansa is in the background.
      </p>

      {/* Permission: Denied Explanation */}
      {permission === "denied" && (
        <div className="mb-6 border border-red-500/20 bg-red-500/5 p-4 text-xs font-medium text-red-700">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Notifications are blocked in your browser</p>
              <p className="text-[11px] leading-4 text-red-600/90">
                To receive alerts, click the lock or settings icon in your browser address bar, set Notifications to &quot;Allow&quot;, then reload this page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error feedback */}
      {errorMessage && (
        <div className="mb-6 border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-medium text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-700" />
            <div>
              <p className="font-semibold mb-1">Push Service Notice</p>
              <p className="text-[11px] leading-4 text-amber-800/90">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Test feedback */}
      {testStatus && (
        <div className="mb-6 border border-[#174D35]/20 bg-[#174D35]/5 p-3 text-xs font-medium text-[#174D35]">
          {testStatus}
        </div>
      )}

      {/* Action Controls */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        {permission === "granted" && isSubscribed ? (
          <>
            <button
              type="button"
              onClick={handleDisable}
              disabled={loading}
              className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#1C1B18]/20 px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5F554A] transition-all hover:border-red-500/40 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : "Disable on this device"}
            </button>

            <button
              type="button"
              onClick={handleTestNotification}
              disabled={loading}
              className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#174D35] px-5 text-[10px] font-semibold uppercase tracking-[0.16em] !text-[#F8F4EA] transition-all hover:bg-[#1C1B18] disabled:opacity-50"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <><Send size={12} /> Send Test Push</>}
            </button>
          </>
        ) : permission === "granted" && !isSubscribed ? (
          <button
            type="button"
            onClick={handleEnable}
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#174D35] px-6 text-[10px] font-semibold uppercase tracking-[0.16em] !text-[#F8F4EA] transition-all hover:bg-[#1C1B18] disabled:opacity-50"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : "Re-sync Push Notifications"}
          </button>
        ) : permission === "default" ? (
          <button
            type="button"
            onClick={handleEnable}
            disabled={loading}
            className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#174D35] px-6 text-[10px] font-semibold uppercase tracking-[0.16em] !text-[#F8F4EA] transition-all hover:bg-[#1C1B18] disabled:opacity-50"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : "Enable Browser Notifications"}
          </button>
        ) : null}
      </div>

      {/* Architectural corners */}
      <span className="absolute -left-1 -top-1 h-2.5 w-2.5 border-l border-t border-[#174D35]" />
      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 border-r border-t border-[#174D35]" />
      <span className="absolute -bottom-1 -left-1 h-2.5 w-2.5 border-b border-l border-[#174D35]" />
      <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 border-b border-r border-[#174D35]" />
    </div>
  );
}
