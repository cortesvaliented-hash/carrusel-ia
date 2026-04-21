# Carrusel IA — PWA

Generador de carruseles para Instagram y LinkedIn con IA.
3 usos gratuitos, luego 1€/24h.

## Estructura

```
carrusel-pwa/
├── netlify.toml
├── netlify/
│   └── functions/
│       └── generate.js     ← Backend con API key oculta
└── public/
    ├── index.html          ← PWA frontend
    ├── manifest.json       ← PWA manifest
    └── sw.js               ← Service worker
```

## Despliegue en Netlify

### 1. Sube el proyecto

Opción A — Arrastra la carpeta entera a netlify.com/drop

Opción B — Conecta con GitHub:
```
git init
git add .
git commit -m "carrusel ia pwa"
git push
```
Luego conecta el repo en netlify.com

### 2. Añade la variable de entorno

En Netlify → Site settings → Environment variables:

```
ANTHROPIC_API_KEY = sk-ant-...
```

### 3. Listo

La app estará en tu-sitio.netlify.app

## Pago (pendiente conectar)

En `public/index.html`, función `handlePay()`:
Sustituye el bloque simulado por la integración de Stripe u otra pasarela.

Ejemplo con Stripe Checkout:
```js
async function handlePay() {
  const res = await fetch('/api/create-checkout', { method: 'POST' });
  const { url } = await res.json();
  window.location.href = url;
}
```
