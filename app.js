/* BSTV 2.0 — sincronización robusta con Google */
const BSTV_API = () => window.BSTV_CONFIG?.APPS_SCRIPT_URL || "";
async function bstvGoogle(action, payload={}) {
  const url=BSTV_API();
  if(!url) return {ok:false,error:"No hay URL de Apps Script configurada."};
  try {
    const r=await fetch(url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,...payload})});
    const t=await r.text();
    try{return JSON.parse(t)}catch{return {ok:false,error:"Respuesta no válida de Apps Script."}};
  } catch(e) { return {ok:false,error:"No se pudo contactar con Google: "+e.message}; }
}
async function bstvCheckGoogle(){
  const el=document.getElementById("cloudStatus");
  if(!el)return;
  if(!BSTV_API()){el.textContent="⚠️ Google no configurado";return;}
  try{
    const r=await fetch(BSTV_API(),{cache:"no-store"});
    const d=await r.json();
    el.textContent=d.ok?"☁️ Google conectado correctamente":"⚠️ Google no conectado";
    el.className=d.ok?"cloud ok":"cloud";
  }catch(e){el.textContent="⚠️ Google no conectado";el.className="cloud";}
}

window.addEventListener('load',()=>bstvCheckGoogle());
