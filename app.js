/* ============================================================
   BSTV 2.0
   SISTEMA DE GESTIÓN ACADÉMICA
   app.js — VERSIÓN COMPLETA
   ============================================================ */

"use strict";


/* ============================================================
   CONFIGURACIÓN GOOGLE
   ============================================================ */

function BSTV_API() {

    if (
        window.BSTV_CONFIG &&
        window.BSTV_CONFIG.APPS_SCRIPT_URL
    ) {
        return window.BSTV_CONFIG.APPS_SCRIPT_URL;
    }

    return "";
}


/* ============================================================
   COMUNICACIÓN CON GOOGLE APPS SCRIPT
   ============================================================ */

async function bstvGoogle(action, payload = {}) {

    const url = BSTV_API();

    if (!url) {

        return {
            ok: false,
            error: "No hay URL de Google Apps Script configurada."
        };

    }

    try {

        const respuesta = await fetch(
            url,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify({
                    action: action,
                    ...payload
                })
            }
        );


        const texto =
            await respuesta.text();


        try {

            return JSON.parse(texto);

        } catch (error) {

            console.error(
                "Respuesta de Google no válida:",
                texto
            );

            return {
                ok: false,
                error:
                    "Google devolvió una respuesta no válida."
            };

        }

    } catch (error) {

        console.error(
            "Error conectando con Google:",
            error
        );

        return {
            ok: false,
            error:
                "No se pudo contactar con Google: " +
                error.message
        };

    }

}


/* ============================================================
   COMPROBAR CONEXIÓN GOOGLE
   ============================================================ */

async function bstvCheckGoogle() {

    const elemento =
        document.getElementById(
            "cloudStatus"
        );

    if (!elemento) return;


    const url = BSTV_API();


    if (!url) {

        elemento.textContent =
            "⚠️ Google no configurado";

        elemento.className =
            "cloud";

        return;

    }


    try {

        const respuesta =
            await fetch(
                url,
                {
                    cache: "no-store"
                }
            );


        const datos =
            await respuesta.json();


        if (datos && datos.ok) {

            elemento.textContent =
                "☁️ Google conectado correctamente";

            elemento.className =
                "cloud ok";

        } else {

            elemento.textContent =
                "⚠️ Google no conectado";

            elemento.className =
                "cloud";

        }

    } catch (error) {

        console.error(error);

        elemento.textContent =
            "⚠️ Google no conectado";

        elemento.className =
            "cloud";

    }

}


/* ============================================================
   FORMACIONES OFICIALES BSTV
   ============================================================ */

const BSTV_FORMACIONES = [

    {
        id: "BSTV-INFANTIL",
        nombre: "BSTV INFANTIL",
        descripcion:
            "Formación bíblica para niños."
    },

    {
        id: "BSTV-HERMANOS",
        nombre: "BSTV HERMANOS",
        descripcion:
            "Formación bíblica para hermanos."
    },

    {
        id: "BSTV-BENDECIDAS",
        nombre: "BSTV BENDECIDAS",
        descripcion:
            "Formación bíblica para mujeres."
    }

];


/* ============================================================
   UTILIDADES
   ============================================================ */

function escaparHTML(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function normalizar(valor) {

    return String(
        valor || ""
    )
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );

}


/* ============================================================
   NAVEGACIÓN PRINCIPAL
   ============================================================ */

function iniciarNavegacionBSTV() {

    const botones =
        document.querySelectorAll(
            ".nav[data-view]"
        );

    const vistas =
        document.querySelectorAll(
            ".view"
        );

    const titulo =
        document.getElementById(
            "pageTitle"
        );


    if (!botones.length) {

        console.warn(
            "BSTV: no se encontraron botones de navegación."
        );

        return;

    }


    const titulos = {

        dashboard:
            "Panel de administración",

        students:
            "Alumnos",

        formations:
            "Formaciones",

        courses:
            "Cursos y asignaturas",

        attendance:
            "Control de asistencia",

        grades:
            "Evaluación",

        certificates:
            "Certificados",

        reports:
            "Informes"

    };


    function abrirVista(id) {

        vistas.forEach(
            function (vista) {

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

            }
        );


        botones.forEach(
            function (boton) {

                boton.classList.toggle(
                    "active",
                    boton.dataset.view === id
                );

            }
        );


        if (titulo) {

            titulo.textContent =
                titulos[id] ||
                "BSTV 2.0";

        }


        /*
         * Cargar información específica
         */

        if (id === "dashboard") {

            actualizarDashboard();

        }


        if (id === "students") {

            cargarAlumnos();

        }


        if (id === "formations") {

            cargarFormaciones();

        }


        if (id === "courses") {

            cargarCursos();

        }


        if (id === "attendance") {

            cargarAsistencia();

        }


        if (id === "grades") {

            cargarCalificaciones();

        }


        if (id === "certificates") {

            cargarCertificados();

        }

    }


    botones.forEach(
        function (boton) {

            boton.addEventListener(
                "click",
                function (evento) {

                    evento.preventDefault();

                    abrirVista(
                        this.dataset.view
                    );

                }
            );

        }
    );


    const inicial =
        document.querySelector(
            ".nav.active[data-view]"
        )?.dataset.view ||
        "dashboard";


    abrirVista(inicial);

}


