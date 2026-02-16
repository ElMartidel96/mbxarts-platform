# 👤 TUS TAREAS PASO A PASO - GUÍA COMPLETA

**Total tiempo estimado**: 20-30 horas en 90 días = 15-20 min/día promedio

---

## 🎯 SEMANA 1: FUNDAMENTOS (DÍA 1-7)

### ⭐ **DÍA 1: RECOPILAR MÉTRICAS** (1 hora)

**Qué hacer:**
1. Abre tu dashboard o BaseScan
2. Anota números exactos (lee `03_METRICAS_REALES_INSTRUCCIONES.md`)
3. Toma screenshots
4. Llena template en carpeta METRICAS
5. Dile a Claude: "Ya tengo las métricas: [lista números]"

**Dónde:**
- Dashboard: [tu URL interna]
- O BaseScan: https://sepolia.basescan.org/address/0xeFCba1D72B8f053d93BA44b7b15a1BeED515C89b

**Resultado:** Template llenado + screenshots guardados

---

### ⭐ **DÍA 2: ENVIAR BASE GRANT** (30 minutos)

**Qué hacer:**
1. Claude te dará contenido completo de la aplicación
2. Ve a: https://base.org/builder-grants
3. Copia/pega cada sección del contenido de Claude
4. Adjunta tu 1-pager técnico (Claude lo creó)
5. Click "Submit"

**Tips:**
- Lee la aplicación completa antes de enviar
- Ajusta cualquier cosa que suene rara
- Doble-check que email sea correcto

**Resultado:** Base Grant application enviada ✅

---

### ⭐ **DÍA 3: GRABAR VIDEO DEMO 90s** (1-2 horas)

**Qué hacer:**

**PREPARACIÓN (15 min):**
1. Claude te dará script detallado shot-by-shot
2. Abre la app en ventana de navegador
3. Abre OBS Studio o grabador de pantalla
4. Configura resolución 1080p

**GRABACIÓN (30-45 min):**
1. Sigue el script paso a paso
2. Graba en tomas de 15 segundos
3. No necesitas ser perfecto, solo claro
4. Repite tomas si es necesario

**EDICIÓN SIMPLE (30-45 min):**
- Herramienta recomendada: CapCut (gratis) o DaVinci Resolve
- Corta las mejores tomas
- Añade texto overlay según script
- Música de fondo suave (opcional)
- Exporta como MP4, 1080p

**Resultado:** `demo_90s_cryptogift.mp4` guardado

---

### ⭐ **DÍA 4-7: CREAR CUENTAS** (2 horas total)

**Cuentas necesarias:**

**1. Product Hunt** (20 min)
- Ve a: https://producthunt.com
- Sign up con Google/GitHub
- Completa perfil
- Sube foto
- Escribe bio (Claude te dará texto)

**2. Farcaster** (30 min)
- Descarga Warpcast app
- Crea cuenta
- Compra username (~$5-10 USD)
- Conecta wallet
- Sigue a algunos builders

**3. ETHGlobal** (20 min)
- Ve a: https://ethglobal.com
- Sign in con wallet o GitHub
- Completa perfil de builder
- Indica skills (Solidity, React, etc.)

**4. GitHub clean-up** (30 min)
- Asegúrate que tu repo principal esté público
- README.md claro (Claude te ayuda)
- Screenshots en repo
- License file (MIT recomendado)

**5. LinkedIn update** (20 min)
- Actualiza headline: "Founder @ CryptoGift Wallets"
- Añade proyecto a experiencia
- Post sobre el proyecto

**Resultado:** Todas las cuentas listas para outreach ✅

---

## 🚀 SEMANA 2: EXPANSIÓN (DÍA 8-14)

### ⭐ **DÍA 8-10: DEPLOY FARCASTER FRAME** (2-3 horas)

**Claude creará el código, tú solo despliegas:**

**1. Código listo** (Claude hace esto)
- Frame component en `/frames/cryptogift-claim.tsx`
- Frame metadata
- Testing local setup

**2. Deploy a Vercel** (30 min TU TRABAJO)
```bash
# En terminal, desde carpeta frontend
git add .
git commit -m "feat: add Farcaster Frame"
git push origin main

# Vercel auto-deploya
```

**3. Testing en Warpcast** (30 min)
- Copia URL del frame: `https://cryptogift-wallets.vercel.app/frames/claim`
- Abre Warpcast
- Crea cast con la URL
- Verifica que frame se renderice bien
- Prueba botones interactivos

