import api from "./api";
export type CampaignState =
  | "draft"
  | "scheduled"
  | "running"
  | "paused"
  | "completed"
  | "cancelled"
  | "failed";
export interface AssetRef {
  assetId: string;
  caption: string;
}
export interface SendingConfig {
  senderPool: { deviceId: string; generation?: string; weight: number }[];
  rotation: "round_robin" | "batch" | "weighted";
  batchSize: number;
  rateMode: "overall" | "per_device";
  disconnectPolicy: "continue" | "pause";
  quantity?: number;
  period?: "minute" | "hour" | "day";
}
export interface SendingPreview {
  durationMs: number | null;
  intervalMs?: number;
  combinedTargetPerHour?: number;
  reason?: string;
  timeline: { deviceId: string; at: string }[];
  totals: Record<string, number>;
}
export const sendingConfig = (c?: Partial<Campaign>): SendingConfig => ({
  senderPool: c?.senderPool?.length
    ? c.senderPool
    : c?.deviceId
      ? [{ deviceId: c.deviceId, generation: c.generation, weight: 1 }]
      : [],
  rotation: c?.rotation || "round_robin",
  batchSize: c?.batchSize || 5,
  rateMode: "overall",
  disconnectPolicy: c?.disconnectPolicy || "continue",
  quantity: c?.quantity || 10,
  period: c?.period || "minute",
});
export interface Campaign {
  _id: string;
  name: string;
  deviceId: string;
  generation?: string;
  revision: number;
  state: CampaignState;
  template: string;
  fallbacks: Record<string, string>;
  mapping: Record<string, string>;
  assets: AssetRef[];
  defaultCountry: string;
  quantity: number;
  period: "minute" | "hour" | "day";
  timezone: string;
  startAt?: string;
  nextEligibleAt?: string;
  lastActivityAt?: string;
  createdAt: string;
  pauseReason?: string;
  summary: Record<string, number>;
  validationCounts?: Record<string, number>;
  receipts?: { delivered: number; read: number } | null;
  intervalMs?: number;
  senderPool?: SendingConfig["senderPool"];
  rotation?: SendingConfig["rotation"];
  batchSize?: number;
  rateMode?: SendingConfig["rateMode"];
  disconnectPolicy?: SendingConfig["disconnectPolicy"];
  configurationVersion?: number;
  waitReason?: string;
  deviceStatuses?: {
    deviceId: string;
    generation: string;
    connected: boolean;
    used: number;
    at: number;
    reason?: string;
    nextAt?: string;
    cooldownUntil?: string;
    resetAt?: string;
    outcomes: Record<string, number>;
    policy: {
      quantity?: number;
      period?: string;
      dailyCap?: number;
      timezone: string;
    };
  }[];
}
export interface Recipient {
  _id: string;
  rawPhone: string;
  phone?: string;
  variables: Record<string, string>;
  validation: string;
  validationReason?: string;
  excluded: boolean;
  state: string;
  error?: string;
  errorCode?: string;
  assignedDeviceId?: string;
  assignedGeneration?: string;
  firstSubmittedAt?: string;
  parts: {
    key: string;
    state: string;
    error?: string;
    retryable?: boolean;
    providerId?: string;
  }[];
}
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Campaign list endpoints are paginated, but an interrupted request, an older
 * backend response, or a proxy returning a partial response must never make a
 * campaign screen crash. Keep that defensive boundary in one place.
 */
export const emptyPage = <T>(): Page<T> => ({
  items: [],
  total: 0,
  page: 1,
  limit: 20,
});

export const normalizePage = <T>(value: unknown): Page<T> => {
  const candidate =
    value && typeof value === "object"
      ? (value as Partial<Page<T>>)
      : ({} as Partial<Page<T>>);
  const numberOr = (input: unknown, fallback: number) =>
    typeof input === "number" && Number.isFinite(input) && input >= 0
      ? input
      : fallback;

  return {
    items: Array.isArray(candidate.items) ? candidate.items : [],
    total: numberOr(candidate.total, 0),
    page: Math.max(1, numberOr(candidate.page, 1)),
    limit: Math.max(1, numberOr(candidate.limit, 20)),
  };
};
export interface ImportData {
  headers: { id: string; label: string; suggestedKey: string }[];
  rows: { sourceRow: number; cells: string[] }[];
}
export interface Preview {
  text: string;
  captions: { assetId: string; text: string }[];
}
export async function campaignRequest<T>(
  method: "get" | "post" | "patch" | "delete",
  url: string,
  data?: unknown,
  headers?: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  try {
    const response = await api.request({
      method,
      url: `/campaigns${url}`,
      data,
      headers,
      signal,
    });
    return response.data.data;
  } catch (e: any) {
    throw new Error(
      e.response?.data?.error?.message ||
        e.message ||
        "Campaign request failed",
    );
  }
}
export const duration = (ms: number) => {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(seconds / 3600),
    m = Math.floor((seconds % 3600) / 60),
    s = seconds % 60;
  return [h ? `${h} hr` : "", m ? `${m} min` : "", s || !seconds ? `${s}s` : ""]
    .filter(Boolean)
    .join(" ");
};
export async function downloadOutcomes(id: string) {
  const r = await api.get(`/campaigns/${id}/export`, { responseType: "blob" });
  const url = URL.createObjectURL(r.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "campaign-outcomes.csv";
  a.click();
  URL.revokeObjectURL(url);
}