/* ============================================================
   FORMACIONES
   ============================================================ */

function cargarFormaciones() {

    const contenedor =
        document.getElementById(
            "formationCards"
        );

    if (!contenedor) return;


    contenedor.innerHTML = "";


    BSTV_FORMACIONES.forEach(
        function (formacion) {

            const tarjeta =
                document.createElement(
                    "div"
                );


            tarjeta.className =
                "card";


            tarjeta.innerHTML = `

                <span>FORMACIÓN OFICIAL</span>

                <strong>
                    ${escaparHTML(
                        formacion.nombre
                    )}
                </strong>

                <p>
                    ${escaparHTML(
                        formacion.descripcion
                    )}
                </p>

            `;


            contenedor.appendChild(
                tarjeta
            );

        }
    );

}


/* ============================================================
   CARGAR ALUMNOS
   ============================================================ */

async function cargarAlumnos() {

    const tbody =
        document.getElementById(
            "studentRows"
        );

    if (!tbody) return;


    tbody.innerHTML = `

        <tr>
            <td colspan="7">
                Cargando alumnos...
            </td>
        </tr>

    `;


    const respuesta =
        await bstvGoogle(
            "listStudents"
        );


    if (
        !respuesta ||
        !respuesta.ok
    ) {

        tbody.innerHTML = `

            <tr>
                <td colspan="7">
                    No se pudieron cargar los alumnos.
                </td>
            </tr>

        `;

        console.error(
            respuesta?.error
        );

        return;

    }


    const alumnos =
        Array.isArray(
            respuesta.estudiantes
        )
            ? respuesta.estudiantes
            : [];


    window.BSTV_ALUMNOS =
        alumnos;


    pintarAlumnos(
        alumnos
    );


    actualizarDashboard();

}


/* ============================================================
   PINTAR ALUMNOS
   ============================================================ */

function pintarAlumnos(alumnos) {

    const tbody =
        document.getElementById(
            "studentRows"
        );

    if (!tbody) return;


    if (!alumnos.length) {

        tbody.innerHTML = `

            <tr>
                <td colspan="7">
                    No hay alumnos registrados.
                </td>
            </tr>

        `;

        return;

    }


    tbody.innerHTML = "";


    alumnos.forEach(
        function (alumno) {

            const fila =
                document.createElement(
                    "tr"
                );


            const nombreCompleto =

                (
                    alumno.nombre ||
                    ""
                ) +
                " " +
                (
                    alumno.apellidos ||
                    alumno.apellido ||
                    ""
                );


            fila.innerHTML = `

                <td>
                    <strong>
                        ${escaparHTML(
                            alumno.id
                        )}
                    </strong>
                </td>

                <td>

                    <strong>
                        ${escaparHTML(
                            nombreCompleto.trim()
                        )}
                    </strong>

                    <small>
                        ${escaparHTML(
                            alumno.email
                        )}
                    </small>

                </td>

                <td>
                    ${escaparHTML(
                        alumno.formacion
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        alumno.curso
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        alumno.estado ||
                        alumno.status
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        alumno.telefono ||
                        alumno.phone
                    )}
                </td>

                <td>

                    <button
                        class="secondary deleteStudent"
                        data-id="${escaparHTML(
                            alumno.id
                        )}">
                        Eliminar
                    </button>

                </td>

            `;


            tbody.appendChild(
                fila
            );

        }
    );

}


/* ============================================================
   BUSCADOR DE ALUMNOS
   ============================================================ */

