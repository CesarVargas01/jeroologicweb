# Jeroo Logic - Sitio Web Corporativo

## 🚀 Descripción

Sitio web corporativo de Jeroo Logic, especializada en soluciones de software y automatización empresarial. Desarrollado con Astro, Tailwind CSS y tecnologías modernas.

## 🛠️ Tecnologías Utilizadas

- **Framework:** Astro 5.13.2
- **Estilos:** Tailwind CSS 3.4.17
- **Iconos:** Astro Icon + Iconify (MDI)
- **Tipografía:** Poppins & Montserrat (Google Fonts)
- **Lenguaje:** TypeScript
- **Deployment:** Estático (SSG)

## 📁 Estructura del Proyecto

```
/
├── public/
│   ├── images/          # Imágenes y assets estáticos
│   ├── js/             # Scripts JavaScript modulares
│   │   ├── navigation.js
│   │   ├── forms.js
│   │   └── scroll-effects.js
│   └── global.css      # Estilos globales
├── src/
│   ├── components/     # Componentes Astro reutilizables
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── ThemeToggleButton.astro
│   ├── layouts/        # Layouts de página
│   │   └── Layout.astro
│   └── pages/          # Páginas del sitio
│       ├── api/        # API endpoints
│       │   └── submit-form.ts
│       ├── blog/       # Blog (futuro)
│       ├── certificaciones/
│       ├── index.astro # Página principal
│       └── recursos.astro
└── package.json
```

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone [URL_DEL_REPO]
cd jeroo-logic-web

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Scripts Disponibles
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
npm start        # Alias para dev
```

## 🎨 Características

### ✅ Performance
- **SSG (Static Site Generation)** para máxima velocidad
- **Lazy loading** de imágenes
- **Compresión WebP** para imágenes
- **JavaScript modular** separado por funcionalidad

### ✅ SEO Optimizado
- **Meta tags** completos (Open Graph, Twitter Cards)
- **Structured Data** (JSON-LD) para mejor indexación
- **Sitemap automático** generado
- **URLs canónicas** y amigables

### ✅ Accesibilidad (WCAG)
- **Navegación por teclado** completa
- **Atributos ARIA** apropiados
- **Contraste de colores** optimizado
- **Texto alternativo** en imágenes

### ✅ Seguridad
- **Content Security Policy** configurado
- **Validación de formularios** robusta
- **Rate limiting** en API endpoints
- **Sanitización de entradas** de usuario
- **Headers de seguridad** implementados

### ✅ Responsive Design
- **Mobile-first** approach
- **Breakpoints** optimizados
- **Touch-friendly** interfaces
- **Cross-browser** compatibility

## 🔧 Configuración

### Variables de Entorno
Crear archivo `.env` en la raíz:
```env
# Configuración del sitio
SITE_URL=https://www.jerroologic.com
CONTACT_EMAIL=jeroologic@gmail.com

# APIs (si se requieren)
# SMTP_HOST=
# SMTP_USER=
# SMTP_PASS=
```

### Personalización de Colores
Los colores se configuran en `tailwind.config.mjs`:
```javascript
colors: {
  primary: {
    DEFAULT: '#223e7c',
    dark: '#1a3369',
    light: '#93c5fd',
  },
  secondary: '#3f4040',
  whatsapp: '#25D366',
  telegram: '#0088CC',
  // ...
}
```

## 📱 Funcionalidades

### Navegación
- **Menú responsive** con animaciones suaves
- **Scroll suave** entre secciones
- **Indicador de sección activa**
- **Botón scroll-to-top**

### Formulario de Contacto
- **Validación client-side y server-side**
- **Rate limiting** anti-spam
- **Notificaciones** elegantes
- **Sanitización** de datos

### Optimizaciones
- **Lazy loading** automático
- **Preload** de recursos críticos
- **Minificación** automática
- **Tree shaking** de CSS/JS no utilizado

## 🚀 Deployment

### Build para Producción
```bash
npm run build
```

### Plataformas Recomendadas
- **Netlify** (recomendado)
- **Vercel**
- **GitHub Pages**
- **Cloudflare Pages**

### Configuración de Headers (Netlify)
Crear `public/_headers`:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## 🧪 Testing

### Herramientas Recomendadas
- **Lighthouse** para performance y SEO
- **axe-core** para accesibilidad
- **WAVE** para validación web

### Checklist de Calidad
- [ ] Performance Score > 90
- [ ] SEO Score > 95
- [ ] Accessibility Score > 95
- [ ] Best Practices Score > 90

## 🤝 Contribución

### Estándares de Código
- **ESLint** + **Prettier** para formateo
- **Conventional Commits** para mensajes
- **Semantic Versioning** para releases

### Workflow
1. Fork del repositorio
2. Crear branch feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: añadir nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📞 Contacto

- **Email:** jeroologic@gmail.com
- **WhatsApp:** +57 320 871 8037
- **Telegram:** @jeroo_logic
- **Website:** https://www.jerroologic.com

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**Desarrollado con ❤️ por Jeroo Logic**