**4. Submit a Polygon bounty** (30 min)
- Ve al programa de Polygon Frames
- Llena form con tu frame URL
- Explica funcionalidad (Claude te da texto)
- Submit

**Resultado:** Frame live + submission enviada ✅

---

### ⭐ **DÍA 11-14: OUTREACH (30 min/día)**

**CADA DÍA haz esto:**

**1. Outreach a Communities** (15 min/día)
- Discord servers de Web3 (5 servers)
- Introduce CryptoGift en #showcase o #projects
- Ofrece regalo demo para primeros 10
- Usa template de Claude

**2. DMs a Builders** (10 min/día)
- Encuentra 2-3 builders en Farcaster
- DM personalizado (usa template de Claude)
- Ofrece colaboración o partnership

**3. Twitter engagement** (5 min/día)
- Reply a tweets de grants/funding
- Share updates de tu progreso
- Tag @base, @optimism, etc.

**Template Daily Outreach:**
```
Día 11: 5 Discord posts + 2 Farcaster DMs
Día 12: 5 Discord posts + 2 Farcaster DMs
Día 13: 5 Discord posts + 2 Farcaster DMs
Día 14: 5 Discord posts + 2 Farcaster DMs

Total semana: 20 Discord + 8 DMs = 28 outreach
```

**Resultado:** 28+ touchpoints, 2-5 respuestas esperadas ✅

---

## 💼 SEMANA 3: PRODUCT HUNT (DÍA 15-21)

### ⭐ **DÍA 15-17: PREPARAR LANZAMIENTO** (3 horas)

**1. Screenshots de calidad** (1 hora)
- Abre la app en ventana grande (1920x1080)
- Toma 5 screenshots clave:
  - Homepage hero
  - Gift creation wizard
  - Claim experience
  - Wallet interface
  - Educational flow
- Usa herramienta como Cleanshot o Shottr
- Guarda como PNG high-quality

**2. Thumbnail hero image** (30 min)
- Usa Canva template para Product Hunt
- Tamaño: 1200x630px
- Texto: "Gift Real Crypto"
- Logo + screenshot
- Gradiente de marca

**3. Galería de imágenes** (30 min)
- Sube los 5 screenshots a Imgur o similar
- Verifica que se vean bien en móvil
- Ten URLs listas

**4. Preparar hunter** (30 min)
- Busca un "hunter" con seguidores en PH
- O lánzalo tú mismo como "maker"
- DM a hunter con pitch (Claude te da mensaje)

**Resultado:** Assets listos, hunter confirmado

---

### ⭐ **DÍA 18: LANZAMIENTO PRODUCT HUNT** (2 horas)

**HORARIO ÓPTIMO: 12:01 AM PST (9:01 AM hora de España)**

**1. Submit producto** (30 min - hazlo justo a medianoche PST)
- Ve a: https://producthunt.com/posts/new
- Llena form con contenido de Claude:
  - Tagline (1 línea)
  - Description (3-4 líneas)
  - Thumbnail
  - Gallery images
  - Video demo 90s
  - Link a app
  - Topics: Web3, Crypto, NFT, Fintech

**2. First comment** (5 min - inmediatamente después)
- Claude te dará "first comment" detallado
- Copia/pega como primer comment
- Incluye:
  - Qué es CryptoGift
  - Por qué lo construiste
  - Cómo funciona
  - Call to action

**3. Promoción Day 1** (durante todo el día, ~30 min total)
- Post en Twitter con link PH
- Post en Discord communities
- DM a amigos/familia para votar
- Reply a comments en PH
- Pide upvotes (pero no spammees)

**Resultado:** Producto live en Product Hunt ✅

---

### ⭐ **DÍA 19-21: POST-LAUNCH** (1 hora/día)

**Cada día:**
- Reply a todos los comments en PH (15 min)
- Post update en Twitter (5 min)
- Share en LinkedIn (5 min)
- Añade "Featured on Product Hunt" a tu web (20 min, solo día 19)
- Track votes/ranking (5 min)

**Meta:** Top 10 del día = WIN

**Resultado:** Visibilidad máxima + posible feature de PH ✅

---

## 📊 SEMANA 4-12: SEGUIMIENTO Y SCALE

### **Rutina Diaria** (15-20 min/día)

