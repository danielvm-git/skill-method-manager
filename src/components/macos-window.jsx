/**
 * macos-window.jsx
 * macOS Tahoe "Liquid Glass" window primitive components.
 *
 * Ported from the bigpowers design bundle (claude.ai/design).
 * All design tokens (radii, colors, blur values, shadows) match
 * the prototype exactly — do not change without updating the design file.
 *
 * Exports:
 *   MacWindow        — top-level window shell (sidebar + toolbar + content)
 *   MacSidebar       — frosted-glass sidebar panel (220 px)
 *   MacSidebarItem   — clickable nav row with optional selected state
 *   MacSidebarHeader — muted section label inside the sidebar
 *   MacToolbar       — titlebar row with search pill and action button
 *   MacGlass         — liquid-glass surface primitive (blur + tint + highlight)
 *   MacTrafficLights — close / minimise / zoom dot trio
 */

// ─── Design tokens ────────────────────────────────────────────────────────────

/** System-font stack that resolves to SF Pro on macOS. */
const MAC_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro", "Helvetica Neue", sans-serif'

// Traffic-light colours (macOS Tahoe)
const TL_RED = '#ff736a'
const TL_YELLOW = '#febc2e'
const TL_GREEN = '#19c332'

// ─── MacGlass ─────────────────────────────────────────────────────────────────

/**
 * Liquid-glass surface: backdrop blur + white tint + inset highlight ring.
 *
 * @param {object}  props
 * @param {React.ReactNode} props.children
 * @param {number}  [props.radius=16]   — border-radius in px
 * @param {object}  [props.style={}]    — additional styles on the wrapper
 */
export function MacGlass({ children, radius = 16, style = {} }) {
  return (
    <div style={{ position: 'relative', borderRadius: radius, ...style }}>
      {/* Blur + tint layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: radius,
          background: 'var(--mac-glass-bg)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '0.5px solid var(--mac-glass-border)',
          boxShadow: 'var(--mac-glass-shadow)',
        }}
      />
      {/* Content sits above the blur layer */}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}

// ─── MacTrafficLights ─────────────────────────────────────────────────────────

/**
 * Close / minimise / zoom dot trio.
 *
 * @param {object} [props.style={}] — additional styles on the row wrapper
 */
export function MacTrafficLights({ style = {} }) {
  const dot = (bg) => (
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: bg,
        border: '0.5px solid rgba(0,0,0,0.10)',
        flexShrink: 0,
      }}
    />
  )

  return (
    <div
      style={{
        display: 'flex',
        gap: 9,
        alignItems: 'center',
        padding: 1,
        ...style,
      }}
    >
      {dot(TL_RED)}
      {dot(TL_YELLOW)}
      {dot(TL_GREEN)}
    </div>
  )
}

// ─── MacToolbar ───────────────────────────────────────────────────────────────

/**
 * Window toolbar row: title on the left, glass action button + search pill on
 * the right.
 *
 * @param {object} props
 * @param {string} [props.title='Folder']  — window title string
 * @param {string} [props.searchPlaceholder='Search'] — placeholder text
 * @param {string} [props.searchValue=''] — current search value
 * @param {function} [props.onSearchChange] — handler for search input change
 * @param {React.ReactNode} [props.actions] — optional extra controls (replaces default dot)
 */
export function MacToolbar({
  title = 'Folder',
  searchPlaceholder = 'Search',
  searchValue = '',
  onSearchChange,
  actions,
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        padding: 8,
        flexShrink: 0,
      }}
    >
      {/* Window title */}
      <div
        style={{
          fontFamily: MAC_FONT,
          fontSize: 15,
          fontWeight: 700,
          color: 'var(--mac-text)',
          whiteSpace: 'nowrap',
          paddingLeft: 8,
        }}
      >
        {title}
      </div>

      <div style={{ flex: 1 }} />

      {/* Action button — custom children or default placeholder dot */}
      {actions ?? (
        <MacGlass radius={18}>
          <div
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: 'var(--mac-text)',
                opacity: 0.4,
              }}
            />
          </div>
        </MacGlass>
      )}

      {/* Search pill */}
      <MacGlass radius={18}>
        <div
          style={{
            width: 140,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 12px',
          }}
        >
          {/* Magnifier icon */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="5.5"
              cy="5.5"
              r="4"
              stroke="var(--mac-input-placeholder)"
              strokeWidth="1.5"
            />
            <path
              d="M8.5 8.5l3 3"
              stroke="var(--mac-input-placeholder)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              outline: 'none',
              fontFamily: MAC_FONT,
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--mac-text)',
              padding: 0,
            }}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange?.('')}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                width: 14,
                height: 14,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                color: 'var(--mac-input-placeholder)',
                cursor: 'default',
                flexShrink: 0,
                padding: 0,
              }}
            >
              ✕
            </button>
          )}
        </div>
      </MacGlass>
    </div>
  )
}

