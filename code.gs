// Código para el archivo Code.gs

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Gestor de Tareas y Proyectos')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Obtener datos de configuración
function getConfigData() {
  const ss = SpreadsheetApp.openById('1zJdD4plUW-JtGa2mqTS6KAYzKOos7eJRhcMdFduq5vk');
  const configSheet = ss.getSheetByName('Configuración');
  const configData = configSheet.getDataRange().getValues();
  
  // Eliminar la fila de encabezados
  const headers = configData.shift();
  
  // Preparar los datos de configuración
  const usuarios = [];
  const estatus = [];
  const tipos = [];
  const prioridades = [];
  
  // Mapear los datos a sus respectivas categorías
  configData.forEach(row => {
    if (row[0] && row[1]) usuarios.push({nombre: row[0], usuario: row[1]});
    if (row[3]) estatus.push(row[3]);
    if (row[4]) tipos.push(row[4]);
    if (row[5]) prioridades.push(row[5]);
  });
  
  return {
    usuarios: usuarios,
    estatus: estatus.filter(Boolean),
    tipos: tipos.filter(Boolean),
    prioridades: prioridades.filter(Boolean)
  };
}

// Obtener todas las tareas
function getAllTasks() {
  const ss = SpreadsheetApp.openById('1zJdD4plUW-JtGa2mqTS6KAYzKOos7eJRhcMdFduq5vk');
  const proyectosSheet = ss.getSheetByName('Proyectos');
  const data = proyectosSheet.getDataRange().getValues();
  
  // Eliminar la fila de encabezados
  const headers = data.shift();
  
  // Convertir los datos en un array de objetos
  const tasks = data.map((row, index) => {
    return {
      id: index,
      rowNumber: index + 2, // +2 porque el índice empieza en 0 y hay que considerar la fila de encabezados
      fechaEntrega: row[1] ? Utilities.formatDate(new Date(row[1]), Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
      tiempoPendiente: row[2],
      responsable: row[3],
      estatus: row[5],
      tipo: row[6],
      prioridad: row[7],
      descripcion: row[8],
      fechaCreacion: row[9] ? Utilities.formatDate(new Date(row[9]), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss') : '',
      creador: row[10]
    };
  });
  
  return tasks;
}

// Guardar nueva tarea
function saveTask(taskData) {
  const ss = SpreadsheetApp.openById('1zJdD4plUW-JtGa2mqTS6KAYzKOos7eJRhcMdFduq5vk');
  const proyectosSheet = ss.getSheetByName('Proyectos');
  
  // Preparar los datos para guardar
  const fechaEntrega = taskData.fechaEntrega ? new Date(taskData.fechaEntrega) : null;
  const fechaCreacion = new Date();
  const creador = Session.getActiveUser().getEmail();
  
  // Calcular tiempo pendiente (lo calcularemos al mostrar los datos)
  const tiempoPendiente = "";
  
  // Crear el array de datos para la fila, omitiendo la columna check
  const rowData = [
    "", // Celda vacía en lugar del check
    fechaEntrega,
    tiempoPendiente,
    taskData.responsable,
    "", // Área (vacía ya que se eliminó)
    taskData.estatus,
    taskData.tipo,
    taskData.prioridad,
    taskData.descripcion,
    fechaCreacion,
    creador
  ];
  
  // Agregar la nueva fila
  proyectosSheet.appendRow(rowData);
  
  return true;
}

// Actualizar el estado de una tarea
function updateTaskStatus(rowNumber, newStatus) {
  const ss = SpreadsheetApp.openById('1zJdD4plUW-JtGa2mqTS6KAYzKOos7eJRhcMdFduq5vk');
  const proyectosSheet = ss.getSheetByName('Proyectos');
  
  // Actualizar la celda de estatus (columna F, índice 6)
  proyectosSheet.getRange(rowNumber, 6).setValue(newStatus);
  
  return true;
}

// Obtener el usuario actual
function getCurrentUser() {
  const email = Session.getActiveUser().getEmail();
  // Extraer solo el identificador (parte antes del @)
  const identifier = email.split('@')[0];
  return identifier;
}
