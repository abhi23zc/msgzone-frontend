"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Button,
  Form,
  Input,
  Select,
  Steps,
  Table,
  Tag,
  Upload,
  InputNumber,
  Switch,
  Modal,
  Popconfirm,
  Spin,
} from "antd";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Campaign,
  Recipient,
  Page,
  ImportData,
  Preview,
  campaignRequest,
  duration,
  downloadOutcomes,
  emptyPage,
  normalizePage,
  sendingConfig,
  SendingPreview,
} from "@/services/campaigns";
import MessagePreview from "./MessagePreview";
import SendingSettings from "./SendingSettings";
const periods = { minute: 60000, hour: 3600000, day: 86400000 };
const phoneKeys = new Set([
  "phone",
  "phone_number",
  "phone_no",
  "phonenumber",
  "ph",
  "mobile",
  "mobile_number",
  "mobile_no",
  "mobilenumber",
  "number",
  "contact",
  "contact_number",
  "contact_no",
  "whatsapp",
  "whatsapp_number",
  "whatsapp_no",
  "wa_number",
  "tel",
  "telephone",
  "cell",
  "msisdn",
]);
function detectPhoneColumn(
  headers: ImportData["headers"],
  rows: ImportData["rows"] = [],
) {
  const exact = headers.findIndex((h) => phoneKeys.has(h.suggestedKey));
  if (exact >= 0) return exact;
  const partial = headers.findIndex((h) =>
    /phone|mobile|whatsapp|msisdn/.test(h.suggestedKey),
  );
  if (partial >= 0) return partial;
  const sample = rows.slice(0, 20);
  if (!sample.length) return 0;
  const score = (index: number) =>
    sample.filter((row) =>
      /^\+?[0-9]{7,15}$/.test(
        String(row.cells[index] ?? "").replace(/[\s\-().]/g, ""),
      ),
    ).length;
  const best = headers.reduce(
    (top, _, i) => (score(i) > score(top) ? i : top),
    0,
  );
  return score(best) >= Math.ceil(sample.length / 2) ? best : 0;
}
function defaultMapping(headers: ImportData["headers"], phoneColumn: number) {
  const used = new Set<string>();
  const mapping: Record<string, string> = {};
  headers.forEach((h, i) => {
    if (i === phoneColumn) return;
    let key = h.suggestedKey || `field_${i + 1}`;
    if (used.has(key)) {
      let suffix = 2;
      while (used.has(`${key}_${suffix}`)) suffix++;
      key = `${key}_${suffix}`;
    }
    used.add(key);
    mapping[h.id] = key;
  });
  return mapping;
}
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
export default function CampaignEditor({ id }: { id?: string }) {
  const router = useRouter(),
    { user } = useAuth();
  const [form] = Form.useForm();
  const [campaign, setCampaign] = useState<Campaign>(),
    [step, setStep] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [rows, setRows] = useState<Page<Recipient>>(emptyPage()),
    [imported, setImported] = useState<ImportData>(),
    [phoneColumn, setPhoneColumn] = useState(0),
    [mapping, setMapping] = useState<Record<string, string>>({}),
    [paste, setPaste] = useState(""),
    [preview, setPreview] = useState<Preview>(),
    [previewError, setPreviewError] = useState(""),
    [selected, setSelected] = useState(0),
    [picked, setPicked] = useState<string[]>([]),
    [schedule, setSchedule] = useState(""),
    [testNumber, setTestNumber] = useState(""),
    [testId, setTestId] = useState(""),
    [editing, setEditing] = useState<Recipient>();
  const [countries, setCountries] = useState([
    "IN",
    "US",
    "GB",
    "AE",
    "AU",
    "SG",
    "CA",
  ]);
  const [sendingPreview, setSendingPreview] = useState<SendingPreview>(),
    [sendingError, setSendingError] = useState("");
  const launchKey = useRef("");
  const creating = useRef(false);
  const values = Form.useWatch([], form) || {};
  useEffect(() => {
    campaignRequest<{ countries: string[] }>("get", "/config")
      .then((config) => setCountries(config.countries))
      .catch(() => {});
  }, []);
  const refresh = async (c = campaign, page = rows.page) => {
    if (!c) return;
    const [fresh, list] = await Promise.all([
      campaignRequest<Campaign>("get", `/${c._id}`),
      campaignRequest<Page<Recipient>>(
        "get",
        `/${c._id}/recipients?page=${page}`,
      ),
    ]);
    setCampaign(fresh);
    setRows(normalizePage<Recipient>(list));
    return fresh;
  };
  useEffect(() => {
    let alive = true;
    if (creating.current) return;
    creating.current = true;
    (async () => {
      try {
        const c = id
          ? await campaignRequest<Campaign>("get", `/${id}`)
          : await campaignRequest<Campaign>("post", "", {
              name: "Untitled campaign",
            });
        if (!alive) return;
        if (c.state !== "draft") {
          router.replace(`/campaigns/${c._id}`);
          return;
        }
        setCampaign(c);
        form.setFieldsValue({ ...c, sending: sendingConfig(c) });
        await refresh(c, 1);
        if (!id)
          window.history.replaceState(null, "", `/campaigns/${c._id}/edit`);
      } catch (e: any) {
        if (alive) setError(e.message);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);
  const action = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e: any) {
      const message = e.message || "Something went wrong";
      setError(message);
      toast.error(message, { duration: 8000 });
    } finally {
      setBusy(false);
    }
  };
  const bulkRecipients = (kind: "exclude" | "include" | "remove") =>
    void action(async () => {
      if (!campaign || !picked.length) return;
      const count = picked.length;
      const c = await campaignRequest<Campaign>(
        "post",
        `/${campaign._id}/recipients/bulk`,
        { revision: campaign.revision, action: kind, ids: picked },
      );
      setPicked([]);
      const pageCleared = rows.items.every((r) => picked.includes(r._id));
      await refresh(c, pageCleared ? 1 : rows.page);
      toast.success(
        `${count} contact${count === 1 ? "" : "s"} ${
          kind === "remove"
            ? "removed"
            : kind === "exclude"
              ? "excluded"
              : "included"
        }`,
      );
    });
  const save = async () => {
    if (!campaign) throw new Error("Draft is loading");
    await form.validateFields();
    const fields = form.getFieldsValue(true);
    const c = await campaignRequest<Campaign>("patch", `/${campaign._id}`, {
      ...fields,
      ...fields.sending,
      quantity: fields.quantity,
      period: fields.period,
      assets: fields.assets || campaign.assets,
      revision: campaign.revision,
    });
    setCampaign(c);
    return c;
  };
  useEffect(() => {
    if (!campaign || step !== 3) return;
    let alive = true;
    const timer = setTimeout(() => {
      setSendingPreview(undefined);
      campaignRequest<SendingPreview>(
        "post",
        `/${campaign._id}/sending-preview`,
        {
          ...(values.sending || sendingConfig(campaign)),
          quantity: values.quantity || campaign.quantity,
          period: values.period || campaign.period,
          template: values.template ?? campaign.template,
          assets: values.assets ?? campaign.assets,
          localTime: schedule || undefined,
          timezone: values.timezone || campaign.timezone,
        },
      )
        .then((p) => {
          if (alive) {
            setSendingPreview(p);
            setSendingError("");
          }
        })
        .catch((e) => {
          if (alive) setSendingError(e.message);
        });
    }, 350);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [
    campaign?._id,
    step,
    values.sending,
    values.quantity,
    values.period,
    values.template,
    values.assets,
    schedule,
    values.timezone,
    rows.total,
    campaign?.revision,
  ]);
  useEffect(() => {
    if (!campaign) return;
    let alive = true;
    const t = setTimeout(async () => {
      try {
        const r = rows.items[selected];
        const p = await campaignRequest<Preview>(
          "post",
          `/${campaign._id}/preview`,
          {
            recipientId: r?._id,
            template: values.template ?? campaign.template,
            fallbacks: values.fallbacks ?? campaign.fallbacks,
            assets: values.assets ?? campaign.assets,
          },
        );
        if (alive) {
          setPreview(p);
          setPreviewError("");
        }
      } catch (e: any) {
        if (alive) {
          setPreview(undefined);
          setPreviewError(e.message);
        }
      }
    }, 350);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [
    campaign?._id,
    rows.items,
    selected,
    values.template,
    values.fallbacks,
    values.assets,
  ]);
  const variables = Array.from(
    new Set(
      (
        (values.template || "") +
        " " +
        (values.assets || campaign?.assets || [])
          .map((a: any) => a.caption)
          .join(" ")
      ).match(/\{\{[a-z][a-z0-9_]*\}\}/g) || [],
    ),
  ) as string[];
  const chips = Array.from(
    new Set([
      ...Object.values(campaign?.mapping || {}),
      ...rows.items.flatMap((r) => Object.keys(r.variables || {})),
    ]),
  );
  const interval =
    periods[(values.period || "minute") as keyof typeof periods] /
    Number(values.quantity || 10);
  const audience = rows.total - (campaign?.summary?.excluded || 0);
  if (!campaign)
    return (
      <section className="p-8">
        {error ? (
          <Alert type="error" message={error} />
        ) : (
          <Spin tip="Loading draft…" />
        )}
      </section>
    );
  return (
    <section className="p-4 md:p-8 max-w-[1500px] mx-auto w-full min-w-0">
      <Link href="/campaigns" className="text-blue-600">
        ← Campaigns
      </Link>
      <h1 className="text-3xl font-semibold text-gray-800 mt-3 mb-6">
        {id ? "Edit campaign" : "Create campaign"}
      </h1>
      <Steps
        current={step}
        size="small"
        className="mb-6"
        items={["Details", "Audience", "Message", "Review & Schedule"].map(
          (title) => ({ title }),
        )}
      />
      {error && (
        <Alert type="error" showIcon message={error} className="mb-4" />
      )}
      <Form
        form={form}
        layout="vertical"
        preserve
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6 min-w-0"
      >
        <div style={{ display: step === 0 ? "block" : "none" }}>
          <Form.Item
            name="name"
            label="Campaign name"
            rules={[{ required: true, message: "Enter a campaign name" }]}
          >
            <Input maxLength={150} />
          </Form.Item>
          <Form.Item
            name="sending"
            label="WhatsApp sending configuration"
            rules={[
              {
                validator: (_, v) =>
                  v?.senderPool?.length
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("Select a connected sending device"),
                      ),
              },
            ]}
          >
            <SendingSettings />
          </Form.Item>
          <Form.Item
            name="defaultCountry"
            label="Default phone country"
            className="mt-4"
          >
            <Select
              showSearch
              options={countries
                .map((value) => ({
                  value,
                  label:
                    new Intl.DisplayNames(["en"], { type: "region" }).of(
                      value,
                    ) || value,
                }))
                .sort((a, b) => a.label.localeCompare(b.label))}
            />
          </Form.Item>
        </div>
        <div style={{ display: step === 1 ? "block" : "none" }}>
          <h2 className="text-xl font-semibold mb-3">Audience</h2>
          <p className="text-gray-500 mb-3">
            Choose a phone column after import. International numbers starting
            with + are preserved.
          </p>
          {error && (
            <Alert type="error" showIcon message={error} className="mb-3" />
          )}
          <Upload
            accept=".xlsx,.xls,.csv"
            showUploadList={false}
            disabled={busy}
            beforeUpload={(file) => {
              void action(async () => {
                const c = await save();
                const data = new FormData();
                data.append("file", file);
                const result = await campaignRequest<ImportData>(
                  "post",
                  `/${c._id}/import`,
                  data,
                );
                setImported(result);
                const phone = detectPhoneColumn(result.headers, result.rows);
                setPhoneColumn(phone);
                setMapping(defaultMapping(result.headers, phone));
              });
              return false;
            }}
          >
            <Button>Upload Excel or CSV</Button>
          </Upload>
          {imported && (
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="mb-3">
                {imported.rows.length} uploaded rows. Map columns before adding
                them.
              </p>
              <label className="block mb-2">Phone-number column</label>
              <Select
                className="w-full mb-1"
                value={phoneColumn}
                onChange={(next) => {
                  setPhoneColumn(next);
                  if (!imported) return;
                  const defaults = defaultMapping(imported.headers, next);
                  setMapping((current) => {
                    const merged: Record<string, string> = { ...defaults };
                    Object.keys(defaults).forEach((key) => {
                      if (current[key]) merged[key] = current[key];
                    });
                    return merged;
                  });
                }}
                options={imported.headers.map((h, i) => ({
                  value: i,
                  label: h.label,
                }))}
              />
              <p className="text-xs text-gray-500 mb-3">
                The column that looks like a phone number is selected
                automatically. Change it if the detected column is wrong.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {imported.headers
                  .filter((_, i) => i !== phoneColumn)
                  .map((h) => (
                    <label key={h.id} className="text-sm">
                      {h.label}
                      <Input
                        placeholder={`Variable key, e.g. ${h.suggestedKey}`}
                        value={mapping[h.id] || ""}
                        onChange={(e) =>
                          setMapping({ ...mapping, [h.id]: e.target.value })
                        }
                      />
                    </label>
                  ))}
              </div>
              <div className="overflow-x-auto mt-3">
                <Table
                  size="small"
                  pagination={false}
                  dataSource={imported.rows
                    .slice(0, 3)
                    .map((r, i) => ({ ...r, key: i }))}
                  columns={imported.headers.map((h, i) => ({
                    title: h.label,
                    render: (_: unknown, r: any) => r.cells[i],
                  }))}
                  scroll={{ x: 500 }}
                />
              </div>
              <Button
                className="mt-3"
                loading={busy}
                onClick={() =>
                  void action(async () => {
                    const c = await campaignRequest<Campaign>(
                      "post",
                      `/${campaign._id}/audience`,
                      {
                        revision: campaign.revision,
                        rows: imported.rows,
                        phoneColumn,
                        mapping,
                      },
                    );
                    const updated = await campaignRequest<Campaign>(
                      "patch",
                      `/${c._id}`,
                      { revision: c.revision, mapping },
                    );
                    setCampaign(updated);
                    form.setFieldValue("mapping", mapping);
                    setImported(undefined);
                    await refresh(updated, 1);
                  })
                }
              >
                Add mapped contacts
              </Button>
            </div>
          )}
          <label className="block mt-5 mb-2">
            Or paste phone numbers, separated by commas, semicolons, or new
            lines
          </label>
          <Input.TextArea
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={3}
            placeholder="+919876543210"
          />
          <Button
            className="mt-2"
            disabled={!paste.trim()}
            loading={busy}
            onClick={() =>
              void action(async () => {
                const c = await save();
                const fresh = await campaignRequest<Campaign>(
                  "post",
                  `/${c._id}/audience`,
                  {
                    revision: c.revision,
                    rows: paste
                      .split(/[,;\n]+/)
                      .filter((s) => s.trim())
                      .map((rawPhone) => ({
                        rawPhone: rawPhone.trim(),
                        variables: {},
                      })),
                  },
                );
                setPaste("");
                await refresh(fresh, 1);
              })
            }
          >
            Add numbers
          </Button>
          <div className="flex flex-wrap gap-2 mt-4 mb-3">
            <Tag>Uploaded: {rows.total}</Tag>
            {Object.entries(campaign.validationCounts || {}).map(
              ([key, count]) => (
                <Tag key={key} color={key === "valid" ? "green" : "orange"}>
                  {key}: {count}
                </Tag>
              ),
            )}
          </div>
          {picked.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
              <span className="text-sm font-medium">
                {picked.length} selected
              </span>
              <Button
                size="small"
                disabled={busy}
                onClick={() => bulkRecipients("exclude")}
              >
                Exclude
              </Button>
              <Button
                size="small"
                disabled={busy}
                onClick={() => bulkRecipients("include")}
              >
                Include
              </Button>
              <Popconfirm
                title={`Remove ${picked.length} contact${
                  picked.length === 1 ? "" : "s"
                }?`}
                description="This cannot be undone."
                okText="Remove"
                okButtonProps={{ danger: true }}
                onConfirm={() => bulkRecipients("remove")}
              >
                <Button size="small" danger disabled={busy}>
                  Remove
                </Button>
              </Popconfirm>
              <Button
                size="small"
                type="text"
                onClick={() => setPicked([])}
              >
                Clear
              </Button>
            </div>
          )}
          <div className="min-w-0 overflow-hidden">
            <Table
              rowKey="_id"
              size="small"
              scroll={{ x: 700 }}
              dataSource={rows.items}
              rowSelection={{
                selectedRowKeys: picked,
                onChange: (keys) => setPicked(keys.map(String)),
              }}
              pagination={{
                current: rows.page,
                pageSize: 20,
                total: rows.total,
                onChange: (p) => {
                  setPicked([]);
                  void action(async () => {
                    await refresh(campaign, p);
                  });
                },
              }}
              columns={[
                {
                  title: "Phone",
                  render: (_: unknown, r: Recipient) => r.phone || r.rawPhone,
                },
                {
                  title: "Validation",
                  render: (_: unknown, r: Recipient) => (
                    <>
                      <Tag
                        color={r.validation === "valid" ? "green" : "orange"}
                      >
                        {r.excluded ? "excluded" : r.validation}
                      </Tag>
                      {r.validation !== "valid" && (
                        <p className="text-xs text-red-700">
                          {friendlyError(undefined, r.validationReason)}
                        </p>
                      )}
                      {r.error && (
                        <p className="text-xs text-red-700 mt-1">
                          <strong>Sending error: </strong>
                          {friendlyError(r.errorCode, r.error)}
                        </p>
                      )}
                    </>
                  ),
                },
                {
                  title: "Variables",
                  render: (_: unknown, r: Recipient) =>
                    JSON.stringify(r.variables),
                },
                {
                  title: "Actions",
                  render: (_: unknown, r: Recipient) => (
                    <div className="flex gap-2">
                      <Button size="small" onClick={() => setEditing(r)}>
                        Edit
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          void action(async () => {
                            const c = await campaignRequest<Campaign>(
                              "patch",
                              `/${campaign._id}/recipients/${r._id}`,
                              {
                                revision: campaign.revision,
                                excluded: !r.excluded,
                              },
                            );
                            await refresh(c);
                          })
                        }
                      >
                        {r.excluded ? "Include" : "Exclude"}
                      </Button>
                      <Button
                        size="small"
                        danger
                        onClick={() =>
                          void action(async () => {
                            const c = await campaignRequest<Campaign>(
                              "delete",
                              `/${campaign._id}/recipients/${r._id}`,
                              { revision: campaign.revision },
                            );
                            await refresh(c);
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </div>
          <Button
            onClick={() => void action(() => downloadOutcomes(campaign._id))}
          >
            Download validation report
          </Button>
        </div>
        <div
          style={{ display: step === 2 ? "block" : "none" }}
          className="min-w-0"
        >
          <div className="flex flex-col lg:flex-row gap-6 min-w-0">
            <div className="flex-1 min-w-0">
              <Form.Item
                name="template"
                label="Message"
                htmlFor="campaign-message"
              >
                <Input.TextArea
                  id="campaign-message"
                  autoSize={{ minRows: 6, maxRows: 14 }}
                  placeholder="Hello {{name}}!"
                />
              </Form.Item>
              <p className="text-xs text-gray-500 mb-3">
                WhatsApp formatting: *bold*, _italic_, ~strikethrough~. Values
                from your sheet are treated as text.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {chips.map((key) => (
                  <Button
                    key={key}
                    size="small"
                    onClick={() => {
                      const input = document.getElementById(
                        "campaign-message",
                      ) as HTMLTextAreaElement | null;
                      const text = form.getFieldValue("template") || "",
                        at = input?.selectionStart ?? text.length;
                      form.setFieldValue(
                        "template",
                        text.slice(0, at) + `{{${key}}}` + text.slice(at),
                      );
                    }}
                  >{`{{${key}}}`}</Button>
                ))}
              </div>
              {variables.map((token) => {
                const key = token.slice(2, -2);
                return (
                  <Form.Item
                    key={key}
                    name={["fallbacks", key]}
                    label={`Fallback for ${token} (optional)`}
                  >
                    <Input placeholder="Used only when this recipient has no value" />
                  </Form.Item>
                );
              })}
              <Upload
                accept=".jpg,.jpeg,.png,.pdf,.mp3,.mp4"
                disabled={busy}
                showUploadList={false}
                beforeUpload={(file) => {
                  void action(async () => {
                    const c = await save();
                    const data = new FormData();
                    data.append("file", file);
                    data.append("revision", String(c.revision));
                    const result = await campaignRequest<{
                      campaign: Campaign;
                    }>("post", `/${c._id}/assets`, data);
                    setCampaign(result.campaign);
                    form.setFieldValue("assets", result.campaign.assets);
                  });
                  return false;
                }}
              >
                <Button>Add attachment</Button>
              </Upload>
              <p className="text-xs text-gray-500 mt-2">
                JPG, PNG, PDF, MP3, MP4 · up to 5 MiB each · maximum 10 files
              </p>
              {(values.assets || campaign.assets).map((a: any, i: number) => (
                <div
                  key={a.assetId}
                  className="mt-3 p-3 rounded-lg border border-gray-100"
                >
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/campaigns/assets/${a.assetId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600"
                  >
                    Attachment {i + 1}
                  </a>
                  <Form.Item name={["assets", i, "assetId"]} hidden>
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name={["assets", i, "caption"]}
                    label="Caption"
                    className="mt-2"
                  >
                    <Input.TextArea placeholder="Optional caption with {{variables}}" />
                  </Form.Item>
                  <Button
                    danger
                    size="small"
                    onClick={() =>
                      void action(async () => {
                        const c = await campaignRequest<Campaign>(
                          "delete",
                          `/${campaign._id}/assets/${a.assetId}`,
                          { revision: campaign.revision },
                        );
                        setCampaign(c);
                        form.setFieldValue("assets", c.assets);
                      })
                    }
                  >
                    Remove attachment
                  </Button>
                </div>
              ))}
            </div>
            <div>
              <MessagePreview preview={preview} error={previewError} />
              <div className="flex justify-between items-center mt-3">
                <Button
                  size="small"
                  disabled={selected === 0}
                  onClick={() => setSelected((n) => n - 1)}
                >
                  Previous
                </Button>
                <span className="text-xs">
                  {rows.items.length ? selected + 1 : 0} / {rows.items.length}
                </span>
                <Button
                  size="small"
                  disabled={selected >= rows.items.length - 1}
                  onClick={() => setSelected((n) => n + 1)}
                >
                  Next
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Previewing this audience page.
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: step === 3 ? "block" : "none" }}>
          <h2 className="text-xl font-semibold mb-4">Review & Schedule</h2>
          <div className="flex flex-wrap gap-4">
            <Form.Item
              name="quantity"
              label="Contacts per period"
              rules={[{ required: true }]}
            >
              <InputNumber min={1} precision={0} />
            </Form.Item>
            <Form.Item name="period" label="Period">
              <Select
                className="w-32"
                options={["minute", "hour", "day"].map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </Form.Item>
          </div>
          <p className="mb-3 text-gray-600">
            One contact approximately every {duration(interval)}{" "}
            {values.sending?.rateMode === "per_device"
              ? "per selected device"
              : "across the campaign"}
            . A day means 24 hours. Device limits and shared traffic may reduce
            the effective rate.
          </p>
          {sendingError && (
            <Alert type="warning" message={sendingError} className="mb-3" />
          )}
          <Form.Item name="timezone" label="Display timezone" className="mt-4">
            <Input placeholder="Asia/Kolkata" />
          </Form.Item>
          <label className="block mb-2">
            Start time (optional, shown in selected timezone)
          </label>
          <Input
            type="datetime-local"
            aria-label="Scheduled start"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            className="max-w-sm"
          />
          <p className="text-sm text-gray-500 my-3">
            Leave empty to launch immediately. Timezone:{" "}
            {values.timezone || "Asia/Kolkata"}.
          </p>
          <p className="mb-4">
            Audience: {rows.total} rows. Invalid and duplicate rows must be
            corrected or explicitly excluded before launch.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <Input
              aria-label="Test recipient"
              placeholder="Explicit test recipient, e.g. +919876543210"
              value={testNumber}
              onChange={(e) => setTestNumber(e.target.value)}
              className="max-w-sm"
            />
            <Button
              disabled={!testNumber.trim()}
              loading={busy}
              onClick={() =>
                void action(async () => {
                  const c = await save();
                  const test = await campaignRequest<Campaign>(
                    "post",
                    `/${c._id}/test`,
                    {
                      number: testNumber,
                      variables: rows.items[selected]?.variables || {},
                    },
                  );
                  setTestId(test._id);
                  toast.success("Test queued");
                })
              }
            >
              Send test
            </Button>
          </div>
          {testId && (
            <Link
              className="block text-blue-600 mb-4"
              href={`/campaigns/${testId}`}
            >
              View test outcome
            </Link>
          )}
          <Button
            type="primary"
            className="bg-blue-600"
            loading={busy}
            onClick={() =>
              void action(async () => {
                const c = await save();
                let startAt;
                if (schedule) {
                  startAt = (
                    await campaignRequest<{ startAt: string }>(
                      "post",
                      `/${c._id}/schedule-preview`,
                      { localTime: schedule, timezone: c.timezone },
                    )
                  ).startAt;
                  if (!Number.isFinite(new Date(startAt).getTime()))
                    throw new Error("Invalid start time");
                }
                if (!launchKey.current) launchKey.current = crypto.randomUUID();
                const launched = await campaignRequest<Campaign>(
                  "post",
                  `/${c._id}/launch`,
                  { revision: c.revision, startAt },
                  { "Idempotency-Key": launchKey.current },
                );
                router.push(`/campaigns/${launched._id}`);
              })
            }
          >
            {schedule ? "Schedule campaign" : "Launch campaign"}
          </Button>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t mt-6 pt-4">
          <Button
            disabled={step === 0 || busy}
            onClick={() => setStep((n) => n - 1)}
          >
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              loading={busy}
              onClick={() =>
                void action(async () => {
                  await save();
                  toast.success("Draft saved");
                })
              }
            >
              Save draft
            </Button>
            {step < 3 && (
              <Button
                type="primary"
                className="bg-blue-600"
                loading={busy}
                onClick={() =>
                  void action(async () => {
                    const c = await save();
                    await refresh(c);
                    setStep((n) => n + 1);
                  })
                }
              >
                Continue
              </Button>
            )}
          </div>
        </div>
      </Form>
      <Modal
        open={!!editing}
        title="Edit recipient"
        onCancel={() => setEditing(undefined)}
        onOk={() =>
          void action(async () => {
            if (!editing) return;
            const c = await campaignRequest<Campaign>(
              "patch",
              `/${campaign._id}/recipients/${editing._id}`,
              {
                revision: campaign.revision,
                rawPhone: editing.rawPhone,
                variables: editing.variables,
              },
            );
            setEditing(undefined);
            await refresh(c);
          })
        }
        confirmLoading={busy}
      >
        <label>
          Phone
          <Input
            value={editing?.rawPhone}
            onChange={(e) =>
              setEditing((r) => (r ? { ...r, rawPhone: e.target.value } : r))
            }
          />
        </label>
        {Object.entries(editing?.variables || {}).map(([key, value]) => (
          <label key={key} className="block mt-3">
            {key}
            <Input
              value={value}
              onChange={(e) =>
                setEditing((r) =>
                  r
                    ? {
                        ...r,
                        variables: { ...r.variables, [key]: e.target.value },
                      }
                    : r,
                )
              }
            />
          </label>
        ))}
      </Modal>
    </section>
  );
}
