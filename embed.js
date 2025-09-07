(() => {
  const d = document;
  const ds = d.currentScript.dataset;
  const origin = (new URL((d.currentScript.src))).origin;
  const pos = ds.position || "bottom-right";
  const color = ds.primary || "#0B5FFF";
  const tenant = ds.tenant || "default";

  const btn = d.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", "Apri chat di assistenza");
  btn.style.position = "fixed";
  btn.style.zIndex = "2147483647";
  btn.style[pos.includes("bottom") ? "bottom" : "top"] = "20px";
  btn.style[pos.includes("right") ? "right" : "left"] = "20px";
  btn.style.width = "56px"; btn.style.height = "56px";
  btn.style.borderRadius = "999px";
  btn.style.border = "none";
  btn.style.cursor = "pointer";
  btn.style.background = color;
  btn.style.color = "#fff";
  btn.style.boxShadow = "0 8px 24px rgba(0,0,0,.2)";
  btn.textContent = "💬";
  d.body.appendChild(btn);

  const wrap = d.createElement("div");
  wrap.style.position = "fixed";
  wrap.style.zIndex = "2147483646";
  wrap.style.width = "min(380px, 96vw)";
  wrap.style.height = "min(560px, 80vh)";
  wrap.style.display = "none";
  wrap.style.borderRadius = "12px";
  wrap.style.overflow = "hidden";
  wrap.style.boxShadow = "0 16px 40px rgba(0,0,0,.22)";
  wrap.style[pos.includes("bottom") ? "bottom" : "top"] = "90px";
  wrap.style[pos.includes("right") ? "right" : "left"] = "20px";

  const iframe = d.createElement("iframe");
  iframe.src = `${origin}/widget/chat.html?tenant=${encodeURIComponent(tenant)}`;
  iframe.title = "Chat di assistenza";
  iframe.style.width = "100%"; iframe.style.height = "100%"; iframe.style.border = "0";
  iframe.referrerPolicy = "no-referrer";
  wrap.appendChild(iframe);
  d.body.appendChild(wrap);

  btn.addEventListener("click", () => {
    const open = wrap.style.display !== "none";
    wrap.style.display = open ? "none" : "block";
  });
})();