function iniciarBuscador() {

    const buscador =
        document.getElementById(
            "studentSearch"
        );


    if (!buscador) return;


    buscador.addEventListener(
        "input",
        function () {

            const texto =
                normalizar(
                    this.value
                );


            const alumnos =
                window.BSTV_ALUMNOS ||
                [];


            if (!texto) {

                pintarAlumnos(
                    alumnos
                );

                return;

            }


            const filtrados =
                alumnos.filter(
                    function (alumno) {

                        const contenido =

                            normalizar(
                                alumno.id
                            ) +
                            " " +

                            normalizar(
                                alumno.nombre
                            ) +
                            " " +

                            normalizar(
                                alumno.apellidos
                            ) +
                            " " +

                            normalizar(
                                alumno.email
                            ) +
                            " " +

                            normalizar(
                                alumno.formacion
                            );


                        return contenido.includes(
                            texto
                        );

                    }
                );


            pintarAlumnos(
                filtrados
            );

        }
    );

}


/* ============================================================
   DASHBOARD
   ============================================================ */

async function actualizarDashboard() {

    const alumnos =
        window.BSTV_ALUMNOS ||
        [];


    const contadorAlumnos =
        document.getElementById(
            "kpiStudents"
        );


    const contadorActivos =
        document.getElementById(
            "kpiActive"
        );


    if (contadorAlumnos) {

        contadorAlumnos.textContent =
            alumnos.length;

    }


    const activos =
        alumnos.filter(
            function (alumno) {

                const estado =
                    normalizar(
                        alumno.estado ||
                        alumno.status
                    );


                return (
                    estado === "activo" ||
                    estado === "matriculado"
                );

            }
        );


    if (contadorActivos) {

        contadorActivos.textContent =
            activos.length;

    }


    pintarEstadisticasFormacion(
        alumnos
    );


    if (
        !window.BSTV_ALUMNOS.length
    ) {

        try {

            const respuesta =
                await bstvGoogle(
                    "listStudents"
                );


            if (
                respuesta &&
                respuesta.ok
            ) {

                window.BSTV_ALUMNOS =
                    respuesta.estudiantes ||
                    [];


                const lista =
                    window.BSTV_ALUMNOS;


                if (contadorAlumnos) {

                    contadorAlumnos.textContent =
                        lista.length;

                }


                const activos2 =
                    lista.filter(
                        function (alumno) {

                            const estado =
                                normalizar(
                                    alumno.estado ||
                                    alumno.status
                                );


                            return (
                                estado ===
                                "activo" ||
                                estado ===
                                "matriculado"
                            );

                        }
                    );


                if (contadorActivos) {

                    contadorActivos.textContent =
                        activos2.length;

                }


                pintarEstadisticasFormacion(
                    lista
                );

            }

        } catch (error) {

            console.error(
                error
            );

        }

    }

}


/* ============================================================
   ESTADÍSTICAS POR FORMACIÓN
   ============================================================ */

function pintarEstadisticasFormacion(
    alumnos
) {

    const contenedor =
        document.getElementById(
            "formationStats"
        );

    if (!contenedor) return;


    contenedor.innerHTML = "";


    BSTV_FORMACIONES.forEach(
        function (formacion) {

            const cantidad =
                alumnos.filter(
                    function (alumno) {

                        return normalizar(
                            alumno.formacion
                        ) ===
                        normalizar(
                            formacion.nombre
                        );

                    }
                ).length;


            const fila =
                document.createElement(
                    "div"
                );


            fila.style.marginBottom =
                "18px";


            fila.innerHTML = `

                <div style="
                    display:flex;
                    justify-content:space-between;
                    margin-bottom:6px;
                ">

                    <strong>
                        ${escaparHTML(
                            formacion.nombre
                        )}
                    </strong>

                    <span>
                        ${cantidad}
                    </span>

                </div>

                <div style="
                    height:8px;
                    background:#e8eef5;
                    border-radius:20px;
                    overflow:hidden;
                ">

                    <div style="
                        width:${
                            alumnos.length
                                ? Math.min(
                                    100,
                                    (
                                        cantidad /
                                        alumnos.length
                                    ) * 100
                                )
                                : 0
                        }%;
                        height:100%;
                        background:#1769aa;
                        border-radius:20px;
                    "></div>

                </div>

            `;


            contenedor.appendChild(
                fila
            );

        }
    );

}


