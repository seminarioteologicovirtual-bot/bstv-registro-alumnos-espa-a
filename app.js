/* =========================================================
   BSTV 2.0 — GESTIÓN ACADÉMICA
   Frontend alineado con Code.gs actual.
   ========================================================= */

const BSTV_API = () => window.BSTV_CONFIG?.APPS_SCRIPT_URL || "";

async function bstvGoogle(action, payload = {}) {
  const url = BSTV_API();

  if (!url) {
    return {
      ok: false,
      error: "No hay URL de Apps Script configurada."
    };
  }

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action,
        ...payload
      })
    });

    const t = await r.text();

    try {
      return JSON.parse(t);
    } catch {
      return {
        ok: false,
        error: "Respuesta no válida de Apps Script.",
        raw: t
      };
    }

  } catch (e) {
    return {
      ok: false,
      error: "No se pudo contactar con Google: " + e.message
    };
  }
}


/* =========================================================
   FORMACIONES OFICIALES BSTV
   ========================================================= */

const BSTV_FORMACIONES = [
  {
    id: "INFANTIL",
    nombre: "BSTV INFANTIL",
    descripcion: "Formación bíblica adaptada para niños.",
    icono: "👧👦"
  },
  {
    id: "HERMANOS",
    nombre: "BSTV HERMANOS",
    descripcion: "Formación bíblica general para hermanos.",
    icono: "📖"
  },
  {
    id: "BENDECIDAS",
    nombre: "BSTV BENDECIDAS",
    descripcion: "Formación bíblica para hermanas.",
    icono: "🌷"
  }
];


let BSTV_ALUMNOS = [];


/* =========================================================
   COMPROBAR GOOGLE
   ========================================================= */

async function bstvCheckGoogle() {

  const el = document.getElementById("cloudStatus");

  if (!el) return;

  if (!BSTV_API()) {

    el.textContent = "⚠️ Google no configurado";
    el.className = "cloud";

    return;
  }

  try {

    const r = await fetch(
      BSTV_API(),
      {
        cache: "no-store"
      }
    );

    const d = await r.json();

    el.textContent = d.ok
      ? "☁️ Google conectado correctamente"
      : "⚠️ Google no conectado";

    el.className = d.ok
      ? "cloud ok"
      : "cloud";

  } catch (e) {

    el.textContent = "⚠️ Google no conectado";
    el.className = "cloud";

  }
}


/* =========================================================
   NAVEGACIÓN
   ========================================================= */

function iniciarNavegacionBSTV() {

  const botones =
    document.querySelectorAll(".nav[data-view]");

  const vistas =
    document.querySelectorAll(".view");

  const titulo =
    document.getElementById("pageTitle");


  const titulos = {

    dashboard: "Panel de administración",

    students: "Alumnos",

    formations: "Formaciones",

    courses: "Cursos y asignaturas",

    attendance: "Asistencia",

    grades: "Evaluación",

    certificates: "Certificados",

    reports: "Informes"

  };


  function abrirVista(id) {

    vistas.forEach(vista => {

      const activa =
        vista.id === id;

      vista.classList.toggle(
        "active",
        activa
      );

      vista.style.display =
        activa
          ? "block"
          : "none";

    });


    botones.forEach(boton => {

      boton.classList.toggle(
        "active",
        boton.dataset.view === id
      );

    });


    if (titulo) {

      titulo.textContent =
        titulos[id] || "BSTV 2.0";

    }


    if (id === "dashboard") {

      actualizarDashboard();

    }


    if (id === "students") {

      cargarAlumnos();

    }


    if (id === "formations") {

      renderFormaciones();

    }


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }


  botones.forEach(boton => {

    boton.addEventListener(
      "click",
      function (e) {

        e.preventDefault();

        abrirVista(
          this.dataset.view
        );

      }
    );

  });


  abrirVista("dashboard");

}


/* =========================================================
   MOSTRAR FORMACIONES
   ========================================================= */

