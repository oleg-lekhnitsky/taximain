import assert from "node:assert/strict";
import { spawn } from "node:child_process";

// Optional browser integration check. Uses an installed Chromium executable.
export async function checkCmsBrowser({
  executable,
  cmsUrl,
  model,
  documentId,
  accessToken,
  marker,
  onSave,
  sitePageId,
}) {
  const browser = spawn(
    executable,
    [
      "--headless",
      "--disable-gpu",
      "--no-first-run",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--remote-debugging-pipe",
    ],
    { stdio: ["ignore", "ignore", "ignore", "pipe", "pipe"] },
  );
  let counter = 0;
  let buffer = "";
  const waiting = new Map();
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++counter;
      waiting.set(id, { resolve, reject });
      browser.stdio[3].write(
        JSON.stringify({
          id,
          method,
          params,
          ...(sessionId ? { sessionId } : {}),
        }) + "\0",
      );
    });
  browser.stdio[4].on("data", (chunk) => {
    buffer += chunk.toString();
    let end;
    while ((end = buffer.indexOf("\0")) >= 0) {
      const raw = buffer.slice(0, end);
      buffer = buffer.slice(end + 1);
      if (!raw) continue;
      const message = JSON.parse(raw);
      const request = waiting.get(message.id);
      if (!request) continue;
      waiting.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message));
      else request.resolve(message.result);
    }
  });
  browser.on("error", (error) => {
    for (const request of waiting.values()) request.reject(error);
  });
  browser.on("exit", () => {
    for (const request of waiting.values())
      request.reject(new Error("Preview browser exited"));
  });
  const timeout = setTimeout(() => browser.kill("SIGTERM"), 90000);
  try {
    const { targetId } = await send("Target.createTarget", {
      url: "about:blank",
    });
    const { sessionId } = await send("Target.attachToTarget", {
      targetId,
      flatten: true,
    });
    const call = (method, params) => send(method, params, sessionId);
    await call("Page.enable");
    await call("Runtime.enable");
    await call("Page.bringToFront");
    await call("Emulation.setDeviceMetricsOverride", {
      width: 1600,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
    });
    const adminOrigin = new URL(cmsUrl);
    adminOrigin.hostname = "localhost";
    await call("Page.addScriptToEvaluateOnNewDocument", {
      source: `if(location.origin===${JSON.stringify(adminOrigin.origin)}){localStorage.setItem('jwtToken',${JSON.stringify(JSON.stringify(accessToken))});localStorage.setItem('strapi-admin-language','en');}`,
    });
    await call("Page.navigate", {
      url: new URL(
        `/admin/content-manager/collection-types/${model}/${documentId}`,
        adminOrigin,
      ).href,
    });
    async function evaluate(expression, contextId) {
      const response = await call("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
        ...(contextId ? { contextId } : {}),
      });
      if (response.exceptionDetails)
        throw new Error(response.exceptionDetails.text);
      return response.result.value;
    }
    const found = await evaluate(
      `(async()=>{for(let i=0;i<400;i++){const button=[...document.querySelectorAll('button')].find(el=>el.textContent==='Open live preview');if(button){button.click();return true;}await new Promise(r=>setTimeout(r,50));}return false;})()`,
    );
    assert(found, "Custom preview button is missing from the editor");
    if (model === "api::news-story.news-story") {
      const fields = await evaluate(`(async()=>{for(let i=0;i<100;i++){const type=document.querySelector('[data-wb-story-kind]');const body=document.querySelector('[data-wb-news-field="body"]');const link=document.querySelector('[data-wb-news-field="link"]');if(type&&body&&link)return {kind:type.dataset.wbStoryKind,body:getComputedStyle(body).display,link:getComputedStyle(link).display};await new Promise(r=>setTimeout(r,50));}return null;})()`);
      assert(fields, "News field grouping did not initialize");
      assert.equal(fields.kind, "article");
      assert.notEqual(fields.body, "none");
      assert.equal(fields.link, "none");
    }
    const opened = await evaluate(
      `(async()=>{for(let i=0;i<400;i++){if(document.querySelector('.wb-preview-panel iframe'))return true;const error=document.querySelector('.wb-preview-error');if(error)throw new Error(error.textContent);await new Promise(r=>setTimeout(r,50));}return false;})()`,
    );
    assert(opened, "Custom preview panel did not open");
    assert.equal(
      await evaluate(
        "document.querySelector('.wb-preview-panel iframe').style.width",
      ),
      "1440px",
    );
    let frameContext;
    for (let i = 0; i < 100; i++) {
      const { frameTree } = await call("Page.getFrameTree");
      const child = frameTree.childFrames?.find((item) =>
        item.frame.url.includes("/news/"),
      );
      if (child) {
        frameContext = (
          await call("Page.createIsolatedWorld", {
            frameId: child.frame.id,
            worldName: "preview-check",
          })
        ).executionContextId;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert(frameContext, "Preview iframe did not load its article");
    const visible = await evaluate(
      `(async()=>{for(let i=0;i<200;i++){if(document.querySelector("#article-title")?.textContent.includes(${JSON.stringify(marker + "-original")}))return true;await new Promise(r=>setTimeout(r,50));}return false;})()`,
      frameContext,
    );
    assert(visible, "Draft did not render inside the iframe");
    await onSave();
    const updated = await evaluate(
      `(async()=>{for(let i=0;i<300;i++){if(document.querySelector("#article-title")?.textContent.includes(${JSON.stringify(marker + "-preview-save")}))return true;await new Promise(r=>setTimeout(r,50));}return false;})()`,
      frameContext,
    );
    assert(updated, "Saved draft did not auto-refresh in the iframe");
    await evaluate(
      "[...document.querySelectorAll('.wb-preview-controls button')].find(el=>el.textContent==='Mobile').click()",
    );
    assert.equal(
      await evaluate(
        "document.querySelector('.wb-preview-panel iframe').style.width",
      ),
      "390px",
    );
    await evaluate(
      "document.querySelector('[aria-label=\"Close live preview\"]').click()",
    );
    const closed = await evaluate(
      `(async()=>{for(let i=0;i<200;i++){if(!document.querySelector('.wb-preview-panel'))return true;await new Promise(r=>setTimeout(r,50));}return false;})()`,
    );
    assert(closed, "Preview panel did not close");
    const cookies = await call("Network.getAllCookies");
    assert(
      !cookies.cookies.some((cookie) => cookie.name === "wb_cms_preview"),
      "Closing preview did not clear its private session",
    );
    if (sitePageId) {
      await call("Page.navigate", { url: new URL(`/admin/content-manager/collection-types/api::site-page.site-page/${sitePageId}`, adminOrigin).href });
      assert(await evaluate(`(async()=>{for(let i=0;i<400;i++){const button=[...document.querySelectorAll('button')].find(el=>el.textContent==='Open live preview');if(button){button.click();return true;}await new Promise(r=>setTimeout(r,50));}return false;})()`));
      assert(await evaluate(`(async()=>{for(let i=0;i<200;i++){if(document.querySelector('.wb-preview-sections'))return true;await new Promise(r=>setTimeout(r,50));}return false;})()`), "Preview section picker is missing");
      let pageContext;
      for (let i=0;i<100;i++) {
        const { frameTree } = await call("Page.getFrameTree");
        const child = frameTree.childFrames?.find(item => item.frame.url.includes("country=by") && !item.frame.url.includes("/api/"));
        if (child) {
          pageContext = (await call("Page.createIsolatedWorld", { frameId: child.frame.id, worldName: "section-check" })).executionContextId;
          if (await evaluate("Boolean(document.getElementById('cashback'))", pageContext)) break;
        }
        await new Promise(resolve => setTimeout(resolve,100));
      }
      assert(pageContext, "Page preview did not load");
      await evaluate(`document.querySelector('.wb-preview-sections').value='cashback';document.querySelector('.wb-preview-sections').dispatchEvent(new Event('change',{bubbles:true}))`);
      const navigationDebug = await evaluate(`JSON.stringify({y:scrollY,top:document.getElementById("cashback")?.getBoundingClientRect().top,height:innerHeight,body:document.body.scrollHeight})`, pageContext);
      assert(await evaluate(`(async()=>{for(let i=0;i<100;i++){const top=document.getElementById('cashback')?.getBoundingClientRect().top;if(scrollY>100&&top>=-50&&top<=200)return true;await new Promise(r=>setTimeout(r,50));}return false;})()`, pageContext), `Section picker did not scroll to cashback: ${navigationDebug}`);
      await evaluate("[...document.querySelectorAll('.wb-preview-controls button')].find(el=>el.textContent==='Close').click()");
    }
    console.log(
      "Browser preview passed: authenticated editor button, draft iframe, automatic saved-content refresh, desktop/mobile controls, close and session cleanup.",
    );
  } finally {
    clearTimeout(timeout);
    browser.kill("SIGTERM");
  }
}
