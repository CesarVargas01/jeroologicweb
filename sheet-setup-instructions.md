# Configuración de Google Sheet

## 1. Preparar la hoja de cálculo

1. **Abrir tu Google Sheet:**
   - Ve a: https://docs.google.com/spreadsheets/d/1UGbgZd3_JYjRQkX9oeIXFt2V-xY-oXY9h0mktZgNrq8/edit

2. **Configurar los headers (primera fila):**
   - A1: `Timestamp`
   - B1: `Nombre`
   - C1: `Email`
   - D1: `Empresa`
   - E1: `Mensaje`

3. **Formatear los headers (opcional):**
   - Selecciona la fila 1
   - Aplica negrita
   - Cambia el color de fondo a azul
   - Cambia el color del texto a blanco

## 2. Configurar Google Apps Script

1. **Crear el script:**
   - Ve a [script.google.com](https://script.google.com)
   - Clic en "Nuevo proyecto"
   - Reemplaza el código por defecto con el contenido de `google-apps-script.js`

2. **Configurar el proyecto:**
   - Cambia el nombre del proyecto a "Jeroo Logic Contact Form"
   - Guarda el proyecto (Ctrl+S)

3. **Ejecutar la función de configuración:**
   - Selecciona la función `setupSheet` en el dropdown
   - Clic en "Ejecutar"
   - Autoriza los permisos cuando se solicite

## 3. Desplegar como Web App

1. **Desplegar:**
   - Clic en "Desplegar" > "Nueva implementación"
   - Tipo: "Aplicación web"
   - Ejecutar como: "Yo"
   - Quién tiene acceso: "Cualquier persona"
   - Clic en "Desplegar"

2. **Copiar la URL:**
   - Copia la URL de la aplicación web
   - La necesitarás para el siguiente paso

## 4. Probar el endpoint

Puedes probar con curl:
```bash
curl -X POST "TU_URL_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "company": "Test Company",
    "message": "Este es un mensaje de prueba"
  }'
```