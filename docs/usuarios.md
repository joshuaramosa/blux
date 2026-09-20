# 🔑 Usuarios del sistema — BLUX

> ⚠️ **Importante**: son cuentas de PRUEBA creadas durante el desarrollo.
> Antes del lanzamiento real: cambia las contraseñas y crea las cuentas definitivas del personal desde `/admin/usuarios` (rol ADMIN).
> **No compartas este archivo públicamente.**

| Rol | Correo | Contraseña | Panel | Acceso |
|---|---|---|---|---|
| **ADMIN** | `admin@blux.pe` | `BluxAdmin123!` | `/admin` | Todo: pedidos, productos, categorías, clientes, ventas, configuración, usuarios |
| **COCINA** | `cocina@blux.pe` | `BluxCocina123!` | `/cocina` | Solo pedidos confirmados (sin precios): preparar / marcar listo |
| **REPARTIDOR** | `repartidor@blux.pe` | `BluxRepartidor123!` | `/delivery` | Solo sus entregas asignadas |

## Login

- URL: `https://blux.pe/admin/login` (en desarrollo: `http://localhost:3000/admin/login`).
- Cada rol es redirigido automáticamente a su panel tras iniciar sesión.
- Un rol no puede entrar al panel de otro (verificado en Etapa 14).

## Cliente

El cliente **no necesita cuenta**: pide directamente desde `/carta` → `/carrito` → `/checkout` y sigue su pedido en `/pedido/[token]`.

## Cliente de prueba usado en desarrollo

Los pedidos de prueba usan celulares de prueba (p. ej. `955111222`). No representan clientes reales.

## Cambio de contraseña

Desde el panel → **Usuarios** (solo ADMIN): crear, editar, activar/desactivar personal y cambiar su contraseña.
