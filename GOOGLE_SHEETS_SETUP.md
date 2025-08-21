# 📊 Configuración de Google Sheets para Formulario de Contacto

## 🎯 Resumen
Esta guía te ayudará a configurar la integración completa entre tu formulario de contacto y Google Sheets.

## 📋 Pasos de Configuración

### 1. Preparar Google Sheet

1. **Abrir tu Google Sheet:**
   ```
   https://docs.google.com/spreadsheets/d/1UGbgZd3_JYjRQkX9oeIXFt2V-xY-oXY9h0mktZgNrq8/edit
   ```

2. **Configurar headers en la primera fila:**
   - A1: `Timestamp`
   - B1: `Nombre`
   - C1: `Email`
   - D1: `Empresa`
   - E1: `Mensaje`

### 2. Crear Google Apps Script

1. **Ir a Google Apps Script:**
   - Ve a [script.google.com](https://script.google.com)
   - Clic en "Nuevo proyecto"

2. **Copiar el código:**
   - Reemplaza todo el código por defecto con el contenido de `google-apps-script.js`
   - Guarda el proyecto (Ctrl+S)
   - Cambia el nombre a "Jeroo Logic Contact Form"

3. **Ejecutar configuración inicial:**
   - Selecciona la función `setupSheet`
   - Clic en "Ejecutar"
   - Autoriza los permisos cuando se solicite

### 3. Desplegar como Web App

1. **Crear implementación:**
   - Clic en "Desplegar" > "Nueva implementación"
   - Tipo: "Aplicación web"
   - Descripción: "Jeroo Logic Contact Form Handler"
   - Ejecutar como: "Yo"
   - Quién tiene acceso: "Cualquier persona"

2. **Obtener URL:**
   - Clic en "Desplegar"
   - **IMPORTANTE:** Copia la URL de la aplicación web
   - Se verá algo como: `https://script.google.com/macros/s/ABC123.../exec          https://script.google.com/macros/s/AKfycby90rr4ucKj7CoxKUu0OdTXh0nVXGfTD3trZGKoQg0PapzyRjpXaOT_yuilXO58iFSEGQ/exec `

### 4. Configurar el proyecto Astro

1. **Actualizar configuración:**
   - Abre `src/config/api.ts`
   - Reemplaza `YOUR_SCRIPT_ID_HERE` con tu URL completa:
   ```typescript
   export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/TU_SCRIPT_ID_AQUI/exec';
   ```

### 5. Probar la integración

1. **Probar con curl:**
   ```bash
   curl -X POST "http://localhost:4321/api/submit-form" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "company": "Test Company",
       "message": "Este es un mensaje de prueba desde la integración"
     }'
   ```

2. **Probar desde el formulario web:**
   - Inicia tu servidor de desarrollo: `npm run dev`
   - Ve a tu sitio web
   - Llena y envía el formulario de contacto
   - Verifica que los datos aparezcan en Google Sheets

## 🔧 Configuración Avanzada

### Rate Limiting
El sistema incluye rate limiting automático:
- **Límite:** 5 requests por IP cada 15 minutos
- **Configurable en:** `src/config/api.ts`

### Validación de Datos
- **Nombre:** 2-100 caracteres
- **Email:** Formato válido, máximo 100 caracteres
- **Empresa:** Opcional, máximo 100 caracteres
- **Mensaje:** 10-1000 caracteres

### Seguridad
- ✅ Sanitización de datos XSS
- ✅ Validación de Content-Type
- ✅ Rate limiting por IP
- ✅ Validación de campos requeridos
- ✅ Headers CORS configurados

## 🚨 Troubleshooting

### Error: "Script no encontrado"
- Verifica que la URL del script sea correcta
- Asegúrate de que el script esté desplegado como "Aplicación web"
- Verifica que el acceso sea "Cualquier persona"

### Error: "Permisos denegados"
- Re-ejecuta la función `setupSheet` en Google Apps Script
- Autoriza todos los permisos solicitados
- Verifica que tengas acceso de edición al Google Sheet

### Datos no aparecen en la hoja
- Verifica que el ID del sheet en el script sea correcto
- Comprueba que los headers estén en la primera fila
- Revisa los logs en Google Apps Script (Ver > Registros)

### Error de CORS
- Verifica que el endpoint `/api/submit-form` esté funcionando
- Comprueba que los headers CORS estén configurados correctamente

## 📊 Estructura de Datos en Google Sheets

| Timestamp | Nombre | Email | Empresa | Mensaje |
|-----------|--------|-------|---------|---------|
| 2024-01-15 10:30:00 | Juan Pérez | juan@example.com | Empresa XYZ | Mensaje de contacto... |

## 🔄 Actualizaciones del Script

Si necesitas actualizar el Google Apps Script:
1. Modifica el código en Google Apps Script
2. Guarda los cambios
3. Ve a "Desplegar" > "Administrar implementaciones"
4. Clic en el ícono de editar de tu implementación
5. Cambia la versión a "Nueva versión"
6. Clic en "Desplegar"

¡Listo! Tu formulario ahora guardará automáticamente todos los mensajes en Google Sheets.