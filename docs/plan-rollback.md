# 🔙 Plan de rollback — BLUX en producción

## Ante un fallo crítico después de un despliegue en Vercel

### Opción A (rápida, sin código): re-deploy del despliegue anterior
1. Vercel → proyecto `blux` → pestaña **Deployments**.
2. Buscar el último deploy "Production" que funcionaba (fecha/hora anterior al fallo).
3. Menú `⋯` → **Promote to Production**.
4. Verificación: abrir https://blux.pe, hacer login y un pedido de prueba.

### Opción B (código): revert del commit problemático
```bash
git revert <commit>   # o git reset al commit sano + push --force-with-lease (solo si es seguro)
git push
```
Vercel re-despliega automáticamente la rama `main`.

### Base de datos (Supabase)
- Las migraciones se aplican con `supabase db push` (versionadas en `supabase/migrations/`).
- Si una migración rompe algo: crear migración correctiva nueva (nunca editar ni re-aplicar una migración ya aplicada en producción).
- Supabase ofrece backups automáticos; en plan gratuito, punto de restauración diario (dashboard → Settings → Backups).

### Variables de entorno
- Vercel → Settings → Environment Variables. Cambiar = nuevo deploy (re-deploy manual desde Deployments).
- Nunca rotar claves de Supabase sin desplegar de nuevo (los tokens ya emitidos siguen válidos hasta expirar).

### Contacto de emergencia
- Dueño del negocio define quién toca producción. Documentar aquí: ________
