# PLAN DE ACCION: PAGINA MODELOS
## CryptoGift Wallets - Enero 2026

---

## 1. VISION DE LA PAGINA

### Objetivo
Crear una pagina showcase que presente todos los modos de uso del sistema CryptoGift de manera visualmente impactante, organizada por categorias, donde cada modo tiene su propio panel interactivo listo para ser conectado.

### Audiencia
- Nuevos colaboradores del DAO
- Potenciales inversores
- Partners tecnologicos
- Comunidad crypto

### Acceso Inicial
- Ruta: `/modelos` o `/models`
- Acceso restringido inicialmente (solo admin)
- Futura integracion directa en el DAO

---

## 2. DISEÑO VISUAL

### Estilo Base (Heredado del Sistema)
```css
/* Glass Morphism Core */
backdrop-blur-xl
bg-white/5 dark:bg-gray-900/50
border border-white/10
shadow-xl shadow-black/20

/* Gradientes Premium */
from-amber-500/20 via-orange-500/10 to-transparent
from-blue-500/20 via-purple-500/10 to-transparent

/* Animaciones Spring */
stiffness: 300, damping: 25
```

### Paleta de Colores por Categoria
```
Crypto Onboarding:    amber/orange (#F59E0B → #F97316)
Campañas Marketing:   blue/cyan (#3B82F6 → #06B6D4)
Competencias:         red/pink (#EF4444 → #EC4899)
Gobernanza DAO:       purple/violet (#8B5CF6 → #7C3AED)
Servicios Finance:    green/emerald (#10B981 → #059669)
Gaming:               pink/rose (#EC4899 → #F43F5E)
Social:               indigo/blue (#6366F1 → #3B82F6)
Enterprise:           gray/slate (#64748B → #475569)
```

### Layout Principal
```
┌─────────────────────────────────────────────────────────────┐
│  NAVBAR (existente)                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗ │
│  ║  HERO SECTION                                          ║ │
│  ║  "Modelos de Uso"                                      ║ │
│  ║  "Explora las infinitas posibilidades de CryptoGift"   ║ │
│  ║  [8 iconos de categorias animados]                     ║ │
│  ╚═══════════════════════════════════════════════════════╝ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ FILTROS / TABS DE CATEGORIAS                           ││
│  │ [Todos] [Onboarding] [Campañas] [Competencias] ...     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                │
│  │  MODELO   │ │  MODELO   │ │  MODELO   │                │
│  │  CARD 1   │ │  CARD 2   │ │  CARD 3   │                │
│  │           │ │           │ │           │                │
│  │  [Ver]    │ │  [Ver]    │ │  [Ver]    │                │
│  └───────────┘ └───────────┘ └───────────┘                │
│                                                             │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐                │
│  │  MODELO   │ │  MODELO   │ │  MODELO   │                │
│  │  CARD 4   │ │  CARD 5   │ │  CARD 6   │                │
│  └───────────┘ └───────────┘ └───────────┘                │
│                                                             │
│  ... (grid responsive 1-4 columnas)                        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  FOOTER (existente)                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. COMPONENTES A CREAR

### 3.1 ModelCard Component
```typescript
interface ModelCardProps {
  id: string;
  title: string;
  description: string;
  category: CategoryType;
  icon: LucideIcon;
  complexity: 1 | 2 | 3 | 4 | 5;
  status: 'deployed' | 'ready' | 'building' | 'planned';
  integrations: string[];
  onClick: () => void;
}
```

**Visual del Card:**
```
┌─────────────────────────────────┐
│  [Icon]                    ★★★☆☆│  <- Complejidad
│                                 │
│  Titulo del Modelo              │
│  ─────────────────              │
│  Descripcion breve del modo     │
│  de uso y sus beneficios...     │
│                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐    │
│  │Escrow│ │DAO   │ │ERC6551│   │  <- Integraciones
│  └──────┘ └──────┘ └──────┘    │
│                                 │
│  [🟢 Desplegado]    [Ver Mas →]│  <- Status + CTA
└─────────────────────────────────┘
```

### 3.2 ModelDetailModal Component
Modal que se abre al hacer click en un card, mostrando:
- Descripcion completa
- Flujo paso a paso (timeline visual)
- Integraciones detalladas
- Casos de uso especificos
- Wireframe/mockup del UI futuro
- Boton "Conectar" (deshabilitado hasta integracion)

### 3.3 CategoryTabs Component
Tabs horizontales scrolleables para filtrar por categoria:
```typescript
const categories = [
  { id: 'all', label: 'Todos', icon: LayoutGrid },
  { id: 'onboarding', label: 'Onboarding', icon: Rocket },
  { id: 'campaigns', label: 'Campañas', icon: Megaphone },
  { id: 'competitions', label: 'Competencias', icon: Trophy },
  { id: 'governance', label: 'Gobernanza', icon: Vote },
  { id: 'finance', label: 'Finanzas', icon: Wallet },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
  { id: 'social', label: 'Social', icon: Users },
  { id: 'enterprise', label: 'Enterprise', icon: Building },
];
```

### 3.4 StatusBadge Component
Badges visuales para el estado de cada modelo:
```typescript
const statusConfig = {
  deployed: { label: 'Desplegado', color: 'green', icon: CheckCircle },
  ready: { label: 'Listo', color: 'blue', icon: Circle },
  building: { label: 'En Construccion', color: 'yellow', icon: Hammer },
  planned: { label: 'Planificado', color: 'gray', icon: Clock },
};
```

### 3.5 IntegrationChip Component
Chips pequeños que muestran las tecnologias involucradas:
```typescript
const integrationConfig = {
  escrow: { label: 'Escrow', color: 'amber' },
  erc6551: { label: 'ERC-6551', color: 'purple' },
  gnosis: { label: 'Gnosis Safe', color: 'green' },
  manifold: { label: 'Manifold', color: 'blue' },
  education: { label: 'Education', color: 'cyan' },
  aa: { label: 'Account Abstraction', color: 'pink' },
};
```

---

## 4. ESTRUCTURA DE ARCHIVOS

```
frontend/src/
├── app/
│   └── modelos/
│       └── page.tsx                    # Pagina principal
├── components/
│   └── modelos/
│       ├── ModelCard.tsx               # Card individual
│       ├── ModelDetailModal.tsx        # Modal de detalle
│       ├── CategoryTabs.tsx            # Tabs de filtro
│       ├── StatusBadge.tsx             # Badge de estado
│       ├── IntegrationChip.tsx         # Chip de integracion
│       ├── ModelHero.tsx               # Hero section
│       └── ModelGrid.tsx               # Grid de cards
├── data/
│   └── modelosData.ts                  # Data de todos los modelos
└── types/
    └── modelos.ts                      # TypeScript types
