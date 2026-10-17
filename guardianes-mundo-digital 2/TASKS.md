# Plan de trabajo y criterios de aceptación

Leyenda: [x] hecho y verificado · [ ] pendiente

## Fase 1 — Base técnica
- [x] Proyecto Vite + Phaser 3 (versiones fijadas: Phaser 3.90.0, Vite 6.4.3).
- [x] `npm install`, `npm run dev`, `npm run build`, `npm run preview` funcionan.
- [x] Menú principal: Nueva aventura, Continuar, Opciones, ¿Necesitas ayuda?, Créditos, Reiniciar progreso (con confirmación).
- [x] Personalización de Alex con opciones predeterminadas (sin nombre ni datos).

**Aceptación:** el juego carga sin errores de consola y el menú responde a ratón, teclado y toque.

## Fase 2 — Motor de aventura
- [x] Movimiento, carrera, salto con tolerancia, colisiones, plataformas atravesables y móviles.
- [x] Cámara con seguimiento y fondos con parallax.
- [x] Interacción por proximidad, diálogos (Seguir / Repetir / opciones), pistas de Bit.
- [x] Inventario (herramientas, cristales, insignias) y recompensas animadas.
- [x] Guardado automático, validación y migración de datos.
- [x] Controles táctiles multitáctiles y navegación por teclado (FocusManager).
- [x] Pausa, opciones de sonido y accesibilidad.

**Aceptación:** se puede jugar con teclado o pantalla táctil; el progreso persiste al recargar.

## Fase 3 — Nivel 1: El Bosque de las Señales
- [x] Escenario con zonas, peligros, coleccionables, faroles y secretos.
- [x] Misión 1: examinar mensajes y decidir → Lupa de la Verdad.
- [x] La Lupa revela el sendero de cristal, la señal falsa y un cofre escondido.
- [x] Misión 2: clasificar información (tocar o arrastrar) + combinación de datos.
- [x] Misión 3: puente de confianza (acciones protectoras + personas adultas de confianza) con Luma.
- [x] Cristal del Conocimiento, portal, insignia Explorador Digital, resumen y desbloqueo del nivel 2.

**Aceptación:** las tres misiones se completan, los errores no restan corazones, y el nivel termina en el portal.

## Fase 4 — Nivel 2: El Laberinto de las Trampas
- [x] Escena, paleta y arte procedural del mundo; datos de misiones registrados.
- [ ] Misión 4: portal del premio (phishing) → Escudo Antiphishing (desactiva portales engañosos).
- [ ] Misión 5: visitante misterioso (Eco) → Espada de los Límites (corta cadenas de presión).
- [ ] Misión 6: palabras que pesan (Nubarrón) → Capa de Privacidad.
- [ ] Laberinto con portales, pasillos secretos y obstáculos luminosos.
- [ ] Cristal de la Protección, insignia Protector Digital, desbloqueo del nivel 3.

## Fase 5 — Nivel 3: La Fortaleza de los Secretos
- [x] Escena y paleta del mundo; escena final (`EndingScene`) con diálogo, resumen y créditos.
- [ ] Misión 7: contraseña ficticia fuerte con piezas (sin guardar contraseñas).
- [ ] Misión 8: dos mecanismos = verificación en dos pasos → Llave Maestra.
- [ ] Misión 9: Consejo de Guardianes (desafío integrador).
- [ ] Unión de los tres cristales e insignia Guardián Digital desde el flujo de juego.

## Fase 6 — Acabado visual
- [x] Personajes con animaciones, partículas, rayos de recompensa, transiciones y sonidos sintetizados.
- [ ] Sustituir arte procedural por ilustraciones profesionales (arquitectura lista: `EXTERNAL_ASSETS`).
- [ ] Música y efectos profesionales (opcional).

## Fase 7 — Pruebas
- [x] `npm run build` sin errores.
- [x] Recorrido automatizado en navegador (Chromium + Playwright) del nivel 1 completo:
      menú → personalización → intro → misiones 1, 2 y 3 → cristal → portal → nivel 2.
- [x] Teclado en menús, pausa, mochila y acertijos; controles táctiles simulados (mover + saltar).
- [x] Caídas y zarzas restan corazones y devuelven al farol; guardado dañado o de otra versión se recupera.
- [x] Compilación de producción servida con la ruta base de GitHub Pages.
- [ ] Pruebas con niñas y niños del público objetivo y con lectores de pantalla.
- [ ] Pruebas en dispositivos móviles físicos (iOS / Android).

## Fase 8 — Publicación
- [x] Workflow de GitHub Actions para GitHub Pages.
- [x] README con instalación, desarrollo, despliegue, créditos y licencias.
- [ ] Activar Pages (Settings → Pages → Source: GitHub Actions) y publicar en `main` (requiere autorización).