/* ============================================================
   NUEVO ALUMNO
   ============================================================ */

function abrirNuevoAlumno() {

    const modal =
        document.getElementById(
            "studentModal"
        );


    const formulario =
        document.getElementById(
            "studentForm"
        );


    if (!modal) {

        console.error(
            "No existe studentModal."
        );

        return;

    }


    if (formulario) {

        formulario.reset();


        const fecha =
            formulario.querySelector(
                '[name="date"]'
            );


        if (fecha) {

            fecha.value =
                new Date()
                    .toISOString()
                    .substring(
                        0,
                        10
                    );

        }

    }


    modal.style.display =
        "flex";


    modal.classList.add(
        "open"
    );

}


/* ============================================================
   CERRAR MODAL ALUMNO
   ============================================================ */

function cerrarModalAlumno() {

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


/* ============================================================
   GUARDAR ALUMNO
   ============================================================ */

async function guardarAlumno(evento) {

    evento.preventDefault();


    const formulario =
        evento.target;


    const datos =
        Object.fromEntries(
            new FormData(
                formulario
            ).entries()
        );


    const boton =
        formulario.querySelector(
            'button[type="submit"]'
        );


    if (boton) {

        boton.disabled = true;

        boton.textContent =
            "Guardando...";

    }


    try {

        const respuesta =
            await bstvGoogle(
                "estudiante",
                datos
            );


        if (
            respuesta &&
            respuesta.ok
        ) {

            cerrarModalAlumno();


            formulario.reset();


            alert(
                "✅ Alumno registrado correctamente."
            );


            await cargarAlumnos();


        } else {

            alert(

                "❌ No se pudo registrar el alumno.\n\n" +

                (
                    respuesta?.error ||
                    "Error desconocido."
                )

            );

        }

    } catch (error) {

        console.error(error);

        alert(
            "❌ Error al guardar el alumno."
        );

    }


    if (boton) {

        boton.disabled = false;

        boton.textContent =
            "Guardar alumno";

    }

}


/* ============================================================
   MODAL GENÉRICO
   ============================================================ */

function abrirModalGenerico(
    titulo,
    campos
) {

    const modal =
        document.getElementById(
            "genericModal"
        );


    const tituloElemento =
        document.getElementById(
            "genericTitle"
        );


    const contenedor =
        document.getElementById(
            "genericFields"
        );


    if (!modal) {

        console.error(
            "No existe genericModal."
        );

        return;

    }


    if (tituloElemento) {

        tituloElemento.textContent =
            titulo;

    }


    if (contenedor) {

        contenedor.innerHTML = "";


        campos.forEach(
            function (campo) {

                const nombre =
                    campo[0];


                const etiqueta =
                    campo[1];


                const label =
                    document.createElement(
                        "label"
                    );


                label.textContent =
                    etiqueta;


                let control;


                /*
                 * Formación
                 */

                if (
                    nombre ===
                    "formacion"
                ) {

                    control =
                        document.createElement(
                            "select"
                        );


                    control.name =
                        nombre;


                    control.required =
                        true;


                    const opcionInicial =
                        document.createElement(
                            "option"
                        );


                    opcionInicial.value =
                        "";


                    opcionInicial.textContent =
                        "Seleccionar...";


                    control.appendChild(
                        opcionInicial
                    );


                    BSTV_FORMACIONES.forEach(
                        function (
                            formacion
                        ) {

                            const opcion =
                                document.createElement(
                                    "option"
                                );


                            opcion.value =
                                formacion.nombre;


                            opcion.textContent =
                                formacion.nombre;


                            control.appendChild(
                                opcion
                            );

                        }
                    );

                }

                /*
                 * Fecha
                 */

                else if (
                    nombre ===
                    "fecha"
                ) {

                    control =
                        document.createElement(
                            "input"
                        );


                    control.type =
                        "date";


                    control.name =
                        nombre;


                    control.value =
                        new Date()
                            .toISOString()
                            .substring(
                                0,
                                10
                            );

                }

                /*
                 * Estado
                 */

                else if (
                    nombre ===
                    "estado"
                ) {

                    control =
                        document.createElement(
                            "select"
                        );


                    control.name =
                        nombre;


                    const estados = [

                        "Presente",
                        "Ausente",
                        "Justificada",
                        "Pendiente",
                        "Aprobado",
                        "Finalizado"

                    ];


                    estados.forEach(
                        function (
                            estado
                        ) {

                            const opcion =
                                document.createElement(
                                    "option"
                                );


                            opcion.value =
                                estado;


                            opcion.textContent =
                                estado;


                            control.appendChild(
                                opcion
                            );

                        }
                    );

                }

                /*
                 * Campo normal
                 */

                else {

                    control =
                        document.createElement(
                            "input"
                        );


                    control.name =
                        nombre;


                    control.type =
                        nombre ===
                        "examen" ||
                        nombre ===
                        "final"
                            ? "number"
                            : "text";


                    if (
                        control.type ===
                        "number"
                    ) {

                        control.step =
                            "0.01";

                        control.min =
                            "0";

                        control.max =
                            "10";

                    }

                }


                label.appendChild(
                    control
                );


                contenedor.appendChild(
                    label
                );

            }
        );

    }


    modal.style.display =
        "flex";


    modal.classList.add(
        "open"
    );

}


/* ============================================================
   CERRAR MODAL GENÉRICO
   ============================================================ */

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


/* ============================================================
   GUARDAR OPERACIONES GENÉRICAS
   ============================================================ */

async function guardarOperacionGenerica(
    evento
) {

    evento.preventDefault();


    const formulario =
        evento.target;


    const titulo =
        document.getElementById(
            "genericTitle"
        )?.textContent ||
        "";


    const datos =
        Object.fromEntries(
            new FormData(
                formulario
            ).entries()
        );


    let accion = "";


    if (
        titulo ===
        "Nuevo curso"
    ) {

        accion =
            "curso";

    }


    else if (
        titulo ===
        "Registrar asistencia"
    ) {

        accion =
            "asistencia";

    }


    else if (
        titulo ===
        "Nueva calificación"
    ) {

        accion =
            "grado";

    }


    else if (
        titulo ===
        "Nuevo certificado"
    ) {

        accion =
            "certificado";

    }


    if (!accion) {

        alert(
            "❌ No se pudo determinar la operación."
        );

        return;

    }


    const boton =
        formulario.querySelector(
            'button[type="submit"]'
        );


    if (boton) {

        boton.disabled = true;

        boton.textContent =
            "Guardando...";

    }


    try {

        const respuesta =
            await bstvGoogle(
                accion,
                datos
            );


        if (
            respuesta &&
            respuesta.ok
        ) {

            cerrarModalGenerico();


            formulario.reset();


            alert(
                "✅ Datos guardados correctamente."
            );


            /*
             * Recargar la vista actual
             */

            const vista =
                document.querySelector(
                    ".nav.active"
                )?.dataset.view;


            if (
                vista ===
                "dashboard"
            ) {

                await actualizarDashboard();

            }


            if (
                vista ===
                "courses"
            ) {

                await cargarCursos();

            }


            if (
                vista ===
                "attendance"
            ) {

                await cargarAsistencia();

            }


            if (
                vista ===
                "grades"
            ) {

                await cargarCalificaciones();

            }


            if (
                vista ===
                "certificates"
            ) {

                await cargarCertificados();

            }

        } else {

            alert(

                "❌ No se pudieron guardar los datos.\n\n" +

                (
                    respuesta?.error ||
                    "Error desconocido."
                )

            );

        }

    } catch (error) {

        console.error(error);

        alert(
            "❌ Error de comunicación con Google."
        );

    }


    if (boton) {

        boton.disabled = false;

        boton.textContent =
            "Guardar";

    }

}


/* ============================================================
   NUEVO CURSO
   ============================================================ */

function abrirNuevoCurso() {

    abrirModalGenerico(
        "Nuevo curso",
        [

            [
                "nombre",
                "Nombre del curso"
            ],

            [
                "formacion",
                "Formación"
            ],

            [
                "año",
                "Año académico"
            ],

            [
                "profesor",
                "Profesor"
            ]

        ]
    );

}


/* ============================================================
   ASISTENCIA
   ============================================================ */

function abrirNuevaAsistencia() {

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
    );

}


