(() => {
  const URL = "https://xedydjesbfvquypyomsm.supabase.co";
  const KEY = "sb_publishable_FPeDOtPmcmKOzpSZmRsSJQ_V2PW6Cou";
  const sb = window.supabase?.createClient(URL, KEY);
  if (!sb) return;

  function render(row) {
    const closed = !!row?.active && row.kind === "maintenance";
    const text = document.querySelector("#applicationStatusText");
    const dot = document.querySelector("#applicationStatus .status-dot");
    const button = document.querySelector("#heroApplyButton");
    const form = document.querySelector("#creator-form");
    const panel = document.querySelector("#applicationPanel");
    const heading = document.querySelector("#applicationHeading");

    if (text) text.textContent = closed ? "Applications are closed" : "Applications are open";
    if (dot) dot.classList.toggle("closed", closed);
    document.body.classList.toggle("applications-closed", closed);
    if (button) {
      button.textContent = closed ? "Applications closed" : "Apply to Solance ↗";
      button.classList.toggle("disabled", closed);
      if (closed) button.removeAttribute("href"); else button.setAttribute("href","#apply");
    }
    if (heading) heading.textContent = closed ? "Applications are currently closed." : "Tell us about you.";
    if (form) {
      form.hidden = closed;
      form.querySelectorAll("input,select,textarea,button").forEach(el => el.disabled = closed);
    }
    if (panel) panel.classList.toggle("application-closed", closed);

    const alert = document.querySelector("#siteAlert");
    if (!alert) return;
    if (!row?.active) { alert.hidden = true; return; }
    document.querySelector("#siteAlertTitle").textContent = row.title || "Solance update";
    document.querySelector("#siteAlertMessage").textContent = row.message || "";
    alert.hidden = false;
  }

  async function load() {
    const {data} = await sb.from("site_status").select("active,kind,title,message,updated_at").eq("id","global").maybeSingle();
    render(data);
  }

  sb.channel("global-site-status")
    .on("postgres_changes",{event:"UPDATE",schema:"public",table:"site_status",filter:"id=eq.global"},payload => render(payload.new))
    .subscribe();

  load();
})();