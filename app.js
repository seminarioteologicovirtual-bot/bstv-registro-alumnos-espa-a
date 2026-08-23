const formations=["BSTV INFANTIL","BSTV HERMANOS","BSTV BENDECIDAS"];
let db=JSON.parse(localStorage.getItem("bstv_db")||'{"students":[],"courses":[],"attendance":[],"grades":[],"certificates":[]}');
const $=s=>document.querySelector(s);
const save=()=>localStorage.setItem("bstv_db",JSON.stringify(db));
const nextId=(prefix,arr)=>prefix+String(arr.length+1).padStart(4,"0");
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}
function render(){
 $("#kpiStudents").textContent=db.students.length;
 $("#kpiActive").textContent=db.students.filter(x=>["Activo","Matriculado"].includes(x.status)).length;
 $("#kpiCertificates").textContent=db.certificates.filter(x=>x.status==="Pendiente").length;
 $("#formationStats").innerHTML=formations.map(f=>{let n=db.students.filter(s=>s.formation===f).length,p=db.students.length?Math.round(n/db.students.length*100):0;return `<div style="margin:18px 0"><div style="display:flex;justify-content:space-between"><b>${f}</b><span>${n}</span></div><div class="bar"><i style="width:${p}%"></i></div></div>`}).join("");
 $("#formationCards").innerHTML=formations.map(f=>`<div class="card"><span>Formación oficial</span><strong style="font-size:20px">${f}</strong><p>${db.students.filter(s=>s.formation===f).length} alumnos</p></div>`).join("");
 renderStudents(); renderCourses(); renderAttendance(); renderGrades(); renderCertificates();
}
function renderStudents(){
 $("#studentRows").innerHTML=db.students.map(s=>`<tr><td><b>${esc(s.id)}</b></td><td><b>${esc(s.name)} ${esc(s.surname)}</b><br><small>${esc(s.email)}</small></td><td>${esc(s.formation)}</td><td>${esc(s.course||"—")}</td><td>${esc(s.status)}</td><td>${esc(s.phone||"—")}</td><td><button class="secondary" onclick="deleteStudent('${s.id}')">Eliminar</button></td></tr>`).join("")||`<tr><td colspan="7" class="empty">No hay alumnos registrados.</td></tr>`;
}
function renderCourses(){
 $("#courseRows").innerHTML=db.courses.map(c=>`<tr><td>${esc(c.id)}</td><td>${esc(c.name)}</td><td>${esc(c.formation)}</td><td>${esc(c.year||"—")}</td><td>${esc(c.teacher||"—")}</td></tr>`).join("")||`<tr><td colspan="5" class="empty">No hay cursos configurados.</td></tr>`;
}
function renderAttendance(){
 $("#attendanceRows").innerHTML=db.attendance.map(a=>`<tr><td>${esc(a.date)}</td><td>${esc(a.student)}</td><td>${esc(a.formation)}</td><td>${esc(a.subject||"—")}</td><td>${esc(a.status)}</td></tr>`).join("")||`<tr><td colspan="5" class="empty">No hay registros.</td></tr>`;
}
function renderGrades(){
 $("#gradeRows").innerHTML=db.grades.map(g=>`<tr><td>${esc(g.student)}</td><td>${esc(g.formation)}</td><td>${esc(g.subject)}</td><td>${esc(g.exam||"—")}</td><td>${esc(g.final||"—")}</td></tr>`).join("")||`<tr><td colspan="5" class="empty">No hay calificaciones.</td></tr>`;
}
function renderCertificates(){
 $("#certificateRows").innerHTML=db.certificates.map(c=>`<tr><td>${esc(c.student)}</td><td>${esc(c.formation)}</td><td>${esc(c.date||"—")}</td><td>${esc(c.status)}</td></tr>`).join("")||`<tr><td colspan="4" class="empty">No hay certificados.</td></tr>`;
}
function openModal(title,fields,onSave){
 $("#genericTitle").textContent=title;
 $("#genericFields").innerHTML=fields.map(f=>`<label>${f.label}${f.type==="select"?`<select name="${f.name}">${f.options.map(o=>`<option>${o}</option>`).join("")}</select>`:`<input name="${f.name}" type="${f.type||"text"}" ${f.required?"required":""}>`}</label>`).join("");
 $("#genericModal").classList.add("open");
 $("#genericForm").onsubmit=e=>{e.preventDefault();onSave(Object.fromEntries(new FormData(e.target)));$("#genericModal").classList.remove("open");save();render();};
}
function openStudent(){openModal("Registrar alumno",[
 {name:"name",label:"Nombre",required:true},{name:"surname",label:"Apellidos",required:true},{name:"dni",label:"DNI/NIE"},
 {name:"phone",label:"Teléfono"},{name:"email",label:"Email",type:"email"},{name:"city",label:"Localidad"},
 {name:"formation",label:"Formación",type:"select",options:formations},{name:"course",label:"Curso"},
 {name:"status",label:"Estado",type:"select",options:["Preinscrito","Matriculado","Activo","Pausado","Finalizado","Baja"]},
 {name:"date",label:"Fecha",type:"date"}
],d=>{db.students.push({...d,id:nextId("BSTV-A",db.students),createdAt:new Date().toISOString()});});
}
function openCourse(){openModal("Nuevo curso",[
 {name:"name",label:"Nombre",required:true},{name:"formation",label:"Formación",type:"select",options:formations},
 {name:"year",label:"Curso académico"},{name:"teacher",label:"Profesor"}
],d=>db.courses.push({...d,id:nextId("BSTV-C",db.courses)}));}
function openAttendance(){openModal("Registrar asistencia",[
 {name:"date",label:"Fecha",type:"date",required:true},{name:"student",label:"Alumno",type:"select",options:db.students.map(s=>s.id+" · "+s.name+" "+s.surname)},
 {name:"formation",label:"Formación",type:"select",options:formations},{name:"subject",label:"Asignatura"},
 {name:"status",label:"Estado",type:"select",options:["Presente","Ausente","Ausencia justificada","Retraso"]}
],d=>db.attendance.push(d));}
function openGrade(){openModal("Registrar calificación",[
 {name:"student",label:"Alumno",type:"select",options:db.students.map(s=>s.id+" · "+s.name+" "+s.surname)},
 {name:"formation",label:"Formación",type:"select",options:formations},{name:"subject",label:"Asignatura"},
 {name:"exam",label:"Examen"},{name:"final",label:"Nota final"}
],d=>db.grades.push(d));}
function openCertificate(){openModal("Registrar certificado",[
 {name:"student",label:"Alumno",type:"select",options:db.students.map(s=>s.id+" · "+s.name+" "+s.surname)},
 {name:"formation",label:"Formación",type:"select",options:formations},{name:"date",label:"Fecha",type:"date"},
 {name:"status",label:"Estado",type:"select",options:["Pendiente","Preparado","Entregado"]}
],d=>db.certificates.push(d));}
function deleteStudent(id){if(confirm("¿Eliminar este alumno?")){db.students=db.students.filter(x=>x.id!==id);save();render();}}
document.querySelectorAll(".nav").forEach(btn=>btn.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));btn.classList.add("active");document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));$("#"+btn.dataset.view).classList.add("active");$("#pageTitle").textContent=btn.querySelector("span").textContent});
$("#newStudentBtn").onclick=openStudent;
$("#studentSearch").oninput=e=>{let q=e.target.value.toLowerCase();document.querySelectorAll("#studentRows tr").forEach(r=>r.style.display=r.innerText.toLowerCase().includes(q)?"":"none")};
$("#exportBtn").onclick=()=>{let rows=[["ID","Nombre","Apellidos","Formación","Curso","Estado","Teléfono","Email"],...db.students.map(s=>[s.id,s.name,s.surname,s.formation,s.course,s.status,s.phone,s.email])];let csv=rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="BSTV_alumnos.csv";a.click();};
$("#newCourseBtn").onclick=openCourse; $("#newAttendanceBtn").onclick=openAttendance; $("#newGradeBtn").onclick=openGrade; $("#newCertificateBtn").onclick=openCertificate;
$("#closeGeneric").onclick=()=>$("#genericModal").classList.remove("open");$("#cancelGeneric").onclick=()=>$("#genericModal").classList.remove("open");
render();