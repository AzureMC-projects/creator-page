// Solance Creator Program interactions

    document.getElementById("year").textContent = new Date().getFullYear();
    const form = document.getElementById("creator-form");
    const success = document.getElementById("success");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = form.querySelector("button[type=submit]");
      button.disabled = true;
      button.textContent = "Sending…";
      try {
        const response = await fetch("/", {
          method: "POST",
          headers: {"Content-Type": "application/x-www-form-urlencoded"},
          body: new URLSearchParams(new FormData(form)).toString()
        });
        if (!response.ok) throw new Error("Submission failed");
        form.style.display = "none";
        success.classList.add("show");
        success.scrollIntoView({behavior:"smooth",block:"center"});
      } catch {
        button.disabled = false;
        button.textContent = "Send application →";
        alert("We couldn't send your application. Please try again.");
      }
    });
  
    const settingsPanel=document.getElementById("settingsPanel"),authPanel=document.getElementById("authPanel");
    const openSettings=()=>{settingsPanel.classList.add("open");settingsPanel.setAttribute("aria-hidden","false")};
    const closeSettings=()=>{settingsPanel.classList.remove("open");settingsPanel.setAttribute("aria-hidden","true")};
    const openAuth=()=>{authPanel.classList.add("open");authPanel.setAttribute("aria-hidden","false")};
    const closeAuth=()=>{authPanel.classList.remove("open");authPanel.setAttribute("aria-hidden","true")};
    document.getElementById("settingsBtn").addEventListener("click",openSettings);
    document.getElementById("closeSettings").addEventListener("click",closeSettings);
    document.getElementById("signInBtn").addEventListener("click",openAuth);
    document.getElementById("closeAuth").addEventListener("click",closeAuth);
    [settingsPanel,authPanel].forEach(p=>p.addEventListener("click",e=>{if(e.target===p){p===settingsPanel?closeSettings():closeAuth()}}));
    const applyTheme=t=>{document.body.classList.toggle("light",t==="light"||(t==="system"&&matchMedia("(prefers-color-scheme:light)").matches));localStorage.setItem("solance-theme",t)};
    const savedTheme=localStorage.getItem("solance-theme")||"dark";document.getElementById("themeSelect").value=savedTheme;applyTheme(savedTheme);
    document.getElementById("themeSelect").addEventListener("change",e=>applyTheme(e.target.value));
    const motion=document.getElementById("motionToggle");motion.checked=localStorage.getItem("solance-reduce-motion")==="1";
    const setMotion=()=>{document.documentElement.style.scrollBehavior=motion.checked?"auto":"smooth";document.body.style.setProperty("--transition-duration",motion.checked?"0s":".2s");localStorage.setItem("solance-reduce-motion",motion.checked?"1":"0")};motion.addEventListener("change",setMotion);setMotion();
    document.getElementById("authSubmit").addEventListener("click",()=>alert("Sign-in is shown as a ready UI, but secure authentication still needs the Solance Supabase project connected."));
