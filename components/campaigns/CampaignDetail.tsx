"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Tag,
  Alert,
  Spin,
  Progress,
  Popconfirm,
  Select,
  Modal,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Campaign,
  Recipient,
  Page,
  campaignRequest,
  duration,
  downloadOutcomes,
  emptyPage,
  normalizePage,
  sendingConfig,
  SendingConfig,
} from "@/services/campaigns";
import SendingSettings from "./SendingSettings";
function friendlyError(code?: string, message?: string) {
  if (!code && !message) return "";
  switch (code) {
    case "QUOTA":
      return "Your message quota is exhausted. Upgrade your plan or wait for the next billing cycle.";
    case "ACCOUNT":
      return "Your account is not eligible to send. Please verify your account or contact support.";
    case "DISCONNECTED":
      return "The WhatsApp device disconnected. Reconnect the device and resume the campaign.";
    case "DEVICE_LIMIT":
      return "The device hit its daily cap or rate limit. It will resume automatically when the limit resets.";
    case "FENCE":
      return "The campaign was modified while sending. The system will retry automatically.";
    case "TEMPORARY":
      return "A temporary network issue occurred. The system will retry automatically.";
    case "BOOKKEEPING":
      return "A backend bookkeeping delay occurred. The message was accepted but confirmation is pending.";
    case "ASSET":
      return "A media attachment could not be found. Please re-upload the asset.";
    default:
      return message || "An unexpected error occurred. Please try again or contact support.";
  }
}
export default function CampaignDetail({ id }: { id: string }) {
  const router = useRouter();
  const [c, setC] = useState<Campaign>(),
    [rows, setRows] = useState<Page<Recipient>>(emptyPage()),
    [page, setPage] = useState(1),
    [filter, setFilter] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const active = c && ["running", "scheduled", "paused"].includes(c.state);
  const [editingPool, setEditingPool] = useState<SendingConfig>();
  useEffect(() => {
    const controller = new AbortController();
    let running = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const load = async () => {
      if (running || document.hidden || controller.signal.aborted) return;
      running = true;
      try {
        const [fresh, list] = await Promise.all([
          campaignRequest<Campaign>(
            "get",
            `/${id}`,
            undefined,
            undefined,
            controller.signal,
          ),
          campaignRequest<Page<Recipient>>(
            "get",
            `/${id}/recipients?page=${page}&state=${filter}`,
            undefined,
            undefined,
            controller.signal,
          ),
        ]);
        if (!controller.signal.aborted) {
          setC(fresh);
          setRows(normalizePage<Recipient>(list));
          setError("");
        }
      } catch (e: any) {
        if (!controller.signal.aborted) setError(e.message);
      } finally {
        running = false;
      }
    };
    void load();
    if (!c || active) timer = setInterval(load, 5000);
    document.addEventListener("visibilitychange", load);
    return () => {
      controller.abort();
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, [id, page, filter, c?.state]);
  const act = async (action: string) => {
    setBusy(true);
    try {
      const result = await campaignRequest<Campaign>(
        "post",
        `/${id}/${action}`,
      );
      if (action === "duplicate") router.push(`/campaigns/${result._id}/edit`);
      else setC(result);
      toast.success(
        action === "retry-failed"
          ? "Eligible failures prepared; resume to continue"
          : "Campaign updated",
      );
    } catch (e: any) {
      toast.error(e.message);
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (!c)
    return (
      <section className="p-8">
        {error ? (
          <Alert type="error" message={error} />
        ) : (
          <Spin tip="Loading campaign…" />
        )}
      </section>
    );
  const s = c.summary || {},
    total = s.total || 0,
    excluded = s.excluded || 0,
    pending = (s.pending || 0) + (s.processing || 0),
    finished = Math.max(0, total - excluded - pending),
    eligible = total - excluded;
  return (
    <section className="p-4 md:p-8 max-w-[1600px] mx-auto min-w-0 w-full">
      <Link href="/campaigns" className="text-blue-600">
        ← Campaigns
      </Link>
      <div className="flex flex-wrap gap-4 justify-between mt-3 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800 break-words">
            {c.name}
          </h1>
          <Tag
            className="mt-2"
            color={
              c.state === "running"
                ? "blue"
                : c.state === "paused"
                  ? "orange"
                  : "default"
            }
          >
            {c.state}
          </Tag>
        </div>
        <div className="flex flex-wrap gap-2">
          {c.state === "draft" && (
            <Link href={`/campaigns/${id}/edit`}>
              <Button type="primary" className="bg-blue-600">
                Edit draft
              </Button>
            </Link>
          )}
          {["running", "scheduled"].includes(c.state) && (
            <Button loading={busy} onClick={() => void act("pause")}>
              Pause
            </Button>
          )}
          {c.state === "paused" && (
            <Button onClick={() => setEditingPool(sendingConfig(c))}>
              Edit sending configuration
            </Button>
          )}
          {c.state === "paused" && (
            <Button
              type="primary"
              className="bg-blue-600"
              loading={busy}
              onClick={() => void act("resume")}
            >
              Resume
            </Button>
          )}
          {["running", "scheduled", "paused"].includes(c.state) && (
            <Popconfirm
              title="Cancel all unsent work permanently?"
              description="In-flight messages cannot be recalled."
              onConfirm={() => act("cancel")}
            >
              <Button danger loading={busy}>
                Cancel
              </Button>
            </Popconfirm>
          )}
          {["paused", "completed"].includes(c.state) && (
            <Button loading={busy} onClick={() => void act("retry-failed")}>
              Retry eligible failures
            </Button>
          )}
          <Button loading={busy} onClick={() => void act("duplicate")}>
            Duplicate
          </Button>
          <Button
            onClick={() =>
              downloadOutcomes(id).catch((e) => toast.error(e.message))
            }
          >
            Export outcomes
          </Button>
        </div>
      </div>
      {error && <Alert type="error" message={error} className="mb-4" />}
      {c.pauseReason && (
        <Alert
          type="warning"
          showIcon
          message={c.pauseReason}
          className="mb-4"
        />
      )}
      {c.waitReason && c.state === "running" && (
        <Alert type="info" message={c.waitReason} className="mb-4" />
      )}
      <Modal
        width={900}
        title="Update paused campaign senders"
        open={!!editingPool}
        onCancel={() => setEditingPool(undefined)}
        confirmLoading={busy}
        onOk={async () => {
          setBusy(true);
          try {
            setC(
              await campaignRequest<Campaign>("patch", `/${id}/sender-pool`, {
                ...editingPool,
                revision: c.revision,
              }),
            );
            setEditingPool(undefined);
          } catch (e: any) {
            setError(e.message);
            toast.error(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Alert
          type="info"
          className="mb-4"
          message="Wait for in-flight bundles to finish. Started recipients retain their original sender even if it is removed. Already submitted messages cannot be recalled."
        />
        <SendingSettings
          value={editingPool}
          onChange={setEditingPool}
          showRate
        />
      </Modal>
      {!!c.deviceStatuses?.length && (
        <div className="bg-white rounded-xl border p-4 mb-5">
          <p className="mb-3">
            Rotation: {c.rotation} · Rate: {c.quantity}/{c.period}{" "}
            {c.rateMode === "per_device" ? "per device" : "overall"} ·
            Configuration {c.configurationVersion}
          </p>
          <Table
            size="small"
            pagination={false}
            rowKey="generation"
            scroll={{ x: 900 }}
            dataSource={c.deviceStatuses}
            columns={[
              { title: "Sender", dataIndex: "deviceId" },
              {
                title: "Connection",
                render: (_, d) => (d.connected ? "Connected" : "Unavailable"),
              },
              {
                title: "Outcomes",
                render: (_, d) =>
                  Object.entries(d.outcomes)
                    .map(([k, n]) => `${k}: ${n}`)
                    .join(" · ") || "None",
              },
              {
                title: "Daily use",
                render: (_, d) =>
                  `${d.used} / ${d.policy.dailyCap || "unlimited"} (${d.policy.timezone})`,
              },
              {
                title: "Availability",
                render: (_, d) =>
                  d.connected
                    ? d.reason
                      ? `${d.reason} · ${new Date(d.at).toLocaleString()}`
                      : "Ready"
                    : "Reconnect original device",
              },
              {
                title: "Daily reset",
                render: (_, d) =>
                  d.resetAt ? new Date(d.resetAt).toLocaleString() : "—",
              },
            ]}
          />
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {[
          ["Audience", eligible],
          ["Sent", s.sent || 0],
          ["Pending / processing", pending],
          [
            "Failures / partial / unknown",
            (s.failed || 0) + (s.partial_failed || 0) + (s.unknown || 0),
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
          >
            <p className="text-gray-500 text-sm">{label}</p>
            <p className="text-3xl font-semibold mt-2">{value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
        <Progress
          percent={eligible ? Math.round((finished / eligible) * 100) : 0}
        />
        <p className="text-sm text-gray-600">
          {finished} final execution outcomes of {eligible} recipients ·{" "}
          {excluded} excluded
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
          <p>
            Senders:{" "}
            {c.senderPool?.length
              ? c.senderPool.map((d) => d.deviceId).join(", ")
              : c.deviceId}
          </p>
          <p>Timezone: {c.timezone}</p>
          <p>
            Start:{" "}
            {c.startAt
              ? new Date(c.startAt).toLocaleString("en-GB", {
                  timeZone: c.timezone,
                })
              : "Draft"}
          </p>
          <p>
            Last activity:{" "}
            {c.lastActivityAt
              ? new Date(c.lastActivityAt).toLocaleString("en-GB", {
                  timeZone: c.timezone,
                })
              : "No submissions yet"}
          </p>
          <p>
            Next eligible:{" "}
            {active && c.nextEligibleAt
              ? new Date(c.nextEligibleAt).toLocaleString("en-GB", {
                  timeZone: c.timezone,
                })
              : "—"}
          </p>
          <p>
            Approximate remaining:{" "}
            {c.state === "running"
              ? c.senderPool?.length
                ? "See device availability; caps and shared traffic affect timing"
                : duration(Math.max(0, pending - 1) * (c.intervalMs || 0))
              : "—"}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Sent means accepted by the provider. Shared-device traffic,
          attachments, retries, and pauses can extend estimates. Unknown
          outcomes are never automatically resent.
        </p>
        {c.receipts && (
          <p className="text-xs text-gray-600 mt-2">
            Observed message-part receipts: {c.receipts.delivered} delivered ·{" "}
            {c.receipts.read} read. Receipt availability is not guaranteed.
          </p>
        )}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 min-w-0">
        <Select
          aria-label="Recipient outcome"
          className="w-52 mb-4"
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setPage(1);
          }}
          options={[
            "",
            "pending",
            "processing",
            "sent",
            "partial_failed",
            "failed",
            "unknown",
            "cancelled",
          ].map((value) => ({
            value,
            label: value || "All recipient outcomes",
          }))}
        />
        <Table
          rowKey="_id"
          dataSource={rows.items}
          scroll={{ x: 750 }}
          pagination={{
            current: page,
            total: rows.total,
            pageSize: 20,
            onChange: setPage,
          }}
          columns={[
            {
              title: "Sender",
              render: (_: unknown, r: Recipient) =>
                r.assignedDeviceId || "Not assigned",
            },
            {
              title: "Recipient",
              render: (_: unknown, r: Recipient) => r.phone || r.rawPhone,
            },
            {
              title: "Outcome",
              render: (_: unknown, r: Recipient) => (
                <Tag
                  color={
                    r.state === "sent"
                      ? "green"
                      : r.state === "unknown"
                        ? "orange"
                        : "default"
                  }
                >
                  {r.excluded ? "excluded" : r.state}
                </Tag>
              ),
            },
            {
              title: "Parts",
              render: (_: unknown, r: Recipient) => (
                <div>
                  {r.parts.map((p) => (
                    <p key={p.key} className="text-xs break-words">
                      {p.key}: {p.state}
                      {p.error ? ` · ${p.error}` : ""}
                    </p>
                  ))}
                </div>
              ),
            },
            {
              title: "Error",
              render: (_: unknown, r: Recipient) => {
                if (r.error) return friendlyError(r.errorCode, r.error);
                if (r.validationReason) return friendlyError(undefined, r.validationReason);
                return "—";
              },
            },
            {
              title: "Recovery",
              render: (_: unknown, r: Recipient) =>
                c.state === "paused" &&
                r.state === "pending" &&
                (r.firstSubmittedAt ||
                  r.parts.some((p) => p.state === "sent")) ? (
                  <Popconfirm
                    title="Stop all remaining parts for this recipient?"
                    description="Sent and unknown parts remain recorded and will not be resent."
                    onConfirm={async () => {
                      try {
                        setC(
                          await campaignRequest<Campaign>(
                            "post",
                            `/${id}/recipients/${r._id}/stop-remaining`,
                          ),
                        );
                        setRows(
                          normalizePage(
                            await campaignRequest<Page<Recipient>>(
                              "get",
                              `/${id}/recipients?page=${page}&state=${filter}`,
                            ),
                          ),
                        );
                      } catch (e: any) {
                        toast.error(e.message);
                      }
                    }}
                  >
                    <Button danger>Stop remaining parts</Button>
                  </Popconfirm>
                ) : (
                  "—"
                ),
            },
          ]}
        />
      </div>
    </section>
  );
}
