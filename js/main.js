
let Participantes;
let ChoseParticipantes;
async function loadedWindow() {
  document.getElementById('instructionAccess').removeAttribute('hidden')
  Participantes = await Usuarios.getActiveUsers();
  await loadPage("./html/capacitaciones.html");
  await UI_Capacitaciones.loadAreas();
  await UI_Capacitaciones.loadParticipantes();
}
async function loadPage(srcPage, body = interface) {
  let response;
  try {
    response = await fetch(srcPage);
    response = await response.text();
    body.innerHTML = response;
  } catch (e) {
    console.log(e);
  }
}
function arrayToObject(arr) {
  // Obtenemos los encabezados del array
  var headers = arr[0];
  // Creamos un nuevo array para almacenar los objetos transformados
  var newData = [];
  // Iteramos desde 1 para evitar el primer elemento que son los encabezados
  for (var i = 1; i < arr.length; i++) {
    var obj = {};
    // Iteramos a través de cada elemento del array actual
    for (var j = 0; j < headers.length; j++) {
      // Usamos los encabezados como claves y asignamos los valores correspondientes
      obj[headers[j].toLowerCase()] = arr[i][j];
    }
    newData.push(obj); // Agregamos el objeto al nuevo array
  }
  return newData; // Devolvemos el nuevo array de objetos
}
function objectToArray(obj, arr) {
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i];
    if (obj.hasOwnProperty(item)) {
      arr[i] = obj[item];
    } else {
      arr[i] = ""; // Cambia el contenido del array por un string vacío si el item no está presente
    }
  }
  return arr;
}
function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
class UI {
  static isValidForm(event, form) {
    if (form.checkValidity()) {
      event.preventDefault();
    }
    form.classList.add("was-validated");
    return form.checkValidity();
  }
  /* Modal */
  static modalShow(titulo, body) {
    var myModalShow = new bootstrap.Modal(
      document.getElementById("myModalMessage")
    );
    var titleModal = document.querySelector(`#myModalMessage .modal-title`);
    titleModal.innerText = titulo;
    var bodyModal = document.querySelector(`#myModalMessage .modal-body`);
    bodyModal.innerHTML = body;
    myModalShow.show();
  }
  static modalShowLoad() {
    var myModalShow = new bootstrap.Modal(
      document.getElementById("myModalMessageloaded")
    );
    myModalShow.show();
  }
  static modalHide(input = "myModalMessage") {
    var modalElement = document.getElementById(input);
    var modal = bootstrap.Modal.getInstance(modalElement); // Obtener la instancia del modal
    if (modal) {
      modal.hide(); // Ocultar el modal si existe una instancia
    }
  }
}
function openGAP() {
  window.open('https://script.google.com/macros/s/AKfycbwWG7JQi3tLD6aU072m1YImmPf6FH4qBUo7wWRgF4q8BZfaOQKb3mfymVAdguSRa2feMw/exec', '_blank', 'width=370,height=400');
}

