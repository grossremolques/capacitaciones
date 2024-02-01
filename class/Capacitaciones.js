const SheetCapacitaciones = "Registro de Capacitaciones!A1:ZZ";
const SheetParticipantes = "Registro de Asistentes!A1:ZZ";
let Capacitaciones;
let btnSubmit;
let bodyModal;
let alertMessageModal;
let message = "";
let colorMessageModal = "danger";
let form;
const DataForm = {};
let IdCapacitacion;
class UI_Capacitaciones {
  static async loadAreas(inputId = "area") {
    try {
      let procesos = await Area.getAllData();
      let input = document.getElementById(inputId);
      input.innerHTML =
        '<option selected value="">Seleccione una opción</option>';
      procesos.map((item) => {
        let option = document.createElement("option");
        let textNode = document.createTextNode(item.nombre);
        option.appendChild(textNode);
        option.value = item.nombre;
        input.appendChild(option);
      });
    } catch (e) {
      console.log(e);
    }
  }
  static async loadParticipantes(data = Participantes) {
    try {
      bodyModal = document.getElementById("bodyModalParticipantes");
      bodyModal.innerHTML = `<p class="text-${colorMessageModal}" id="alertMessageModal">${message}</p>`;
      data.map((item) => {
        let componentInpunt = `
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" value="" id="${item.legajo}" ${item.isChecked} onclick="UI_Capacitaciones.getActionSelect(event)">
                    <label class="form-check-label" for="${item.legajo}">${item.nombreCompleto}</label>
                </div>
                <div class="form-check form-check-inline float-end">
                    <label class="form-check-label" for="isCap_${item.legajo}">Capacitador</label>
                    <input class="form-check-input" type="checkbox" value="" name="${item.legajo}" id="isCap_${item.legajo}" ${item.isCapacitador} onclick="UI_Capacitaciones.getSelectCapacitador(event)">
                </div>
                `;
        let div = document.createElement("div");
        div.innerHTML = componentInpunt;
        bodyModal.appendChild(div);
      });
    } catch (e) {
      console.log(e);
    }
  }
  static filterUsers(event) {
    message = "";
    let word = event.target.value;
    word = normalizeString(word);
    let dataFiltered = Participantes.filter((item) => {
      let normalizedItemName = normalizeString(item.nombreCompleto);
      return normalizedItemName.includes(word);
    });
    this.loadParticipantes(dataFiltered);
  }
  static getActionSelect(event) {
    let legajo = event.target.id;
    const isChecked = event.target.checked;
    let index = Participantes.findIndex((item) => item.legajo === legajo);
    if (isChecked) {
      Participantes[index].isChecked = "checked";
    } else {
      Participantes[index].isChecked = "";
      Participantes[index].isCapacitador = "";
    }
  }
  static getSelectCapacitador(event) {
    let legajo = event.target.name;
    const isChecked = event.target.checked;
    let index = Participantes.findIndex((item) => item.legajo === legajo);
    if (isChecked) {
      Participantes[index].isCapacitador = "checked";
      Participantes[index].isChecked = "checked";
      document.getElementById(legajo).setAttribute("checked", "");
    } else {
      Participantes[index].isCapacitador = "";
    }
  }
  static resumeParticioantes() {
    message = "";
    colorMessageModal = "danger";
    selectedParticipant.innerHTML = '<i class="bi bi-circle"></i>';
    btnSubmit = document.getElementById("btnSubmitCapacitacion");
    btnSubmit.setAttribute("disabled", "");
    ChoseParticipantes = Participantes.filter(
      (item) => item.isChecked == "checked"
    );
    if (ChoseParticipantes.length < 1) {
      message = "No ha seleccionado particiantes";
    } else if (!ChoseParticipantes.some((item) => item.isCapacitador)) {
      message = "Debe seleccionar un Capacitador";
    } else {
      let selectedParticipant = document.getElementById("selectedParticipant");
      colorMessageModal = "success";
      message = "Participantes seleccionados";
      btnSubmit.removeAttribute("disabled");
      selectedParticipant.innerHTML = '<i class="bi bi-check-circle-fill"></i>';
    }
    this.loadParticipantes(ChoseParticipantes);
  }
  static async saveCapacitacion(event) {
    form = document.querySelector("form");
    if (UI.isValidForm(event, form)) {
      UI.modalShowLoad();
      let inputs = document.querySelectorAll(".save-capacitacion");
      inputs.forEach((item) => {
        DataForm[item.id] = item.value;
      });
      try {
        IdCapacitacion = await Capacitacion.saveCapacitacion(DataForm);
        form.reset();
        form.classList.remove('was-validated');
        UI.modalHide("myModalMessageloaded");
        UI.modalShow(
          "¡✔️ Registro existoso!",
          `<p>Se ha cargado la información. <br>Nro. de Capacitación <strong>${IdCapacitacion}</strong></p>
           <a class="btn btn-danger" href="#" role="button" onclick="openGAP()">Generar PDF</a>
          `
        );
        
      } catch (e) {
        console.log(e);
      } 
    }
  }
}
class Capacitacion {
  constructor({
    id,
    titulo,
    objetivo,
    tema,
    material_utilizado,
    doc_entregada,
    duracion,
    area,
    fecha_evaluacion,
    archivo,
  }) {
    (this.id = id),
      (this.fecha = FormatsDate.latinFormat()),
      (this.titulo = titulo),
      (this.objetivo = objetivo),
      (this.tema = tema),
      (this.material_utilizado = material_utilizado),
      (this.doc_entregada = doc_entregada),
      (this.duracion = duracion),
      (this.area = area),
      (this.fecha_evaluacion = FormatsDate.latinFormat(fecha_evaluacion)),
      (this.evaluado = "No"),
      (this.evaluacion_efectividad = "No evaluado"),
      (this.archivo = archivo);
  }
  static async getCapacitaciones() {
    try {
      let response = await ApiGoogleSheet.getResponse(SheetCapacitaciones);
      if (response.status === 200) {
        let data = arrayToObject(response.result.values);
        return data;
      }
    } catch (e) {
      console.log(e);
    }
  }
  static async saveCapacitacion(data) {
    data.id = await this.createId();
    let newCapacitacion = new Capacitacion(data);
    try {
      let headers = await ApiGoogleSheet.getHeaders(SheetCapacitaciones);
      newCapacitacion = objectToArray(newCapacitacion, headers);
      await ApiGoogleSheet.postData(SheetCapacitaciones, [newCapacitacion]);
      let ParticipatesData = this.ParticipatesData(data.id);
      let response = await ApiGoogleSheet.postData(SheetParticipantes, ParticipatesData)
      console.log(response)
      return data.id;
    } catch (e) {
      console.log(e);
    }
  }
  static async createId() {
    try {
      Capacitaciones = await this.getCapacitaciones();
      let idsCapacitaciones = Capacitaciones.map((item) => item.id);
      let lastId = Math.max(...idsCapacitaciones);
      return lastId + 1;
    } catch (e) {
      console.log(e);
    }
  }
  static ParticipatesData(id) {
    return ChoseParticipantes.map((item) => {
      item.idCapacitacion = id;
      if (item.isCapacitador == "checked") {
        item.capacitador = "Sí";
      } else {
        item.capacitador = "No";
      }
      return [item.idCapacitacion, item.legajo, item.capacitador];
    });
  }
}