**Morning routine** (10 min):
- Check emails de grants
- Reply a DMs nuevos
- Check Product Hunt notifications
- Review analytics

**Evening routine** (10 min):
- 2-3 outreach nuevos
- Post 1 update en Twitter
- Review progress del día

### **Semanalmente** (2 horas):

**Lunes:**
- Review métricas de la semana pasada
- Plan de outreach semanal
- Priorizar aplicaciones nuevas

**Miércoles:**
- Mid-week check-in con Claude
- Ajustar estrategia si es necesario

**Viernes:**
- Aplicar a 1-2 grants nuevos
- Preparar contenido para siguiente semana

---

## 📹 GUÍA: CÓMO GRABAR VIDEO DEMO 90s

### **Software recomendado:**

**OPCIÓN 1: OBS Studio** (Gratis, profesional)
- Download: https://obsproject.com
- Tutorial: 5 min en YouTube "OBS screen recording tutorial"

**OPCIÓN 2: Loom** (Gratis hasta 5 min)
- Chrome extension
- Más fácil pero menos control

**OPCIÓN 3: Windows Game Bar** (Ya instalado)
- `Win + G` para abrir
- Click grabar
- Limitado pero funcional

### **Setup:**

1. **Preparar navegador:**
   - Ventana nueva sin tabs extras
   - Zoom al 100%
   - Ocultar bookmarks bar
   - Modo incógnito (para demo limpio)

2. **Preparar datos de demo:**
   - Ya tener wallet conectada
   - Tener 1-2 regalos de ejemplo
   - Saber exactamente qué vas a mostrar

3. **Iluminación y audio:**
   - No necesitas hablar (video sin voz)
   - Pero si hablas: mic cerca, sin ruido de fondo

### **Script de grabación** (Claude te dará detallado):

**SHOT 1 (0-15s): PROBLEMA**
```
- Mostrar pantalla de error en wallet tradicional
- O mostrar UI confusa de otra app
- Overlay texto: "Gifting crypto is hard"
```

**SHOT 2 (15-45s): CREAR REGALO**
```
- Homepage → Click "Create Gift"
- Gift Wizard: Subir foto, monto, mensaje
- Click "Create" → Espera mint
- Resultado: Link generado
- Overlay texto: "1. Create in 60 seconds"
```

**SHOT 3 (45-75s): CLAIM**
```
- Nueva ventana incógnito
- Pegar link del regalo
- Claim flow: Email → Education breve → Connect wallet
- Success: Wallet con crypto
- Overlay texto: "2. Receiver gets real wallet"
```

**SHOT 4 (75-90s): RESULTADO**
```
- Ver wallet con balance
- Hacer transacción rápida (swap o send)
- Final: Logo CryptoGift + "Start gifting at cryptogift-wallets.vercel.app"
```

### **Edición básica:**

**CapCut (Recomendado para principiantes):**
1. Download: https://capcut.com
2. Import tus clips
3. Arrastra a timeline
4. Corta secciones aburridas
5. Añade text overlays:
   - Font: Sans-serif clean
   - Color: Blanco con sombra negra
   - Posición: Bottom third
6. Añade música de fondo (opcional):
   - CapCut tiene biblioteca gratis
   - Volumen bajo (20-30%)
7. Export: 1080p, MP4

**Resultado:** Video demo profesional ✅

---

## 📧 CÓMO ENVIAR APLICACIONES

### **Base Grant Application:**

**1. Ve al portal:**
- URL: https://base.org/builder-grants
- O busca "Base Builder Grants" en Google

**2. Llena el form:**
Claude te dará respuestas pre-escritas para cada sección. Tú solo copia/pega:

- **Project name:** CryptoGift Wallets
- **Category:** Infrastructure / Social / DeFi (elige mejor match)
- **Description:** [Claude te da 2-3 párrafos]
- **GitHub:** [tu repo URL]
- **Demo:** [link a tu app + video]
- **Team:** [Claude te da template]
- **Why Base:** [Claude explica razones específicas]
- **Traction:** [tus métricas reales]
- **Budget:** [Claude hace breakdown]
- **Milestones:** [Claude define 3-4 milestones]

**3. Attachments:**
- Technical 1-pager (PDF)
- Video demo (link o upload)
- Screenshots (opcional)

**4. Review:**
- Lee TODO antes de submit
- Verifica links funcionan
- Check spelling
- Doble-check email

**5. Submit:**
- Click "Submit Application"
- Save confirmation email
- Anota en tu tracking sheet