function renderFormaciones() {

  const contenedor =
    document.getElementById(
      "formationCards"
    );

  const stats =
    document.getElementById(
      "formationStats"
    );


  if (contenedor) {

    contenedor.innerHTML =
      BSTV_FORMACIONES.map(
        f => `

        <div class="card">

          <div style="
            font-size:32px;
            margin-bottom:10px;
          ">
            ${f.icono}
          </div>

          <span>
            Formación oficial
          </span>

          <strong style="
            font-size:20px;
          ">
            ${escapeHtml(f.nombre)}
          </strong>

          <p style="
            color:#6b7f93;
            line-height:1.5;
          ">
            ${escapeHtml(f.descripcion)}
          </p>

          <div style="
            margin-top:16px;
          ">

            <button
              class="secondary"
              type="button"
              data-formation="${escapeHtml(f.nombre)}"
            >
              Ver alumnos
            </button>

          </div>

        </div>

      `
      ).join("");


    contenedor
      .querySelectorAll(
        "[data-formation]"
      )
      .forEach(btn => {

        btn.addEventListener(
          "click",
          () => {

            filtrarFormacion(
              btn.dataset.formation
            );

          }
        );

      });

  }


  if (stats) {

    stats.innerHTML =
      BSTV_FORMACIONES.map(
        f => {

          const total =
            BSTV_ALUMNOS.filter(
              a =>
                normalizar(
                  a.formación ||
                  a.formacion
                ) ===
                normalizar(
                  f.nombre
                )
            ).length;


          const porcentaje =
            total > 0
              ? Math.min(
                  100,
                  total * 10
                )
              : 0;


          return `

          <div style="
            margin:15px 0;
          ">

            <div style="
              display:flex;
              justify-content:space-between;
              margin-bottom:7px;
            ">

              <strong>
                ${escapeHtml(f.nombre)}
              </strong>

              <span>
                ${total}
              </span>

            </div>

            <div class="bar">

              <i style="
                width:${porcentaje}%;
              "></i>

            </div>

          </div>

          `;

        }
      ).join("");

  }

}


/* =========================================================
   CARGAR ALUMNOS DESDE GOOGLE
   Code.gs utiliza: listStudents
   ========================================================= */

async function cargarAlumnos() {

  const rows =
    document.getElementById(
      "studentRows"
    );

  if (!rows) return;


  rows.innerHTML = `

    <tr>

      <td
        colspan="7"
        class="empty"
      >
        Cargando alumnos…

      </td>

    </tr>

  `;


  const respuesta =
    await bstvGoogle(
      "listStudents"
    );


  if (respuesta.ok) {

    BSTV_ALUMNOS =
      respuesta.estudiantes ||
      respuesta.alumnos ||
      [];

  } else {

    BSTV_ALUMNOS = [];

    rows.innerHTML = `

      <tr>

        <td
          colspan="7"
          class="empty"
        >
          No se pudieron cargar
          los alumnos.

        </td>

      </tr>

    `;

    console.error(
      "BSTV listStudents:",
      respuesta.error
    );

  }


  renderAlumnos();

  renderFormaciones();

  actualizarDashboard();

}


/* =========================================================
   MOSTRAR ALUMNOS
   ========================================================= */

function renderAlumnos(
  lista = BSTV_ALUMNOS
) {

  const rows =
    document.getElementById(
      "studentRows"
    );

  if (!rows) return;


  if (!lista.length) {

    rows.innerHTML = `

      <tr>

        <td
          colspan="7"
          class="empty"
        >
          No hay alumnos registrados.

        </td>

      </tr>

    `;

    return;
  }


  rows.innerHTML =
    lista.map(
      a => `

      <tr>

        <td>

          <strong>
            ${escapeHtml(
              a.id || ""
            )}
          </strong>

        </td>


        <td>

          <strong>

            ${escapeHtml(
              (
                (a.nombre || "") +
                " " +
                (
                  a.apellido ||
                  a.apellidos ||
                  ""
                )
              ).trim()
            )}

          </strong>

          <br>

          <small>

            ${escapeHtml(
              a["correo electrónico"] ||
              a.correo ||
              a.email ||
              ""
            )}

          </small>

        </td>


        <td>

          ${escapeHtml(
            a.formación ||
            a.formacion ||
            ""
          )}

        </td>


        <td>

          ${escapeHtml(
            a.curso ||
            ""
          )}

        </td>


        <td>

          ${escapeHtml(
            a.estado ||
            ""
          )}

        </td>


        <td>

          ${escapeHtml(
            a.teléfono ||
            a.telefono ||
            ""
          )}

        </td>


        <td>

          <button
            class="secondary"
            type="button"
            data-delete="${escapeHtml(
              a.id || ""
            )}"
          >

            Eliminar

          </button>

        </td>

      </tr>

      `
    ).join("");


  rows
    .querySelectorAll(
      "[data-delete]"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          eliminarAlumnoUI(
            btn.dataset.delete
          );

        }
      );

    });

}