```

---

## 5. DATA STRUCTURE

### modelosData.ts
```typescript
export interface Modelo {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  category: CategoryType;
  icon: string; // Lucide icon name
  complexity: 1 | 2 | 3 | 4 | 5;
  status: 'deployed' | 'ready' | 'building' | 'planned';
  integrations: IntegrationType[];
  flow: FlowStep[];
  useCases: string[];
  estimatedTime?: string;
  requiredRoles?: string[];
}

export const MODELOS: Modelo[] = [
  // Categoria: Crypto Onboarding
  {
    id: 'regalo-bienvenida',
    title: 'Regalo de Bienvenida Cripto',
    titleEn: 'Crypto Welcome Gift',
    description: 'El modo core del sistema. Regala NFT-wallets con criptomonedas reales.',
    category: 'onboarding',
    icon: 'Gift',
    complexity: 1,
    status: 'deployed',
    integrations: ['escrow', 'erc6551', 'education'],
    flow: [
      { step: 1, title: 'Crear Regalo', description: 'Sube imagen y deposita crypto' },
      { step: 2, title: 'Configurar', description: 'Password y condiciones' },
      { step: 3, title: 'Compartir', description: 'Envia link al destinatario' },
      { step: 4, title: 'Claim', description: 'Destinatario reclama su regalo' },
    ],
    useCases: ['Cumpleaños', 'Onboarding familiar', 'Welcome packages'],
  },
  // ... 31 modelos mas
];
```

---

## 6. IMPLEMENTACION POR FASES

### FASE 1: Foundation (Dia 1-2)
**Objetivo**: Estructura basica y componentes core

**Tareas**:
1. [ ] Crear carpeta `/app/modelos/`
2. [ ] Crear `page.tsx` con layout basico
3. [ ] Crear types en `/types/modelos.ts`
4. [ ] Crear `modelosData.ts` con los 32 modelos
5. [ ] Implementar `ModelCard.tsx` basico
6. [ ] Implementar `CategoryTabs.tsx`
7. [ ] Implementar `StatusBadge.tsx`
8. [ ] Implementar `IntegrationChip.tsx`

**Resultado**: Pagina funcional con grid de cards basicos

---

### FASE 2: Visual Polish (Dia 3-4)
**Objetivo**: Aplicar el diseño premium

**Tareas**:
1. [ ] Diseñar `ModelHero.tsx` con animaciones
2. [ ] Aplicar glass morphism a todos los componentes
3. [ ] Implementar gradientes por categoria
4. [ ] Añadir animaciones Framer Motion
5. [ ] Responsive design (mobile-first)
6. [ ] Hover effects premium
7. [ ] Loading states y skeletons

**Resultado**: Pagina visualmente impactante

---

### FASE 3: Detail Modal (Dia 5-6)
**Objetivo**: Modal completo con toda la informacion

**Tareas**:
1. [ ] Crear `ModelDetailModal.tsx`
2. [ ] Implementar timeline visual del flujo
3. [ ] Diseñar seccion de integraciones
4. [ ] Crear visualizacion de casos de uso
5. [ ] Añadir mockups/wireframes por modelo
6. [ ] Implementar boton "Conectar" (disabled)
7. [ ] Animaciones de entrada/salida

**Resultado**: Modal informativo completo

---

### FASE 4: Advanced Features (Dia 7-8)
**Objetivo**: Funcionalidades avanzadas

**Tareas**:
1. [ ] Busqueda por texto
2. [ ] Filtro por complejidad
3. [ ] Filtro por estado
4. [ ] Sorting (alfabetico, complejidad, etc.)
5. [ ] URL params para deep linking
6. [ ] Favoritos (localStorage)
7. [ ] Compartir modelo especifico

**Resultado**: UX completa y profesional

---

### FASE 5: Access Control (Dia 9)
**Objetivo**: Restringir acceso a admin

**Tareas**:
1. [ ] Implementar middleware de autenticacion
2. [ ] Verificar wallet autorizada
3. [ ] Redirect a home si no autorizado
4. [ ] Mensaje de "acceso restringido"
5. [ ] Lista de wallets autorizadas

**Resultado**: Pagina protegida

---

### FASE 6: i18n & Polish (Dia 10)
**Objetivo**: Soporte multilenguaje y pulido final

**Tareas**:
1. [ ] Traducciones ES/EN
2. [ ] SEO metadata
3. [ ] OG images dinamicos
4. [ ] Analytics tracking
5. [ ] Performance optimization
6. [ ] Testing final
7. [ ] Deploy a produccion

**Resultado**: Pagina lista para produccion

---

## 7. CRITERIOS DE ACEPTACION

### Visuales
- [ ] Glass morphism consistente con el resto de la app
- [ ] Animaciones fluidas (60fps)
- [ ] Responsive en todos los dispositivos
- [ ] Dark mode por defecto
- [ ] Colores de categoria correctos

### Funcionales
- [ ] 32 modelos mostrados correctamente
- [ ] Filtros funcionando
- [ ] Modal abriendo con info completa
- [ ] Acceso restringido funcionando
- [ ] Deep links funcionando

### Tecnicos
- [ ] TypeScript sin errores
- [ ] ESLint sin warnings
- [ ] Build exitoso
- [ ] Performance > 90 Lighthouse
- [ ] Accesibilidad WCAG AA

---

## 8. ESTIMACION DE TIEMPO

| Fase | Duracion | Horas |
|------|----------|-------|
| Foundation | 2 dias | 8-10h |
| Visual Polish | 2 dias | 8-10h |
| Detail Modal | 2 dias | 8-10h |
| Advanced Features | 2 dias | 6-8h |
| Access Control | 1 dia | 3-4h |
| i18n & Polish | 1 dia | 4-6h |
| **TOTAL** | **10 dias** | **37-48h** |

---

## 9. SIGUIENTE PASO INMEDIATO

**TIPO A (Quirurgico)**: Crear estructura basica

1. Crear `/app/modelos/page.tsx`
2. Crear `/types/modelos.ts`
3. Crear `/data/modelosData.ts` (primeros 8 modelos)
4. Crear `ModelCard.tsx` basico

**Archivos a crear**: 4
**Lineas estimadas**: ~400
**Tiempo estimado**: 2-3 horas

---

*Plan elaborado: Enero 12, 2026*
*Autor: Claude Code*
*Proyecto: CryptoGift Wallets DAO*