/* ============================================================
   CALIFICACIÓN
   ============================================================ */

function abrirNuevaCalificacion() {

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
                "Nota del examen"
            ],

            [
                "final",
                "Nota final"
            ]

        ]
    );

}


/* ============================================================
   CERTIFICADO
   ============================================================ */

function abrirNuevoCertificado() {

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
    );

}


/* ============================================================
   CURSOS
   ============================================================ */

async function cargarCursos() {

    const tbody =
        document.getElementById(
            "courseRows"
        );


    if (!tbody) return;


    /*
     * Actualmente Code.gs no tiene listCourses.
     * Mostramos un mensaje informativo.
     */

    tbody.innerHTML = `

        <tr>
            <td colspan="5">
                No hay cursos cargados todavía.
            </td>
        </tr>

    `;

}


/* ============================================================
   ASISTENCIA
   ============================================================ */

async function cargarAsistencia() {

    const tbody =
        document.getElementById(
            "attendanceRows"
        );


    if (!tbody) return;


    tbody.innerHTML = `

        <tr>
            <td colspan="5">
                No hay registros de asistencia todavía.
            </td>
        </tr>

    `;

}


/* ============================================================
   CALIFICACIONES
   ============================================================ */

async function cargarCalificaciones() {

    const tbody =
        document.getElementById(
            "gradeRows"
        );


    if (!tbody) return;


    tbody.innerHTML = `

        <tr>
            <td colspan="5">
                No hay calificaciones registradas todavía.
            </td>
        </tr>

    `;

}


