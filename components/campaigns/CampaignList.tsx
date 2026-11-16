"use client";
import { useEffect, useState } from "react";
import { Button, Input, Select, Table, Tag, Alert, Popconfirm } from "antd";
import Link from "next/link";
import toast from "react-hot-toast";
import { Campaign, Page, campaignRequest } from "@/services/campaigns";
export default function CampaignList() {
  const [data, setData] = useState<Page<Campaign>>({
    items: [],
    total: 0,
    page: 1,
    limit: 20,
  });
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [state, setState] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        const d = await campaignRequest<Page<Campaign>>(
          "get",
          `?page=${page}&search=${encodeURIComponent(search)}&state=${state}`,
        );
        if (alive) {
          setData(d);
          setError("");
        }
      } catch (e: any) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setBusy(false);
      }
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [page, search, state]);
  return (
    <section className="p-4 md:p-8 w-full min-w-0 max-w-[1600px] mx-auto">
      <div className="flex flex-wrap justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Campaigns</h1>
          <p className="text-gray-500">
            Personalized WhatsApp campaigns that continue after you close your
            browser.
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button type="primary" className="bg-blue-600">
            Create campaign
          </Button>
        </Link>
      </div>
      {error && (
        <Alert type="error" showIcon message={error} className="mb-4" />
      )}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 min-w-0">
        <div className="flex flex-wrap gap-3 mb-4">
          <Input.Search
            aria-label="Search campaigns"
            placeholder="Search campaigns"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
          />
          <Select
            aria-label="Campaign state"
            value={state}
            onChange={(v) => {
              setState(v);
              setPage(1);
            }}
            className="w-40"
            options={[
              "",
              "draft",
              "scheduled",
              "running",
              "paused",
              "completed",
              "cancelled",
              "failed",
            ].map((value) => ({ value, label: value || "All states" }))}
          />
        </div>
        <Table
          rowKey="_id"
          loading={busy}
          dataSource={data.items}
          scroll={{ x: 780 }}
          locale={{
            emptyText:
              "No campaigns yet. Create your first campaign to get started.",
          }}
          pagination={{
            current: page,
            total: data.total,
            pageSize: 20,
            onChange: setPage,
          }}
          columns={[
            {
              title: "Campaign",
              dataIndex: "name",
              render: (name: string, c: Campaign) => (
                <Link
                  className="text-blue-600 font-medium"
                  href={`/campaigns/${c._id}`}
                >
                  {name}
                </Link>
              ),
            },
            {
              title: "State",
              dataIndex: "state",
              render: (s: string) => (
                <Tag
                  color={
                    s === "running"
                      ? "blue"
                      : s === "completed"
                        ? "green"
                        : s === "paused"
                          ? "orange"
                          : "default"
                  }
                >
                  {s}
                </Tag>
              ),
            },
            {
              title: "Sent / audience",
              render: (_: unknown, c: Campaign) =>
                `${c.summary?.sent || 0} / ${c.summary?.total || 0}`,
            },
            {
              title: "Created",
              dataIndex: "createdAt",
              render: (d: string) => new Date(d).toLocaleString(),
            },
            {
              title: "Actions",
              render: (_: unknown, c: Campaign) => (
                <div className="flex gap-2">
                  {c.state === "draft" && (
                    <Link href={`/campaigns/${c._id}/edit`}>Edit</Link>
                  )}
                  <Button
                    size="small"
                    onClick={async () => {
                      try {
                        const copy = await campaignRequest<Campaign>(
                          "post",
                          `/${c._id}/duplicate`,
                        );
                        window.location.href = `/campaigns/${copy._id}/edit`;
                      } catch (e: any) {
                        toast.error(e.message);
                      }
                    }}
                  >
                    Duplicate
                  </Button>
                  {c.state === "draft" && (
                    <Popconfirm
                      title="Delete this draft?"
                      onConfirm={async () => {
                        try {
                          await campaignRequest("delete", `/${c._id}`);
                          setData((d) => ({
                            ...d,
                            items: d.items.filter((x) => x._id !== c._id),
                            total: d.total - 1,
                          }));
                        } catch (e: any) {
                          toast.error(e.message);
                        }
                      }}
                    >
                      <Button size="small" danger>
                        Delete
                      </Button>
                    </Popconfirm>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}
