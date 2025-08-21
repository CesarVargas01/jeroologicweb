/**
 * Google Apps Script para recibir datos del formulario de contacto
 * y guardarlos en Google Sheets
 */

// ID de tu Google Sheet (extraído de la URL)
const SHEET_ID = '1UGbgZd3_JYjRQkX9oeIXFt2V-xY-oXY9h0mktZgNrq8';

/**
 * Función principal que maneja las peticiones POST
 */
function doPost(e) {
  try {
    // Parsear los datos JSON recibidos
    const data = JSON.parse(e.postData.contents);
    
    // Validar que los datos requeridos estén presentes
    if (!data.name || !data.email || !data.message) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          message: 'Faltan campos requeridos'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Abrir la hoja de cálculo
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Crear timestamp
    const timestamp = new Date();
    
    // Preparar los datos para insertar
    const rowData = [
      timestamp,           // Timestamp
      data.name,          // Nombre
      data.email,         // Email
      data.company || '', // Empresa (opcional)
      data.message        // Mensaje
    ];
    
    // Insertar los datos en una nueva fila
    sheet.appendRow(rowData);
    
    // Respuesta exitosa
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: `¡Gracias ${data.name}! Tu mensaje ha sido enviado correctamente.`
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Manejo de errores
    console.error('Error al procesar el formulario:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error interno del servidor. Inténtalo de nuevo.'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función para manejar peticiones GET (opcional, para testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      message: 'Endpoint activo. Usa POST para enviar datos del formulario.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Función para configurar los headers CORS
 */
function setupSheet() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  
  // Verificar si ya existen headers
  const headers = sheet.getRange(1, 1, 1, 5).getValues()[0];
  
  if (!headers[0]) {
    // Agregar headers si no existen
    const headerRow = ['Timestamp', 'Nombre', 'Email', 'Empresa', 'Mensaje'];
    sheet.getRange(1, 1, 1, 5).setValues([headerRow]);
    
    // Formatear headers
    sheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    sheet.getRange(1, 1, 1, 5).setBackground('#4285f4');
    sheet.getRange(1, 1, 1, 5).setFontColor('white');
  }
}