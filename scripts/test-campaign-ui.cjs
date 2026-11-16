// Opt-in, fixture-only browser smoke. No requests may leave the local Next server.
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const { chromium } = require(
  process.env.CAMPAIGN_PLAYWRIGHT_MODULE || "playwright",
);
(async () => {
  const port = 3101,
    origin = `http://127.0.0.1:${port}`;
  const server = spawn(
    process.execPath,
    [
      require.resolve("next/dist/bin/next"),
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    {
      env: {
        ...process.env,
        NEXT_BUILD_DIST_DIR:
          process.env.NEXT_BUILD_DIST_DIR || ".next-campaign-check",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let serverLog = "";
  server.stdout.on("data", (x) => (serverLog += x));
  server.stderr.on("data", (x) => (serverLog += x));
  let browser, page;
  try {
    let ready = false;
    for (let n = 0; n < 60; n++) {
      try {
        if ((await fetch(origin + "/login")).ok) {
          ready = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 250));
    }
    assert.ok(ready, serverLog);
    browser = await chromium.launch({
      headless: true,
      executablePath: process.env.CAMPAIGN_CHROMIUM_EXECUTABLE || undefined,
      args: ["--no-sandbox"],
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    let campaign = {
      _id: "111111111111111111111111",
      name: "Fixture campaign",
      deviceId: "sender",
      revision: 1,
      state: "draft",
      template: "",
      fallbacks: {},
      mapping: {},
      assets: [],
      defaultCountry: "IN",
      quantity: 10,
      period: "minute",
      timezone: "Asia/Kolkata",
      createdAt: new Date().toISOString(),
      summary: { total: 0, pending: 0 },
    };
    let recipients = [];
    let recipientPageRequests = 0;
    await context.route("**/*", async (route) => {
      const req = route.request(),
        url = new URL(req.url());
      if (url.origin === origin) return route.continue();
      if (!url.pathname.startsWith("/api/v1/")) return route.abort();
      const headers = {
        "access-control-allow-origin": origin,
        "access-control-allow-credentials": "true",
        "access-control-allow-headers": "*",
        "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
      };
      if (req.method() === "OPTIONS")
        return route.fulfill({ status: 204, headers });
      let body = {};
      try {
        body = req.postDataJSON() || {};
      } catch {}
      const p = url.pathname.slice("/api/v1".length);
      let data = {};
      let raw;
      if (p === "/auth/profile")
        raw = {
          success: true,
          data: {
            user: {
              name: "Fixture user",
              isVerified: true,
              devices: [
                {
                  deviceId: "sender",
                  number: "919876543210",
                  status: "connected",
                  lifecycle: "active",
                  generation: "fixture",
                },
                {
                  deviceId: "sender-B",
                  number: "919876543211",
                  status: "connected",
                  lifecycle: "active",
                  generation: "fixture-B",
                },
              ],
            },
          },
        };
      else if (p === "/general-settings")
        raw = { success: true, data: { systemName: "Msg Zone" } };
      else if (p === "/campaigns/config")
        data = {
          countries: ["IN", "US", "GB"],
          minimumIntervalMs: 2000,
          multiDeviceEnabled: true,
        };
      else if (p.includes("/device-policies/"))
        data = {
          revision: 1,
          quantity: null,
          period: "hour",
          cooldownEvery: null,
          cooldownMs: null,
          dailyCap: body.dailyCap || null,
          timezone: "Asia/Kolkata",
        };
      else if (p.endsWith("/sending-preview"))
        data = {
          durationMs: 0,
          timeline: [{ deviceId: "sender", at: new Date().toISOString() }],
          totals: { sender: recipients.length },
          combinedTargetPerHour: 1200,
          intervalMs: 6000,
        };
      else if (p === "/campaigns/sending-status")
        data = {
          quick: { paused: false, workers: 1, available: true },
          recipients: { paused: false, workers: 1, available: true },
          executions: [],
          queued: [],
        };
      else if (p === "/campaigns" && req.method() === "POST") {
        campaign = { ...campaign, state: "draft", revision: 1 };
        data = campaign;
      } else if (p === "/campaigns")
        data = { items: [campaign], total: 1, page: 1, limit: 20 };
      else if (p.endsWith("/audience")) {
        recipients.push(
          ...body.rows.map((r, i) => ({
            _id: String(i + 1),
            ...r,
            phone: r.rawPhone,
            validation: "valid",
            state: "pending",
            parts: [],
            excluded: false,
          })),
        );
        campaign = {
          ...campaign,
          revision: campaign.revision + 1,
          summary: { total: recipients.length, pending: recipients.length },
          validationCounts: { valid: recipients.length },
        };
        data = campaign;
      } else if (p.endsWith("/recipients")) {
        recipientPageRequests += 1;
        // The editor must tolerate a partial/legacy page while it refreshes.
        data =
          recipientPageRequests === 1
            ? {}
            : {
                items: recipients,
                total: recipients.length,
                page: 1,
                limit: 20,
              };
      } else if (p.endsWith("/preview")) {
        const vars = recipients[0]?.variables || {},
          fallbacks = body.fallbacks || campaign.fallbacks;
        data = {
          text: String(body.template ?? campaign.template).replace(
            /\{\{(\w+)\}\}/g,
            (_, key) => vars[key] || fallbacks[key] || "",
          ),
          captions: [],
        };
      } else if (p.endsWith("/launch")) {
        campaign = {
          ...campaign,
          state: "running",
          intervalMs: 6000,
          startAt: new Date().toISOString(),
          nextEligibleAt: new Date(Date.now() + 6000).toISOString(),
        };
        data = campaign;
      } else if (p.endsWith("/pause")) {
        campaign = {
          ...campaign,
          state: "paused",
          pauseReason: "Paused by user",
        };
        data = campaign;
      } else if (p.startsWith("/campaigns/")) {
        if (req.method() === "PATCH")
          campaign = { ...campaign, ...body, revision: campaign.revision + 1 };
        data = campaign;
      } else raw = { success: true, data: [] };
      return route.fulfill({
        status: 200,
        headers,
        json: raw || { success: true, data, error: null },
      });
    });
    await page.goto(origin + "/campaigns/new");
    await page.getByLabel("Campaign name", { exact: true }).fill("UI campaign");
    await page
      .getByRole("combobox", { name: "Sending devices", exact: true })
      .press("ArrowDown");
    await page
      .getByText("sender-B · +919876543211 · connected", { exact: true })
      .last()
      .click();
    await page
      .getByRole("combobox", { name: "Sending devices", exact: true })
      .press("Escape");
    await page
      .getByRole("combobox", { name: "Rotation mode", exact: true })
      .press("ArrowDown");
    await page.getByText("Batches", { exact: true }).click();
    await page.getByLabel("Recipients per batch", { exact: true }).fill("3");
    await page
      .getByRole("combobox", { name: "Rotation mode", exact: true })
      .press("ArrowDown");
    await page.getByText("Weighted", { exact: true }).click();
    await page.getByLabel("Weight sender", { exact: true }).fill("2");
    await page
      .getByRole("combobox", { name: "Rate mode", exact: true })
      .press("ArrowDown");
    assert.equal(await page.getByText('Each selected device', { exact: true }).count(), 0);
    await page.getByRole('combobox', { name: 'Rate mode', exact: true }).press('Escape');
    await page
      .getByRole("button", { name: "Configure limits", exact: true })
      .first()
      .click();
    await page
      .getByLabel("Daily contact cap (empty = unlimited)", { exact: true })
      .fill("100");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForFunction(
      () =>
        !Array.from(document.querySelectorAll("button.ant-btn-loading")).some(
          (button) => button.getClientRects().length,
        ),
    );
    await page
      .getByPlaceholder("+919876543210", { exact: true })
      .fill("+919876543210");
    await page
      .getByRole("button", { name: "Add numbers", exact: true })
      .click();
    await page.waitForFunction(
      () =>
        !Array.from(document.querySelectorAll("button.ant-btn-loading")).some(
          (button) => button.getClientRects().length,
        ),
    );
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForFunction(
      () =>
        !Array.from(document.querySelectorAll("button.ant-btn-loading")).some(
          (button) => button.getClientRects().length,
        ),
    );
    await page.getByLabel("Message", { exact: true }).fill("Hello {{name}}");
    await page
      .getByLabel("Fallback for {{name}} (optional)", { exact: true })
      .fill("friend");
    await page.getByText("Hello friend", { exact: true }).waitFor();
    const output =
      process.env.CAMPAIGN_SCREENSHOTS || "/tmp/msgzone-campaign-ui";
    await fs.mkdir(output, { recursive: true });
    await page.screenshot({
      path: output + "/desktop-editor.png",
      fullPage: true,
    });
    const checkWidth = async (label) => {
      const widths = await page.evaluate(() => ({
        scroll:
          document.querySelector("main")?.scrollWidth ||
          document.documentElement.scrollWidth,
        width:
          document.querySelector("main")?.clientWidth ||
          document.documentElement.clientWidth,
      }));
      assert.ok(
        widths.scroll <= widths.width + 1,
        `${label}: page width ${widths.scroll} exceeds viewport ${widths.width}`,
      );
    };
    await checkWidth("desktop editor");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.waitForFunction(
      () =>
        !Array.from(document.querySelectorAll("button.ant-btn-loading")).some(
          (button) => button.getClientRects().length,
        ),
    );
    await page
      .getByRole("button", { name: "Launch campaign", exact: true })
      .click();
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await page.getByText("Paused by user", { exact: true }).waitFor();
    assert.equal(campaign.senderPool.length, 2);
    assert.equal(campaign.rotation, "weighted");
    assert.equal(campaign.rateMode, "overall");
    assert.equal(campaign.senderPool[0].weight, 2);
    await page
      .getByRole("button", { name: "Edit sending configuration", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Move up", exact: true })
      .last()
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "OK", exact: true })
      .click();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    assert.equal(campaign.senderPool[0].deviceId, "sender-B");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: output + "/mobile-detail.png",
      fullPage: true,
    });
    await checkWidth("mobile detail");
    await page.goto(origin + "/campaigns");
    await page
      .getByRole("heading", { name: "Campaigns", exact: true })
      .waitFor();
    await checkWidth("mobile list");
    await page.goto(origin + "/send");
    await page
      .getByRole("heading", { name: "Send Message", exact: true })
      .waitFor();
    await page.locator(".ql-editor").waitFor();
    await checkWidth("mobile quick send");
    await page.screenshot({
      path: output + "/mobile-send.png",
      fullPage: true,
    });
    await page.goto(origin + "/campaigns/new");
    await page.getByLabel("Campaign name", { exact: true }).waitFor();
    await checkWidth("mobile editor");
    await page.screenshot({
      path: output + "/mobile-editor.png",
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    console.log(
      "PASS: multi-device modes, weights, rates, shared policies, paused pool edits, creation, personalization, launch/pause; desktop and 390px layouts; quick-send regression. Screenshots: " +
        output,
    );
  } catch (e) {
    if (page) {
      await page
        .screenshot({
          path: (process.env.CAMPAIGN_SCREENSHOTS || "/tmp") + "/failure.png",
          fullPage: true,
        })
        .catch(() => {});
      console.error((await page.locator("body").innerText()).slice(-5000));
      console.error(
        "Loading buttons:",
        await page
          .locator("button.ant-btn-loading")
          .evaluateAll((nodes) =>
            nodes.map((n) => ({
              visible: !!n.getClientRects().length,
              html: n.outerHTML,
            })),
          ),
      );
    }
    throw e;
  } finally {
    if (browser) await browser.close();
    server.kill("SIGTERM");
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
