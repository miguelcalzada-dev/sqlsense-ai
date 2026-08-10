# AGENTS.md

## Comandos

- Build: `npm run build`
- Typecheck: `npm run typecheck` (tsc --noEmit)
- Lint: `npm run lint` (next lint)
- Dev: `npm run dev`
- Start: `npm start`

## Notas

- API routes ejecutan en runtime Node (NO edge) para funcionar en `next start` / Railway.
- sql.js carga el `.wasm` desde CDN (`cdnjs`). No se requiere binario local.
- Si no hay `OPENAI_API_KEY`, las rutas `/api/translate|explain|teach` usan el motor local en `lib/ai/local.ts` como respaldo determinista.
- La base de datos es efímera y vive solo en memoria del navegador (sql.js).