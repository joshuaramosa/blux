# Etapa 15 — Resultados de pruebas E2E

**Fecha:** 19/09/2026 · **Herramienta:** Playwright (Chromium, viewport móvil 390px) · **Resultado: 35/35 OK**

## 👤 Cliente (14/14)
- Landing carga y enlaza a la carta
- Carta con categorías y productos (con fotos y precios)
- Agregar al carrito (barra flotante: "3 ítems S/ 42.00")
- Producto agotado: botón deshabilitado
- Incrementar, decrementar y eliminar en `/carrito` recalculando totales
- Checkout paso 1: validación de celular peruano (9 dígitos, inicia en 9)
- Paso 2: rechazo de permiso GPS muestra error claro; referencia obligatoria
- GPS aceptado: coordenadas capturadas y mapa mostrado
- Resumen final y confirmación: pedido creado con número y token de seguimiento
- Seguimiento público sin login (`/pedido/[token]`)

## 👨‍💼 Atención/Admin (4/4)
- Dashboard refleja pedido nuevo en vivo (Realtime)
- Pedido NUEVO listado en `/admin/pedidos`
- Acción **Confirmar pedido** (enviar a cocina) funcional
- Asignación de repartidor → estado `ASIGNADO`

## 👨‍🍳 Cocina (4/4)
- Pedido confirmado aparece en vivo sin recargar
- Solo ítems/cantidades (sin precios)
- PREPARAR → `EN_PREPARACION`
- PEDIDO LISTO → `LISTO` (y desaparece del tablero)

## 🛵 Delivery (6/6)
- Pedido asignado aparece en vivo
- Dirección + referencia + teléfono clicable
- Botón NAVEGAR abre Google Maps con coordenadas del cliente
- SALIR A ENTREGAR → `EN_CAMINO` (`picked_up_at` registrado)
- ENTREGADO con confirmación → `ENTREGADO` (`delivered_at` registrado)

## 💜 Yape (4/4)
- Preview del comprobante antes de enviar
- Pedido YAPE creado
- Comprobante almacenado en bucket privado `payment-proofs/{order_id}/`
- Registro en `payments` con método YAPE y `proof_url`

## 📶 Carga / concurrencia (1/1)
- 5 pedidos simultáneos vía RPC → números únicos y consecutivos (33–37), sin colisiones

## 🔐 Seguridad (re-ejecutada, etapa 14)
- 20/20 pruebas de intrusión RLS en verde (verificar `test-rls.js`)

## ⚠️ Pendiente (requiere dispositivos físicos)
- Pruebas en Android/iOS reales (Chrome Safari), PWA "Añadir a pantalla de inicio"
- Pruebas en red 3G/4G real
- Aviso sonoro verificado con los oídos (la lógica está probada en código)

**Historial de la corrida:** pedido #31 E2E completo (NUEVO → CONFIRMADO → EN_PREPARACION → LISTO → ASIGNADO → EN_CAMINO → ENTREGADO, visto por el cliente en vivo), screenshots en carpeta de pruebas.