/* ============================================================
   CERTIFICADOS
   ============================================================ */

async function cargarCertificados() {

    const tbody =
        document.getElementById(
            "certificateRows"
        );


    if (!tbody) return;


    tbody.innerHTML = `

        <tr>
            <td colspan="4">
                No hay certificados registrados todavía.
            </td>
        </tr>

    `;

}


/* ============================================================
   EXPORTAR ALUMNOS A CSV
   ============================================================ */

function exportarCSV() {

    const alumnos =
        window.BSTV_ALUMNOS ||
        [];


    if (!alumnos.length) {

        alert(
            "No hay alumnos para exportar."
        );

        return;

    }


    const columnas = [

        "ID",
        "Nombre",
        "Apellidos",
        "DNI/NIE",
        "Teléfono",
        "Email",
        "Localidad",
        "Formación",
        "Curso",
        "Estado"

    ];


    const filas =
        alumnos.map(
            function (alumno) {

                return [

                    alumno.id,

                    alumno.nombre,

                    alumno.apellidos ||
                    alumno.apellido,

                    alumno.dni,

                    alumno.telefono ||
                    alumno.phone,

                    alumno.email,

                    alumno.localidad ||
                    alumno.ciudad,

                    alumno.formacion,

                    alumno.curso,

                    alumno.estado ||
                    alumno.status

                ];

            }
        );


    const csv = [

        columnas,

        ...filas

    ]

        .map(
            function (fila) {

                return fila
                    .map(
                        function (valor) {

                            return '"' +
                                String(
                                    valor ??
                                    ""
                                )
                                .replace(
                                    /"/g,
                                    '""'
                                ) +
                                '"';

                        }
                    )
                    .join(",");

            }
        )
        .join("\n");


    const blob =
        new Blob(
            [
                "\uFEFF" +
                csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const enlace =
        document.createElement(
            "a"
        );


    enlace.href =
        url;


    enlace.download =
        "BSTV_ALUMNOS.csv";


    document.body.appendChild(
        enlace
    );


    enlace.click();


    enlace.remove();


    URL.revokeObjectURL(
        url
    );

}


/* ============================================================
   EVENTOS DE BOTONES
   ============================================================ */

function iniciarEventosBSTV() {


    /*
     * NUEVO ALUMNO
     */

    const nuevoAlumno =
        document.getElementById(
            "newStudentBtn"
        );


    if (nuevoAlumno) {

        nuevoAlumno.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                abrirNuevoAlumno();

            }
        );

    }


    /*
     * NUEVO CURSO
     */

    const nuevoCurso =
        document.getElementById(
            "newCourseBtn"
        );


    if (nuevoCurso) {

        nuevoCurso.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                abrirNuevoCurso();

            }
        );

    }


    /*
     * NUEVA ASISTENCIA
     */

    const nuevaAsistencia =
        document.getElementById(
            "newAttendanceBtn"
        );


    if (nuevaAsistencia) {

        nuevaAsistencia.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                abrirNuevaAsistencia();

            }
        );

    }


    /*
     * NUEVA CALIFICACIÓN
     */

    const nuevaCalificacion =
        document.getElementById(
            "newGradeBtn"
        );


    if (nuevaCalificacion) {

        nuevaCalificacion.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                abrirNuevaCalificacion();

            }
        );

    }


    /*
     * NUEVO CERTIFICADO
     */

    const nuevoCertificado =
        document.getElementById(
            "newCertificateBtn"
        );


    if (nuevoCertificado) {

        nuevoCertificado.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                abrirNuevoCertificado();

            }
        );

    }


    /*
     * BOTÓN EXPORTAR
     */

    const exportar =
        document.getElementById(
            "exportBtn"
        );


    if (exportar) {

        exportar.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                exportarCSV();

            }
        );

    }


    /*
     * CERRAR ALUMNO
     */

    const cerrarAlumno =
        document.getElementById(
            "closeModal"
        );


    if (cerrarAlumno) {

        cerrarAlumno.addEventListener(
            "click",
            function () {

                cerrarModalAlumno();

            }
        );

    }


    /*
     * CANCELAR ALUMNO
     */

    const cancelarAlumno =
        document.getElementById(
            "cancelModal"
        );


    if (cancelarAlumno) {

        cancelarAlumno.addEventListener(
            "click",
            function () {

                cerrarModalAlumno();

            }
        );

    }


    /*
     * CERRAR GENÉRICO
     */

    const cerrarGenerico =
        document.getElementById(
            "closeGeneric"
        );


    if (cerrarGenerico) {

        cerrarGenerico.addEventListener(
            "click",
            function () {

                cerrarModalGenerico();

            }
        );

    }


    /*
     * CANCELAR GENÉRICO
     */

    const cancelarGenerico =
        document.getElementById(
            "cancelGeneric"
        );


    if (cancelarGenerico) {

        cancelarGenerico.addEventListener(
            "click",
            function () {

                cerrarModalGenerico();

            }
        );

    }


    /*
     * FORMULARIO ALUMNO
     */

    const formularioAlumno =
        document.getElementById(
            "studentForm"
        );


    if (formularioAlumno) {

        formularioAlumno.addEventListener(
            "submit",
            guardarAlumno
        );

    }


    /*
     * FORMULARIO GENÉRICO
     */

    const formularioGenerico =
        document.getElementById(
            "genericForm"
        );


    if (formularioGenerico) {

        formularioGenerico.addEventListener(
            "submit",
            guardarOperacionGenerica
        );

    }


    /*
     * CERRAR AL HACER CLIC FUERA
     */

    const modalAlumno =
        document.getElementById(
            "studentModal"
        );


    if (modalAlumno) {

        modalAlumno.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target ===
                    modalAlumno
                ) {

                    cerrarModalAlumno();

                }

            }
        );

    }


    const modalGenerico =
        document.getElementById(
            "genericModal"
        );


    if (modalGenerico) {

        modalGenerico.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target ===
                    modalGenerico
                ) {

                    cerrarModalGenerico();

                }

            }
        );

    }

}


