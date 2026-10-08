(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  $("#year").textContent = new Date().getFullYear();

  // Supabase browser client — publishable key only.
  const SUPABASE_URL = "https://xedydjesbfvquypyomsm.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_FPeDOtPmcmKOzpSZmRsSJQ_V2PW6Cou";
  let supabaseClient = null;
  const startSupabase = () => {
    if (!window.supabase?.createClient) return null;
    if (!supabaseClient) supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    return supabaseClient;
  };

  // Netlify application form
  const form = $("#creator-form");
  const success = $("#success");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const original = button.innerHTML;
    button.disabled = true;
    button.innerHTML = "<span>Sending…</span><span>↗</span>";
    try {
      const body = new URLSearchParams();
      new FormData(form).forEach((value, key) => body.append(key, value));
      const response = await fetch(form.getAttribute("action") || "/", {
        method: "POST", headers: {"Content-Type":"application/x-www-form-urlencoded"},
        body: body.toString(), credentials:"same-origin"
      });
      if (!response.ok) throw new Error("Netlify returned " + response.status);
      form.hidden = true; success.classList.add("show");
      success.scrollIntoView({behavior:"smooth",block:"center"});
    } catch (error) {
      button.disabled=false; button.innerHTML=original;
      if (confirm("The quick submission could not connect to the form service. Try the standard submission instead?")) {
        HTMLFormElement.prototype.submit.call(form);
      }
    }
  });

  const settingsPanel=$("#settingsPanel"), authPanel=$("#authPanel");
  const setModal=(panel,open)=>{ panel.classList.toggle("open",open); panel.setAttribute("aria-hidden",String(!open)); document.body.classList.toggle("modal-open",open); };
  const openSettings=()=>setModal(settingsPanel,true), closeSettings=()=>setModal(settingsPanel,false);
  const openAuth=()=>setModal(authPanel,true), closeAuth=()=>setModal(authPanel,false);
  $("#settingsBtn").addEventListener("click",openSettings); $("#closeSettings").addEventListener("click",closeSettings);
  $("#signInBtn").addEventListener("click",openAuth); $("#closeAuth").addEventListener("click",closeAuth);
  [settingsPanel,authPanel].forEach(p=>p.addEventListener("click",e=>{if(e.target===p)setModal(p,false)}));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeSettings();closeAuth()}});

  const themeSelect=$("#themeSelect");
  const applyTheme=(theme,persist=true)=>{
    const light=theme==="light"||(theme==="system"&&matchMedia("(prefers-color-scheme: light)").matches);
    document.body.classList.toggle("light",light);
    if(persist)localStorage.setItem("solance-theme",theme);
  };
  const savedTheme=localStorage.getItem("solance-theme")||"dark";
  themeSelect.value=savedTheme; applyTheme(savedTheme);
  themeSelect.addEventListener("change",e=>applyTheme(e.target.value));
  const motionToggle=$("#motionToggle");
  const setMotion=()=>{const reduced=motionToggle.checked;document.documentElement.classList.toggle("reduce-motion",reduced);localStorage.setItem("solance-reduce-motion",reduced?"1":"0")};
  motionToggle.checked=localStorage.getItem("solance-reduce-motion")==="1"; motionToggle.addEventListener("change",setMotion); setMotion();
  matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>{if((localStorage.getItem("solance-theme")||"dark")==="system")applyTheme("system",false)});

  const authEmail=$("#authEmail"), authPassword=$("#authPassword"), authName=$("#authName"), authNameField=$("#authNameField");
  const authSubmit=$("#authSubmit"), authMessage=$("#authMessage"), signInBtn=$("#signInBtn");
  const modes=$$(".auth-mode");
  let mode="signin";
  const message=(text,type="info")=>{authMessage.textContent=text;authMessage.dataset.type=type;authMessage.hidden=false};
  const setMode=(next)=>{
    mode=next; const create=mode==="signup";
    modes.forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
    $("#authTitle").textContent=create?"Create your account":"Welcome back";
    $("#authCopy").textContent=create?"Create an account to keep your creator profile and project activity in one place.":"Sign in to your Solance account.";
    authSubmit.textContent=create?"Create account":"Sign in";
    authPassword.autocomplete=create?"new-password":"current-password";
    authNameField.hidden=!create; authMessage.hidden=true;
  };
  modes.forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));
  const refreshAccount=async()=>{
    const sb=startSupabase(); if(!sb)return;
    const {data:{session}}=await sb.auth.getSession();
    if(session?.user){
      const display=session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "Account";
      signInBtn.textContent=display.length>16?display.slice(0,15)+"…":display;
      signInBtn.title="Open account";
      $("#authTitle").textContent="You're signed in";
      $("#authCopy").textContent=session.user.email || "";
      $("#authSubmit").textContent="Sign out";
      $("#authSubmit").dataset.action="signout";
      authNameField.hidden=true; authEmail.value=session.user.email||""; authPassword.value="";
      $("#forgotPassword").hidden=true;
      authMessage.hidden=true;
    } else {
      signInBtn.textContent="Sign in"; signInBtn.title="";
      $("#forgotPassword").hidden=false;
      $("#authSubmit").dataset.action="";
      setMode(mode);
    }
  };

  authSubmit.addEventListener("click",async()=>{
    const sb=startSupabase();
    if(!sb){message("Account service is unavailable. Please refresh and try again.","error");return}
    if(authSubmit.dataset.action==="signout"){await sb.auth.signOut();setMode("signin");await refreshAccount();message("You have been signed out.","info");return}
    const email=authEmail.value.trim(), password=authPassword.value;
    if(!authEmail.validity.valid){authEmail.focus();message("Please enter a valid email address.","error");return}
    if(password.length<8){authPassword.focus();message("Your password should be at least 8 characters.","error");return}
    authSubmit.disabled=true;
    try{
      if(mode==="signup"){
        const name=authName.value.trim();
        if(!name){authName.focus();message("Add a name or nickname for your profile.","error");return}
        const {data,error}=await sb.auth.signUp({email,password,options:{data:{display_name:name}}});
        if(error)throw error;
        if(data.session){
          await sb.from("profiles").upsert({id:data.user.id,display_name:name},{onConflict:"id"});
          await sb.from("user_settings").upsert({user_id:data.user.id},{onConflict:"user_id"});
          message("Account created. You're signed in.","success"); await refreshAccount();
        }else{
          message("Account created. Check your email to confirm it, then sign in.","success");
          setMode("signin");
        }
      }else{
        const {data,error}=await sb.auth.signInWithPassword({email,password});
        if(error)throw error;
        await sb.from("profiles").upsert({id:data.user.id,display_name:data.user.user_metadata?.display_name || email.split("@")[0]},{onConflict:"id"});
        await sb.from("user_settings").upsert({user_id:data.user.id},{onConflict:"user_id"});
        message("Signed in successfully.","success"); await refreshAccount();
      }
    }catch(error){
      message(error.message==="Invalid login credentials"?"Email or password is incorrect.":error.message,"error");
    }finally{authSubmit.disabled=false}
  });

  $("#forgotPassword").addEventListener("click",async()=>{
    const sb=startSupabase(), email=authEmail.value.trim();
    if(!email||!authEmail.validity.valid){authEmail.focus();message("Enter your email address first.","error");return}
    const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+"/"});
    message(error?error.message:"Password reset email sent. Check your inbox.","success");
  });

  // Sync session changes across tabs and after email confirmation.
  const sb=startSupabase();
  if(sb){
    sb.auth.onAuthStateChange((_event)=>refreshAccount());
    refreshAccount();
  }

  // Avoid scroll-lock bugs when modals close.
  window.addEventListener("pageshow",()=>{document.body.classList.remove("modal-open")});
})();