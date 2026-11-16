"use client";
import { Preview } from "@/services/campaigns";
export default function MessagePreview({
  preview,
  error,
}: {
  preview?: Preview;
  error?: string;
}) {
  return (
    <aside className="min-w-0 w-full lg:w-72 lg:shrink-0">
      <h3 className="font-semibold text-gray-800 mb-3">WhatsApp Preview</h3>
      <div className="mx-auto max-w-[280px] rounded-[32px] bg-gray-900 p-3 shadow-lg">
        <div className="rounded-[23px] bg-[#f4f6f3] overflow-hidden">
          <div className="bg-[#075E54] text-white p-4 text-sm">
            Message preview
          </div>
          <div className="p-3 min-h-[260px] max-h-[420px] overflow-auto space-y-2">
            <div className="bg-[#DCF8C6] rounded-lg p-3 text-sm whitespace-pre-wrap break-words">
              {preview?.text || "Your message will appear here…"}
            </div>
            {preview?.captions.map((p, i) => (
              <div
                key={p.assetId}
                className="bg-[#DCF8C6] rounded-lg p-3 text-sm whitespace-pre-wrap break-words"
              >
                Attachment {i + 1}
                {p.text && <p>{p.text}</p>}
              </div>
            ))}
            {error && (
              <p className="text-red-700 text-sm" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Preview shows the exact outgoing text. WhatsApp applies supported
        formatting.
      </p>
    </aside>
  );
}