/* ============================================================
   INICIALIZACIÓN
   ============================================================ */

async function iniciarBSTV() {

    console.log(
        "🚀 BSTV 2.0 iniciando..."
    );


    /*
     * Conexión Google
     */

    await bstvCheckGoogle();


    /*
     * Navegación
     */

    iniciarNavegacionBSTV();


    /*
     * Botones
     */

    iniciarEventosBSTV();


    /*
     * Buscador
     */

    iniciarBuscador();


    /*
     * Formaciones
     */

    cargarFormaciones();


    /*
     * Alumnos
     */

    await cargarAlumnos();


    /*
     * Dashboard
     */

    await actualizarDashboard();


    console.log(
        "✅ BSTV 2.0 iniciado correctamente."
    );

}


/* ============================================================
   ARRANQUE
   ============================================================ */

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


/* ============================================================
   FUNCIONES GLOBALES
   ============================================================ */

window.bstvNuevoAlumno =
    abrirNuevoAlumno;

window.bstvNuevoCurso =
    abrirNuevoCurso;

window.bstvNuevaAsistencia =
    abrirNuevaAsistencia;

window.bstvNuevaCalificacion =
    abrirNuevaCalificacion;

window.bstvNuevoCertificado =
    abrirNuevoCertificado;

window.bstvCargarAlumnos =
    cargarAlumnos;

window.bstvActualizarDashboard =
    actualizarDashboard;
