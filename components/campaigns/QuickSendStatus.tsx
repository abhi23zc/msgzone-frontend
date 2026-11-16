"use client";
import { useEffect, useState } from "react";
import { Alert, Button, Tag } from "antd";
import Link from "next/link";
import api from "@/services/api";

type QueueHealth = { paused: boolean; workers: number; available: boolean };
type Snapshot = {
  quick: QueueHealth;
  recipients: QueueHealth;
  executions: { _id: string; name: string; state: string; pauseReason?: string;
    summary?: Record<string, number> }[];
  queued: { id: string; state: string; error?: string }[];
};

export default function QuickSendStatus({ onAvailability }: { onAvailability: (available: boolean) => void }) {
  const [status, setStatus] = useState<Snapshot>();
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let busy = false;
    const load = async () => {
      if (busy || document.hidden || controller.signal.aborted) return;
      busy = true;
      try {
        const response = await api.get("/campaigns/sending-status", { signal: controller.signal });
        if (!controller.signal.aborted) {
          const next: Snapshot = response.data.data;
          setStatus(next);
          setError("");
          onAvailability(next.quick.available && next.recipients.available);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Cannot check sending service. Refresh to try again.");
          onAvailability(false);
        }
      } finally { busy = false; }
    };
    void load();
    const timer = setInterval(() => void load(), 5000);
    document.addEventListener("visibilitychange", load);
    return () => {
      controller.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, [refresh, onAvailability]);
  const unavailable = status && (!status.quick.available || !status.recipients.available);
  return <div className="mb-6 min-w-0 space-y-3" aria-live="polite">
    {error ? <Alert type="error" showIcon message={error} /> : unavailable ?
      <Alert type="warning" showIcon message={status.quick.paused || status.recipients.paused ?
        "Sending is paused for maintenance. Contact the administrator to review and resume the queue." :
        "Sending service has no connected worker. Contact the administrator."} /> :
      !status ? <p className="text-gray-500">Checking sending service…</p> : null}
    <details className="rounded-lg border border-gray-200 p-3 bg-gray-50 min-w-0">
      <summary className="cursor-pointer font-medium">Recent sends and queue status</summary>
      <p className="text-sm text-gray-600 mt-2">Queued means waiting for processing. Sent means WhatsApp acknowledged submission; delivery is tracked separately.</p>
      <Button size="small" onClick={() => setRefresh(value => value + 1)} className="my-2">Refresh status</Button>
      {status?.queued.map(job => <div key={job.id} className="py-2 border-t break-words text-sm">
        <Tag color={job.state === "failed" ? "red" : "blue"}>{job.state}</Tag>
        {job.state === "paused" ? "Waiting for the administrator to resume sending." : "Quick-send request"}
        {job.error && <p className="text-red-700 mt-1">{job.error}</p>}
      </div>)}
      {status?.executions.map(item => <div key={item._id} className="py-2 border-t text-sm break-words">
        <Tag color={item.state === "paused" ? "orange" : "blue"}>{item.state}</Tag>
        <Link className="text-blue-600 underline" href={`/campaigns/${item._id}`}>{item.name}: view progress and controls</Link>
        {item.summary && <span className="block mt-1">Sent: {item.summary.sent || 0} · Failed: {(item.summary.failed || 0) + (item.summary.partial_failed || 0)} · Unknown: {item.summary.unknown || 0}</span>}
        {item.pauseReason && <p className="text-amber-800 mt-1">{item.pauseReason}</p>}
      </div>)}
      {status && !status.executions.length && !status.queued.length && <p className="text-gray-500">No recent sends.</p>}
    </details>
  </div>;
}
