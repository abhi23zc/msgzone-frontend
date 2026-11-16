"use client";
import { useEffect, useState } from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Input,
  InputNumber,
  Modal,
  Popover,
  Select,
  Table,
} from "antd";
import { useAuth } from "@/context/AuthContext";
import {
  campaignRequest,
  SendingConfig,
  sendingConfig,
} from "@/services/campaigns";

function InfoTip({
  label,
  text,
  example,
}: {
  label: string;
  text: string;
  example?: string;
}) {
  return (
    <Popover
      trigger="click"
      placement="topLeft"
      content={
        <div className="max-w-xs text-sm leading-5">
          <p className="m-0">{text}</p>
          {example && (
            <p className="m-0 mt-2 text-gray-600">
              <span className="font-medium text-gray-800">Example:</span>{" "}
              {example}
            </p>
          )}
        </div>
      }
    >
      <button
        type="button"
        aria-label={`More information about ${label}`}
        className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <InfoCircleOutlined className="text-[14px]" />
      </button>
    </Popover>
  );
}

function FieldLabel({
  label,
  info,
  example,
  htmlFor,
}: {
  label: string;
  info: string;
  example?: string;
  htmlFor?: string;
}) {
  return (
    <div className="mb-1 flex items-center gap-1.5">
      {htmlFor ? <label htmlFor={htmlFor}>{label}</label> : <span>{label}</span>}
      <InfoTip label={label} text={info} example={example} />
    </div>
  );
}