**Tiempo total:** 30-45 minutos

---

### **Otras aplicaciones (mismo proceso):**

**Optimism Grants:**
- Portal: https://app.optimism.io/retropgf
- Similar a Base, Claude te da contenido
- Enfatiza impacto public good

**Gitcoin Grants:**
- Portal: https://grants.gitcoin.co
- Necesitas crear project profile primero
- Claude te da description + updates

**ETHGlobal Hackathons:**
- Portal: https://ethglobal.com
- Register a hackathon
- Submit project con demo
- Claude te ayuda con presentation

---

## ⚠️ ERRORES COMUNES A EVITAR

### **Al grabar video:**
❌ No hables demasiado rápido
❌ No asumas que la gente sabe cripto
❌ No uses jerga técnica sin explicar
✅ Muestra, no cuentes
✅ Overlay text para claridad
✅ Testing en mute (debe entenderse sin audio)

### **Al enviar aplicaciones:**
❌ No copies/pegues sin leer
❌ No uses mismo pitch para todos (personaliza)
❌ No ignores instrucciones específicas
✅ Lee guidelines completas
✅ Follow up después de 1-2 semanas
✅ Track todo en spreadsheet

### **Al hacer outreach:**
❌ No spammees mismo mensaje
❌ No pidas dinero directo
❌ No seas insistente si no responden
✅ Personaliza cada mensaje
✅ Ofrece valor primero (demo, collaboration)
✅ Follow up suave después de 3-5 días

---

## 📊 TRACKING SHEET (Copia este template)

```markdown
# TRACKING FINANCIAMIENTO CRYPTOGIFT

## APLICACIONES ENVIADAS

| Grant/Program | Fecha Envío | Monto | Status | Deadline | Notas |
|--------------|-------------|-------|--------|----------|-------|
| Base Builder | 13/Nov      | $10k  | Pending| -        | App #12345 |
| Polygon Frame| 18/Nov      | $25k  | Pending| -        | Frame URL: ... |
| Product Hunt | 18/Nov      | -     | Live   | -        | #5 del día |
| Optimism S7  | TBD         | $50k  | Draft  | May 2025 | -  |

## OUTREACH ENVIADO

| Contacto | Tipo | Fecha | Status | Seguimiento |
|----------|------|-------|--------|-------------|
| @builder1 | DM  | 12/Nov| Pending| Follow-up 15/Nov |
| Discord X | Post| 13/Nov| 3 replies| DMs enviados |

## MÉTRICAS SEMANALES

| Semana | Gifts Created | Claims | New Users | Key Event |
|--------|--------------|--------|-----------|-----------|
| 1      | 387          | 329    | 142       | Base sent |
| 2      | TBD          | TBD    | TBD       | PH launch |

## PRÓXIMOS PASOS

- [ ] Semana 1: Métricas + Base Grant
- [ ] Semana 2: Farcaster Frame + Outreach
- [ ] Semana 3: Product Hunt launch
- [ ] Semana 4: Follow-ups + nuevas apps
```

---

## 🆘 CUANDO TENGAS DUDAS

**Antes de hacer cualquier tarea, pregúntale a Claude:**

"Claude, voy a hacer [TAREA X].

¿Puedes:
1. Explicarme paso a paso exactamente qué hacer
2. Darme el contenido/template que necesito
3. Decirme qué errores evitar
4. Verificar que lo estoy haciendo bien"

**Claude estará ahí en cada paso** ✅

---

## ✅ CHECKLIST FINAL SEMANAL

**Semana 1:**
- [ ] Métricas recopiladas
- [ ] Base Grant enviado
- [ ] Video demo grabado
- [ ] Cuentas creadas

**Semana 2:**
- [ ] Farcaster Frame deployed
- [ ] 20+ outreach enviados
- [ ] GitHub actualizado
- [ ] Polygon submission

**Semana 3:**
- [ ] Product Hunt launched
- [ ] 100+ visitors a la app
- [ ] 5+ leads calificados
- [ ] Follow-ups a apps

**Semana 4-12:**
- [ ] Rutina diaria establecida
- [ ] 2-3 new apps/semana
- [ ] Métricas actualizadas
- [ ] Primeros resultados $$

---

*Documento creado por Claude para Rafael - CryptoGift Wallets*
*Siempre pregunta cuando tengas dudas, para eso estoy aquí*