/* =========================================================
   FILTRAR FORMACIÓN
   ========================================================= */

function filtrarFormacion(
  formacion
) {

  const boton =
    document.querySelector(
      '[data-view="students"]'
    );

  if (boton) {

    boton.click();

  }


  const lista =
    BSTV_ALUMNOS.filter(
      a =>

        normalizar(
          a.formación ||
          a.formacion
        ) ===
        normalizar(
          formacion
        )

    );


  renderAlumnos(
    lista
  );


  const buscador =
    document.getElementById(
      "studentSearch"
    );


  if (buscador) {

    buscador.value =
      formacion;

  }

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function actualizarDashboard() {

  const kpi =
    document.getElementById(
      "kpiStudents"
    );

  const active =
    document.getElementById(
      "kpiActive"
    );


  if (kpi) {

    kpi.textContent =
      BSTV_ALUMNOS.length;

  }


  if (active) {

    active.textContent =
      BSTV_ALUMNOS.filter(
        a =>

          [
            "activo",
            "matriculado"
          ].includes(
            normalizar(
              a.estado
            )
          )
      ).length;

  }


  renderFormaciones();

}


/* =========================================================
   ABRIR NUEVO ALUMNO
   ========================================================= */

function abrirNuevoAlumno() {

  const modal =
    document.getElementById(
      "studentModal"
    );

  const form =
    document.getElementById(
      "studentForm"
    );


  if (!modal || !form) {

    alert(
      "No se encontró el formulario de alumnos."
    );

    return;

  }


  form.reset();


  const fecha =
    form.querySelector(
      '[name="date"]'
    );


  if (fecha) {

    fecha.value =
      new Date()
        .toISOString()
        .slice(0,10);

  }


  modal.style.display =
    "flex";

  modal.classList.add(
    "open"
  );


  setTimeout(
    () => {

      form
        .querySelector(
          '[name="name"]'
        )
        ?.focus();

    },
    50
  );

}


/* =========================================================
   CERRAR NUEVO ALUMNO
   ========================================================= */

function cerrarNuevoAlumno() {

  const modal =
    document.getElementById(
      "studentModal"
    );

  if (!modal) return;


  modal.style.display =
    "none";

  modal.classList.remove(
    "open"
  );

}


/* =========================================================
   GUARDAR ALUMNO
   Code.gs utiliza: estudiante
   ========================================================= */

async function guardarAlumno(e) {

  e.preventDefault();


  const form =
    e.currentTarget;


  const raw =
    Object.fromEntries(
      new FormData(form).entries()
    );


  if (
    !raw.name ||
    !raw.surname ||
    !raw.formation
  ) {

    alert(
      "Completa Nombre, Apellidos y Formación."
    );

    return;

  }


  const boton =
    form.querySelector(
      'button[type="submit"]'
    );


  if (boton) {

    boton.disabled =
      true;

    boton.textContent =
      "Guardando…";

  }


  /*
   * IMPORTANTE:
   * Code.gs recibe directamente
   * los siguientes nombres.
   */

  const datos = {

    nombre:
      raw.name,

    apellido:
      raw.surname,

    dni:
      raw.dni || "",

    telefono:
      raw.phone || "",

    "correo electrónico":
      raw.email || "",

    ciudad:
      raw.city || "",

    formación:
      raw.formation || "",

    curso:
      raw.course || "",

    estado:
      raw.status ||
      "Matriculado"

  };


  /*
   * Code.gs:
   *
   * case "estudiante":
   *   agregarAlumno(datos)
   */

  const respuesta =
    await bstvGoogle(
      "estudiante",
      datos
    );


  if (!respuesta.ok) {

    if (boton) {

      boton.disabled =
        false;

      boton.textContent =
        "Guardar alumno";

    }


    alert(

      "❌ No se ha podido guardar el alumno.\n\n" +

      (
        respuesta.error ||
        "El servidor no aceptó la operación."
      )

    );


    console.error(
      "BSTV estudiante:",
      respuesta
    );

    return;

  }


  const nuevo = {

    id:
      respuesta.id ||
      "",

    ...datos,

    drive:
      respuesta.unidad ||
      ""

  };


  BSTV_ALUMNOS.push(
    nuevo
  );


  cerrarNuevoAlumno();


  renderAlumnos();

  renderFormaciones();

  actualizarDashboard();


  alert(

    "✅ ALUMNO REGISTRADO CORRECTAMENTE\n\n" +

    "ID: " +
    (
      respuesta.id ||
      "Generado por Google"
    ) +

    "\n\n" +

    "Google Sheets: ✓\n" +

    "Google Drive: ✓"

  );

}


/* =========================================================
   BÚSQUEDA
   ========================================================= */

function configurarBusqueda() {

  const input =
    document.getElementById(
      "studentSearch"
    );


  if (!input) return;


  input.addEventListener(
    "input",
    () => {

      const q =
        normalizar(
          input.value.trim()
        );


      if (!q) {

        renderAlumnos();

        return;

      }


      const filtrados =
        BSTV_ALUMNOS.filter(
          a => {

            const texto = [

              a.id,

              a.nombre,

              a.apellido,

              a.apellidos,

              a[
                "correo electrónico"
              ],

              a.formación,

              a.formacion,

              a.telefono,

              a.teléfono,

              a.dni

            ].join(" ");


            return normalizar(
              texto
            ).includes(q);

          }
        );


      renderAlumnos(
        filtrados
      );

    }
  );

}


/* =========================================================
   OTROS BOTONES
   ========================================================= */

function configurarBotonesSecundarios() {

  document
    .getElementById(
      "newCourseBtn"
    )
    ?.addEventListener(
      "click",
      () =>

        abrirModalGenerico(
          "Nuevo curso",
          [
            [
              "nombre",
              "Curso"
            ],
            [
              "formacion",
              "Formación"
            ],
            [
              "anio",
              "Año académico"
            ],
            [
              "profesor",
              "Profesor"
            ]
          ]
        )

    );


  document
    .getElementById(
      "newAttendanceBtn"
    )
    ?.addEventListener(
      "click",
      () =>

        abrirModalGenerico(
          "Registrar asistencia",
          [
            [
              "fecha",
              "Fecha"
            ],
            [
              "estudiante",
              "Alumno"
            ],
            [
              "formacion",
              "Formación"
            ],
            [
              "asignatura",
              "Asignatura"
            ],
            [
              "estado",
              "Estado"
            ]
          ]
        )

    );


  document
    .getElementById(
      "newGradeBtn"
    )
    ?.addEventListener(
      "click",
      () =>

        abrirModalGenerico(
          "Nueva calificación",
          [
            [
              "estudiante",
              "Alumno"
            ],
            [
              "formacion",
              "Formación"
            ],
            [
              "asignatura",
              "Asignatura"
            ],
            [
              "examen",
              "Examen"
            ],
            [
              "final",
              "Nota final"
            ]
          ]
        )

    );


  document
    .getElementById(
      "newCertificateBtn"
    )
    ?.addEventListener(
      "click",
      () =>

        abrirModalGenerico(
          "Nuevo certificado",
          [
            [
              "estudiante",
              "Alumno"
            ],
            [
              "formacion",
              "Formación"
            ],
            [
              "fecha",
              "Fecha"
            ],
            [
              "estado",
              "Estado"
            ]
          ]
        )

    );

}


/* =========================================================
   MODAL GENÉRICO
   ========================================================= */

function abrirModalGenerico(
  titulo,
  campos
) {

  const modal =
    document.getElementById(
      "genericModal"
    );

  const title =
    document.getElementById(
      "genericTitle"
    );

  const fields =
    document.getElementById(
      "genericFields"
    );


  if (
    !modal ||
    !title ||
    !fields
  ) return;


  title.textContent =
    titulo;


  fields.innerHTML =
    campos.map(
      ([name,label]) => `

        <label>

          ${escapeHtml(label)}

          <input
            name="${escapeHtml(name)}"
            required
          >

        </label>

      `
    ).join("");


  modal.style.display =
    "flex";

  modal.classList.add(
    "open"
  );

}


function cerrarModalGenerico() {

  const modal =
    document.getElementById(
      "genericModal"
    );


  if (!modal) return;


  modal.style.display =
    "none";

  modal.classList.remove(
    "open"
  );

}


/* =========================================================
   ELIMINAR
   ========================================================= */

function eliminarAlumnoUI(id) {

  alert(

    "La eliminación está desactivada temporalmente para proteger los datos.\n\n" +

    "ID: " +
    id

  );

}


/* =========================================================
   EXPORTAR CSV
   ========================================================= */

function exportarCSV() {

  if (
    !BSTV_ALUMNOS.length
  ) {

    alert(
      "No hay alumnos para exportar."
    );

    return;

  }


  const encabezados = [

    "ID",
    "Nombre",
    "Apellidos",
    "DNI/NIE",
    "Teléfono",
    "Email",
    "Localidad",
    "Formación",
    "Curso",
    "Estado",
    "Drive"

  ];


  const filas =
    BSTV_ALUMNOS.map(
      a => [

        a.id || "",

        a.nombre || "",

        a.apellido ||
        a.apellidos ||
        "",

        a.dni ||
        a["DNI/NIE"] ||
        "",

        a.telefono ||
        a.teléfono ||
        "",

        a[
          "correo electrónico"
        ] ||
        a.correo ||
        "",

        a.ciudad ||
        "",

        a.formación ||
        a.formacion ||
        "",

        a.curso ||
        "",

        a.estado ||
        "",

        a.drive ||
        ""

      ]
    );


  const csv =
    [
      encabezados,
      ...filas
    ]

      .map(
        fila =>

          fila
            .map(
              valor =>
                `"${String(valor)
                  .replace(
                    /"/g,
                    '""'
                  )}"`
            )
            .join(",")
      )

      .join("\n");


  const blob =
    new Blob(
      [
        "\ufeff" +
        csv
      ],
      {
        type:
          "text/csv;charset=utf-8"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const a =
    document.createElement(
      "a"
    );


  a.href =
    url;

  a.download =
    "BSTV_ALUMNOS.csv";


  document.body.appendChild(
    a
  );

  a.click();

  a.remove();


  URL.revokeObjectURL(
    url
  );

}


/* =========================================================
   UTILIDADES
   ========================================================= */

function normalizar(
  value
) {

  return String(
    value ?? ""
  )

    .normalize("NFD")

    .replace(
      /[\u0300-\u036f]/g,
      ""
    )

    .toLowerCase()

    .trim();

}


function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   INICIO DE LA APLICACIÓN
   ========================================================= */

function iniciarBSTV() {

  iniciarNavegacionBSTV();

  configurarBusqueda();

  configurarBotonesSecundarios();


  const nuevoAlumno =
    document.getElementById(
      "newStudentBtn"
    );

  if (nuevoAlumno) {

    nuevoAlumno.addEventListener(
      "click",
      abrirNuevoAlumno
    );

  }


  const cerrar =
    document.getElementById(
      "closeModal"
    );

  if (cerrar) {

    cerrar.addEventListener(
      "click",
      cerrarNuevoAlumno
    );

  }


  const cancelar =
    document.getElementById(
      "cancelModal"
    );

  if (cancelar) {

    cancelar.addEventListener(
      "click",
      cerrarNuevoAlumno
    );

  }


  const formulario =
    document.getElementById(
      "studentForm"
    );

  if (formulario) {

    formulario.addEventListener(
      "submit",
      guardarAlumno
    );

  }


  const modalAlumno =
    document.getElementById(
      "studentModal"
    );

  if (modalAlumno) {

    modalAlumno.addEventListener(
      "click",
      e => {

        if (
          e.target.id ===
          "studentModal"
        ) {

          cerrarNuevoAlumno();

        }

      }
    );

  }


  const cerrarGenerico =
    document.getElementById(
      "closeGeneric"
    );

  if (cerrarGenerico) {

    cerrarGenerico.addEventListener(
      "click",
      cerrarModalGenerico
    );

  }


  const cancelarGenerico =
    document.getElementById(
      "cancelGeneric"
    );

  if (cancelarGenerico) {

    cancelarGenerico.addEventListener(
      "click",
      cerrarModalGenerico
    );

  }


  const modalGenerico =
    document.getElementById(
      "genericModal"
    );

  if (modalGenerico) {

    modalGenerico.addEventListener(
      "click",
      e => {

        if (
          e.target.id ===
          "genericModal"
        ) {

          cerrarModalGenerico();

        }

      }
    );

  }


  const exportar =
    document.getElementById(
      "exportBtn"
    );

  if (exportar) {

    exportar.addEventListener(
      "click",
      exportarCSV
    );

  }


  bstvCheckGoogle();

  cargarAlumnos();

}


/* =========================================================
   ARRANQUE
   ========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    iniciarBSTV
  );

} else {

  iniciarBSTV();

}
