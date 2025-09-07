(() => {
  const d = document;
  const ds = d.currentScript.dataset;
  const origin = ds.origin || (new URL(d.currentScript.src)).origin;
  const path = ds.path || "/"; // where chat.html & assets are hosted
  const pos = ds.position || "bottom-right";
  const color = ds.primary || "#0B5FFF";

  // Button
  const btn = d.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", "Apri chat di assistenza");
  Object.assign(btn.style, {
    position:"fixed", zIndex:"2147483647", width:"56px", height:"56px",
    borderRadius:"999px", border:"0", cursor:"pointer", background:color, color:"#fff",
    boxShadow:"0 8px 24px rgba(0,0,0,.2)"
  });
  (pos.includes("bottom")? btn.style.bottom="20px" : btn.style.top="20px");
  (pos.includes("right")? btn.style.right="20px" : btn.style.left="20px");
  btn.textContent = "💬";
  d.body.appendChild(btn);

  // Frame
  const wrap = d.createElement("div");
  Object.assign(wrap.style, {
    position:"fixed", zIndex:"2147483646", width:"min(380px,96vw)", height:"min(560px,80vh)",
    display:"none", borderRadius:"12px", overflow:"hidden", boxShadow:"0 16px 40px rgba(0,0,0,.22)"
  });
  (pos.includes("bottom")? wrap.style.bottom="90px" : wrap.style.top="20px");
  (pos.includes("right")? wrap.style.right="20px" : wrap.style.left="20px");
  const iframe = d.createElement("iframe");
  iframe.src = `${origin}${path}chat.html`;
  iframe.title = "Chat di assistenza";
  iframe.referrerPolicy = "no-referrer";
  iframe.style.width = "100%"; iframe.style.height = "100%"; iframe.style.border = "0";
  wrap.appendChild(iframe); d.body.appendChild(wrap);

  btn.addEventListener("click", ()=> wrap.style.display = (wrap.style.display==="none"?"block":"none"));
})();