type Policy = {
  revision: number;
  quantity: number | null;
  period: string;
  cooldownEvery: number | null;
  cooldownMs: number | null;
  dailyCap: number | null;
  timezone: string;
};
export default function SendingSettings({
  value = sendingConfig(),
  onChange,
  showRate = false,
  limitsOnly = false,
}: {
  value?: SendingConfig;
  onChange?: (v: SendingConfig) => void;
  showRate?: boolean;
  limitsOnly?: boolean;
}) {
  const { user } = useAuth();
  const [device, setDevice] = useState(""),
    [policy, setPolicy] = useState<Policy>(),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [enabled, setEnabled] = useState(false);
  const update = (change: Partial<SendingConfig>) =>
    onChange?.({ ...value, ...change });
  const devices: any[] = user?.data?.user?.devices || [];
  useEffect(() => {
    if (!limitsOnly)
      campaignRequest<{ multiDeviceEnabled: boolean }>("get", "/config")
        .then((c) => setEnabled(c.multiDeviceEnabled))
        .catch(() => {});
  }, [limitsOnly]);
  const editPolicy = async (id: string) => {
    setDevice(id);
    setPolicy(undefined);
    setError("");
    try {
      setPolicy(
        await campaignRequest<Policy>(
          "get",
          `/device-policies/${encodeURIComponent(id)}`,
        ),
      );
    } catch (e: any) {
      setError(e.message);
    }
  };
  return (
    <div className="space-y-4">
      {!limitsOnly && (
        <>
          {!enabled && (
            <Alert
              type="info"
              message="Multi-device launches are disabled by the server feature flag. Existing campaigns remain manageable."
            />
          )}
          <div>
            <FieldLabel
              label="Sending devices, in rotation order"
              info="Choose the connected WhatsApp devices that can send this campaign. Their order is used by round-robin and batch rotation. You can select up to 50 devices."
              example="Devices A, B, C in that order start A → B → C → A in round-robin."
            />
            <Select
              mode="multiple"
              showSearch
              className="w-full"
              aria-label="Sending devices"
              value={value.senderPool.map((d) => d.deviceId)}
              placeholder="Select connected WhatsApp devices"
              onChange={(ids) =>
                update({
                  senderPool: ids.map(
                    (id: string) =>
                      value.senderPool.find((d) => d.deviceId === id) || {
                        deviceId: id,
                        weight: 1,
                      },
                  ),
                })
              }
              options={Array.from(
                new Set([
                  ...devices.map((d) => d.deviceId),
                  ...value.senderPool.map((d) => d.deviceId),
                ]),
              ).map((id) => {
                const d = devices.find((d) => d.deviceId === id);
                return {
                  value: id,
                  label: `${id}${d?.number ? ` · +${d.number}` : ""} · ${d?.status || "unavailable"}`,
                  disabled:
                    !value.senderPool.some((s) => s.deviceId === id) &&
                    (d?.status !== "connected" ||
                      d?.lifecycle === "deleting" ||
                      (!enabled && value.senderPool.length >= 1)),
                };
              })}
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div>
              <FieldLabel
                label="Rotation mode"
                info="How the next recipient is chosen. One recipient per turn rotates device by device. Batches keeps one device for several contacts before switching. Weighted shares turns in proportion to each device's weight."
                example="With A, B, C: round-robin gives A, B, C, A…; batch size 5 gives A×5, B×5, C×5; weights 2:1 give A two turns for every B turn."
              />
              <Select
                aria-label="Rotation mode"
                className="w-48"
                value={value.rotation}
                onChange={(rotation) => update({ rotation })}
                options={[
                  { value: "round_robin", label: "One recipient per turn" },
                  { value: "batch", label: "Batches" },
                  { value: "weighted", label: "Weighted" },
                ]}
              />
            </div>
            {value.rotation === "batch" && (
              <div>
                <FieldLabel
                  label="Recipients per batch"
                  info="How many consecutive recipient bundles one device sends before the rotation moves to the next device. Used only in Batches mode."
                  example="A batch size of 5 means one device sends 5 contacts before the next device takes over."
                />
                <InputNumber
                  aria-label="Recipients per batch"
                  min={1}
                  max={10000}
                  precision={0}
                  value={value.batchSize}
                  onChange={(n) => update({ batchSize: n || 1 })}
                />
              </div>
            )}
            <div>
              <FieldLabel
                label="Rate applies to"
                info="Entire campaign shares one send rate across all selected devices. Adding more devices spreads the same rate; it does not increase total throughput."
                example="60 contacts/hour with 3 devices is 60/hour total, not 180/hour."
              />
              <Select
                aria-label="Rate mode"
                className="w-48"
                value={value.rateMode}
                onChange={(rateMode) => update({ rateMode })}
                options={[
                  { value: "overall", label: "Entire campaign" },
                ]}
              />
            </div>
            <div>
              <FieldLabel
                label="Device disconnects"
                info="Continue on healthy devices skips an offline device and keeps sending on the rest. Pause whole campaign stops all sending as soon as any selected device goes offline."
                example="If A is offline and B is online, Continue keeps B sending; Pause stops the campaign until A returns."
              />
              <Select
                aria-label="Disconnect policy"
                className="w-60"
                value={value.disconnectPolicy}
                onChange={(disconnectPolicy) => update({ disconnectPolicy })}
                options={[
                  { value: "continue", label: "Continue on healthy devices" },
                  { value: "pause", label: "Pause whole campaign" },
                ]}
              />
            </div>
          </div>
          {showRate && (
            <div className="flex gap-3">
              <div>
                <FieldLabel
                  label="Contacts per period"
                  info="Maximum contacts in the selected period. With Entire campaign this is shared across devices; with Each selected device every device gets this rate. The server enforces a minimum of 2 seconds per contact."
                  example="10 per hour means one contact every 6 minutes."
                />
                <InputNumber
                  aria-label="Contacts per period"
                  min={1}
                  precision={0}
                  value={value.quantity}
                  onChange={(n) => update({ quantity: n || 1 })}
                />
              </div>
              <div>
                <FieldLabel
                  label="Period"
                  info="Time window for the send rate. A day means 24 hours."
                  example="1 contact per day means one contact every 24 hours."
                />
                <Select
                  aria-label="Rate period"
                  value={value.period}
                  className="w-32"
                  onChange={(period) => update({ period })}
                  options={["minute", "hour", "day"].map((value) => ({
                    value,
                    label: value,
                  }))}
                />
              </div>
            </div>
          )}
          {!!value.senderPool.length && (
            <Table
              size="small"
              rowKey="deviceId"
              pagination={false}
              dataSource={value.senderPool}
              scroll={{ x: 550 }}
              columns={[
                { title: "Device", dataIndex: "deviceId" },
                ...(value.rotation === "weighted"
                  ? [
                      {
                        title: (
                          <span className="inline-flex items-center gap-1">
                            Weight
                            <InfoTip
                              label="Weight"
                              text="Relative share of turns in Weighted mode. A device with weight 2 gets twice as many turns as weight 1. Use whole numbers from 1 to 100."
                              example="Weights 2 and 1 give the first device two turns for every one turn of the second."
                            />
                          </span>
                        ),
                        render: (
                          _: unknown,
                          d: SendingConfig["senderPool"][number],
                        ) => (
                          <InputNumber
                            aria-label={`Weight ${d.deviceId}`}
                            min={1}
                            max={100}
                            precision={0}
                            value={d.weight}
                            onChange={(n) =>
                              update({
                                senderPool: value.senderPool.map((s) =>
                                  s.deviceId === d.deviceId
                                    ? { ...s, weight: n || 1 }
                                    : s,
                                ),
                              })
                            }
                          />
                        ),
                      },
                    ]
                  : []),
                {
                  title: "Order",
                  render: (_: unknown, d) => (
                    <Button
                      disabled={value.senderPool[0].deviceId === d.deviceId}
                      onClick={() => {
                        const pool = [...value.senderPool],
                          i = pool.findIndex((s) => s.deviceId === d.deviceId);
                        [pool[i - 1], pool[i]] = [pool[i], pool[i - 1]];
                        update({ senderPool: pool });
                      }}
                    >
                      Move up
                    </Button>
                  ),
                },
                {
                  title: (
                    <span className="inline-flex items-center gap-1">
                      Shared campaign limits
                      <InfoTip
                        label="Shared campaign limits"
                        text="These limits apply to the device across all campaigns. Quick/API sends do not consume them."
                        example="A 200/day cap applies to every campaign using this device, not just this one."
                      />
                    </span>
                  ),
                  render: (_: unknown, d) => (
                    <Button onClick={() => void editPolicy(d.deviceId)}>
                      Configure limits
                    </Button>
                  ),
                },
              ]}
            />
          )}
          <p className="text-sm text-gray-500">
            Each recipient’s text and attachments stay on one device. Rates are
            targets subject to shared limits. If every device is offline,
            reconnect and explicitly resume. Recreated devices do not inherit
            old work.
          </p>
        </>
      )}
      {limitsOnly && (
        <Button onClick={() => void editPolicy(value.senderPool[0].deviceId)}>
          Campaign limits
        </Button>
      )}
      <Modal
        title={`Campaign limits · ${device}`}
        open={!!device}
        onCancel={() => setDevice("")}
        confirmLoading={busy}
        okButtonProps={{ disabled: !policy }}
        onOk={async () => {
          if (!policy) return;
          setBusy(true);
          setError("");
          try {
            await campaignRequest(
              "patch",
              `/device-policies/${encodeURIComponent(device)}`,
              policy,
            );
            setDevice("");
          } catch (e: any) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Alert
          type="warning"
          className="mb-4"
          message="These settings affect all campaigns using this device. Quick/API sends do not consume these limits. Already started bundles may finish."
        />
        {error && <Alert type="error" message={error} />}
        {policy && (
          <div className="space-y-3">
            <div>
              <FieldLabel
                htmlFor="policy-quantity"
                label="Maximum contacts per period (empty = no additional limit)"
                info="A speed cap for this device. The server spaces contacts evenly: period ÷ quantity, with a minimum of 2 seconds per contact. Leave empty for no extra device limit."
                example="10 per hour means one contact every 6 minutes on this device."
              />
              <InputNumber
                id="policy-quantity"
                className="w-full"
                min={1}
                precision={0}
                value={policy.quantity}
                onChange={(quantity) => setPolicy({ ...policy, quantity })}
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="policy-period"
                label="Period"
                info="Time window for the device speed cap. A day means 24 hours."
                example="30 per minute lets this device send at most one contact every 2 seconds."
              />
              <Select
                id="policy-period"
                className="w-full"
                value={policy.period}
                onChange={(period) => setPolicy({ ...policy, period })}
                options={["minute", "hour", "day"].map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="policy-cooldown-every"
                label="Break after this many contacts"
                info="After this many contacts on this device, it pauses for the break duration. Counts recipient bundles, not individual messages. Set both break fields together."
                example="Break after 50 contacts means 50 sends, then a pause, then 50 more sends."
              />
              <InputNumber
                id="policy-cooldown-every"
                className="w-full"
                min={1}
                precision={0}
                value={policy.cooldownEvery}
                onChange={(cooldownEvery) =>
                  setPolicy({ ...policy, cooldownEvery })
                }
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="policy-cooldown-seconds"
                label="Break duration (seconds)"
                info="How long the device pauses after reaching the break threshold. Maximum 30 days. Set both break fields together."
                example="60 seconds pauses this device for one minute after each break threshold."
              />
              <InputNumber
                id="policy-cooldown-seconds"
                className="w-full"
                min={1}
                precision={0}
                value={policy.cooldownMs ? policy.cooldownMs / 1000 : null}
                onChange={(n) =>
                  setPolicy({ ...policy, cooldownMs: n ? n * 1000 : null })
                }
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="policy-daily-cap"
                label="Daily contact cap (empty = unlimited)"
                info="Maximum contacts this device may start per local day across all campaigns. When reached, it waits until the next local midnight. Leave empty for unlimited."
                example="A cap of 200 means the device stops after 200 contacts that day and resumes at local midnight."
              />
              <InputNumber
                id="policy-daily-cap"
                className="w-full"
                min={1}
                precision={0}
                value={policy.dailyCap}
                onChange={(dailyCap) => setPolicy({ ...policy, dailyCap })}
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="policy-timezone"
                label="Daily reset timezone"
                info="Timezone that defines when the daily contact cap resets. This is separate from the campaign's display timezone."
                example="Asia/Kolkata resets the daily cap at midnight India time, not UTC."
              />
              <Input
                id="policy-timezone"
                value={policy.timezone}
                onChange={(e) =>
                  setPolicy({ ...policy, timezone: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