// ─── MacSidebarItem ───────────────────────────────────────────────────────────

/**
 * Single navigation row inside the sidebar.
 *
 * @param {object}  props
 * @param {string}  props.label          — display text
 * @param {boolean} [props.selected]     — highlights the row
 * @param {React.ReactNode} [props.icon] — optional icon node (replaces default dot)
 * @param {function} [props.onClick]     — click handler
 */
export function MacSidebarItem({ label, selected = false, icon, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      aria-current={selected ? 'page' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        height: 24,
        padding: '4px 10px 4px 6px',
        margin: '0 10px',
        borderRadius: 8,
        position: 'relative',
        fontFamily: MAC_FONT,
        fontSize: 11,
        fontWeight: 500,
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      {/* Selected highlight overlay */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 8,
            background: 'var(--accent-soft)',
          }}
        />
      )}

      {/* Icon — custom or default dot */}
      {icon ?? (
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: selected ? 'var(--accent)' : 'var(--mac-text)',
            opacity: selected ? 1 : 0.4,
            flexShrink: 0,
            position: 'relative',
          }}
        />
      )}

      <span style={{ color: 'var(--mac-text)', position: 'relative' }}>
        {label}
      </span>
    </div>
  )
}

// ─── MacSidebarHeader ─────────────────────────────────────────────────────────

/**
 * Muted all-caps section label inside the sidebar.
 *
 * @param {object} props
 * @param {string} props.title — section label text
 */
export function MacSidebarHeader({ title }) {
  return (
    <div
      style={{
        padding: '14px 18px 5px',
        fontFamily: MAC_FONT,
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--mac-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {title}
    </div>
  )
}

// ─── MacSidebar ───────────────────────────────────────────────────────────────

/**
 * Frosted-glass sidebar panel (220 px wide).
 * Place `MacSidebarHeader` and `MacSidebarItem` children inside.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children — sidebar content
 */
export function MacSidebar({ children }) {
  return (
    <div
      style={{
        width: 220,
        height: '100%',
        padding: 8,
        flexShrink: 0,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Frosted glass panel */}
      <div
        style={{
          position: 'absolute',
          inset: 8,
          borderRadius: 18,
          background: 'var(--mac-sidebar-bg)',
          backdropFilter: 'blur(50px) saturate(200%)',
          WebkitBackdropFilter: 'blur(50px) saturate(200%)',
          border: '0.5px solid var(--mac-sidebar-border)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '10px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Traffic lights row */}
        <div
          style={{
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            marginBottom: 4,
          }}
        >
          <MacTrafficLights />
        </div>

        {children}
      </div>
    </div>
  )
}

// ─── MacWindow ────────────────────────────────────────────────────────────────

/**
 * Top-level macOS window shell.
 *
 * Layout: `[MacSidebar] | [MacToolbar / content area]`
 *
 * Default size matches the design spec: 1200 × 800 (min 900 × 600).
 *
 * @param {object} props
 * @param {number}  [props.width=1200]      — window width in px
 * @param {number}  [props.height=800]      — window height in px
 * @param {string}  [props.title='Folder']  — toolbar title
 * @param {string}  [props.searchPlaceholder='Search']
 * @param {string}  [props.searchValue='']
 * @param {function} [props.onSearchChange]
 * @param {React.ReactNode} [props.sidebar] — sidebar content (items, headers)
 * @param {React.ReactNode} [props.toolbar] — override toolbar entirely
 * @param {React.ReactNode} [props.actions] — extra toolbar controls
 * @param {React.ReactNode} props.children  — main content area
 */
export function MacWindow({
  width = 1200,
  height = 800,
  title = 'Folder',
  searchPlaceholder = 'Search',
  searchValue = '',
  onSearchChange,
  sidebar,
  toolbar,
  actions,
  children,
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 26,
        overflow: 'hidden',
        background: 'var(--mac-window-bg)',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.23), 0 16px 48px rgba(0,0,0,0.35)',
        display: 'flex',
        position: 'relative',
        fontFamily: MAC_FONT,
      }}
    >
      {/* Sidebar */}
      {sidebar !== undefined && <MacSidebar>{sidebar}</MacSidebar>}

      {/* Main column */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Toolbar — custom or default */}
        {toolbar ?? (
          <MacToolbar
            title={title}
            searchPlaceholder={searchPlaceholder}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            actions={actions}
          />
        )}

        {/* Scrollable content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '4px 8px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
