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
/* BSTV 2.0 — CORRECCIÓN DE NAVEGACIÓN */

(function () {

  function iniciarNavegacionBSTV() {

    const botones = document.querySelectorAll(".nav[data-view]");
    const vistas = document.querySelectorAll(".view");
    const titulo = document.getElementById("pageTitle");

    if (!botones.length || !vistas.length) {
      return;
    }

    const titulos = {
      dashboard: "Panel de administración",
      students: "Alumnos",
      formations: "Formaciones",
      courses: "Cursos y asignaturas",
      attendance: "Control de asistencia",
      grades: "Evaluación",
      certificates: "Certificados",
      reports: "Informes"
    };

    function abrirVista(id) {

      vistas.forEach(function (vista) {

        const activa = vista.id === id;

        vista.classList.toggle("active", activa);

        vista.style.display = activa ? "block" : "none";

      });

      botones.forEach(function (boton) {

        boton.classList.toggle(
          "active",
          boton.dataset.view === id
        );

      });

      if (titulo) {
        titulo.textContent =
          titulos[id] || "BSTV 2.0";
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }

    botones.forEach(function (boton) {

      boton.addEventListener("click", function (e) {

        e.preventDefault();

        abrirVista(this.dataset.view);

      });

    });

    const inicial =
      document.querySelector(
        ".nav.active[data-view]"
      )?.dataset.view || "dashboard";

    abrirVista(inicial);
  }

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      iniciarNavegacionBSTV
    );

  } else {

    iniciarNavegacionBSTV();

  }

})();
