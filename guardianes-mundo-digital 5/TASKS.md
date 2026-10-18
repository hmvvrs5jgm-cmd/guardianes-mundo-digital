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
- [x] Laberinto con bloques, plataformas, vacío de datos con plataforma móvil, chispas y zarzas.
- [x] Misión 4: inspeccionar la página del premio (5 señales de phishing + decisión) → Escudo Antiphishing.
- [x] El Escudo rompe el portal engañoso que bloquea el camino (herramienta con efecto real).
- [x] Misión 5: conversación de práctica con Eco disfrazado (5 decisiones, señales de alerta, la máscara cae) → Espada de los Límites.
- [x] La Espada corta las cadenas de presión (no ataca a nadie).
- [x] Misión 6: ordenar los pasos ante el ciberacoso + elegir mensajes de apoyo para Pío → Capa de Privacidad.
- [x] La Capa permite cruzar la tormenta de mensajes de Nubarrón (sin daño: la tormenta solo empuja).
- [x] Pasadizo secreto con la Lupa, Luma, Cristal de la Protección, portal, insignia Protector Digital y desbloqueo del nivel 3.

**Aceptación:** las misiones 4, 5 y 6 se completan; las tres herramientas abren el camino; el nivel termina en el portal hacia la Fortaleza.

## Fase 5 — Nivel 3: La Fortaleza de los Secretos
- [x] Fortaleza con puertas monumentales, placas de presión, consola, sala del Consejo y Corazón de la Fortaleza.
- [x] Misión 7: contraseña ficticia fuerte con piezas y medidor de fuerza (rechaza datos personales y contraseñas obvias) + 3 decisiones; no se guarda nada. Abre la primera puerta.
- [x] Misión 8: dos placas en distintos lugares (una en lo alto) + código del dispositivo de confianza + decisión → Llave Maestra.
- [x] Misión 9: Consejo de Guardianes, 6 situaciones resueltas con la herramienta o habilidad adecuada.
- [x] Cristal de la Confianza, unión de los tres cristales y escena final con resumen, insignia Guardián Digital y créditos.

**Aceptación:** las misiones 7, 8 y 9 se completan y el juego termina en la escena final.

## Fase 6 — Acabado visual
- [x] Personajes con animaciones, partículas, rayos de recompensa, transiciones y sonidos sintetizados.
- [ ] Sustituir arte procedural por ilustraciones profesionales (arquitectura lista: `EXTERNAL_ASSETS`).
- [ ] Música y efectos profesionales (opcional).

## Fase 7 — Pruebas
- [x] `npm run build` sin errores.
- [x] Recorrido automatizado en navegador (Chromium + Playwright) del nivel 1 completo:
      menú → personalización → intro → misiones 1, 2 y 3 → cristal → portal → nivel 2.
- [x] Recorrido automatizado del nivel 2: portal bloqueado sin escudo → misión 4 → romper portal →
      misión 5 → cortar cadenas → misión 6 → cruzar tormenta → cristal → portal → nivel 3.
- [x] Recorrido automatizado del nivel 3: puerta cerrada → misión 7 → placas → misión 8 → misión 9 →
      cristal → unión de cristales → escena final; mapa con los tres mundos completos y mochila llena.
- [x] Teclado en menús, pausa, mochila y acertijos; controles táctiles simulados (mover + saltar).
- [x] Caídas y zarzas restan corazones y devuelven al farol; guardado dañado o de otra versión se recupera.
- [x] Compilación de producción servida con la ruta base de GitHub Pages.
- [ ] Pruebas con niñas y niños del público objetivo y con lectores de pantalla.
- [ ] Pruebas en dispositivos móviles físicos (iOS / Android).

## Fase 8 — Publicación
- [x] Workflow de GitHub Actions para GitHub Pages.
- [x] README con instalación, desarrollo, despliegue, créditos y licencias.
- [ ] Activar Pages (Settings → Pages → Source: GitHub Actions) y publicar en `main` (requiere autorización).
