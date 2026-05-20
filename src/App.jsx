import { useState, useEffect, useMemo } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { open } from '@tauri-apps/plugin-dialog'
import {
  MacWindow,
  MacSidebarItem,
  MacSidebarHeader,
  MacGlass,
} from './components/macos-window'
import {
  fetchRegistrySkills,
  fetchCategories,
  fetchSkillDetail,
} from './api/registry'

function StatusBadge({ status }) {
  const colors = {
    active: 'var(--ok)',
    inactive: 'var(--muted)',
    outdated: 'var(--warn)',
    broken: 'var(--danger)',
    installed: 'var(--info)',
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '2px 8px',
        borderRadius: 'var(--r-md)',
        background: 'rgba(0,0,0,0.05)',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase',
      }}
    >
      <div
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: colors[status] || colors.inactive,
        }}
      />
      {status}
    </div>
  )
}

function FilterChip({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: 'var(--r-2xl)',
        background: active ? 'var(--accent)' : 'var(--paper)',
        color: active ? 'white' : 'var(--ink)',
        border: active ? 'none' : '1px solid var(--line)',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: active ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
      }}
    >
      {label}
      {count !== undefined && (
        <span
          style={{
            opacity: 0.6,
            fontSize: '10px',
            background: active ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
            padding: '1px 6px',
            borderRadius: '10px',
          }}
        >
          {count}
        </span>
      )}
    </button>
  )
}

function SkillCard({ skill, onClick, isInstalled }) {
  return (
    <div onClick={() => onClick(skill)} style={{ cursor: 'pointer' }}>
      <MacGlass radius={14} style={{ marginBottom: '12px' }}>
        <div
          style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--r-md)',
              background: 'var(--accent-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            {skill.type === 'method' ? '🛠️' : '📦'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>
                {skill.name}
              </span>
              <span style={{ color: 'var(--muted)', fontSize: '12px' }}>
                v{skill.version}
              </span>
            </div>
            <div
              style={{
                fontSize: '13px',
                color: 'var(--ink-2)',
                marginTop: '2px',
              }}
            >
              {skill.description}
            </div>
          </div>

          <div
            style={{
              textAlign: 'right',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '8px',
            }}
          >
            {isInstalled ? (
              <StatusBadge status="installed" />
            ) : (
              <StatusBadge status={skill.status} />
            )}
            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
              by {skill.author}
            </div>
          </div>
        </div>
      </MacGlass>
    </div>
  )
}

function SkillCardSkeleton() {
  return (
    <MacGlass radius={14} style={{ marginBottom: '12px' }}>
      <div
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          opacity: 0.5,
        }}
      >
        <div
          className="shimmer"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--r-md)',
            background: 'var(--line)',
          }}
        />

        <div style={{ flex: 1 }}>
          <div
            className="shimmer"
            style={{
              width: '40%',
              height: '18px',
              background: 'var(--line)',
              borderRadius: '4px',
              marginBottom: '8px',
            }}
          />
          <div
            className="shimmer"
            style={{
              width: '80%',
              height: '14px',
              background: 'var(--line)',
              borderRadius: '4px',
            }}
          />
        </div>

        <div
          style={{
            width: '60px',
            height: '24px',
            background: 'var(--line)',
            borderRadius: 'var(--r-md)',
          }}
          className="shimmer"
        />
      </div>
    </MacGlass>
  )
}

function InstallSheet({ skill, onClose, onComplete }) {
  const [step, setStep] = useState(1) // 1: Review, 2: Progress, 3: Success
  const [deps, setDeps] = useState([])
  const [loadingDeps, setLoadingDeps] = useState(true)
  const [progress, setProgress] = useState({
    percent: 0,
    message: 'Initializing...',
  })

  useEffect(() => {
    async function loadDeps() {
      try {
        const result = await invoke('resolve_dependencies', {
          skillId: skill.id,
        })
        setDeps(result)
      } catch (e) {
        console.error('Failed to resolve deps:', e)
      } finally {
        setLoadingDeps(false)
      }
    }
    loadDeps()
  }, [skill.id])

  useEffect(() => {
    let unlistenProgress
    let unlistenSuccess

    async function setupListeners() {
      unlistenProgress = await listen('install-progress', (event) => {
        if (event.payload.id === skill.id) {
          setProgress({
            percent: event.payload.progress * 100,
            message: event.payload.message,
          })
        }
      })
      unlistenSuccess = await listen('install-success', (event) => {
        if (event.payload === skill.id) {
          setStep(3)
          setTimeout(() => {
            onComplete()
          }, 2000)
        }
      })
    }

    if (step === 2) {
      setupListeners()
      invoke('install_skill', { skillId: skill.id })
    }

    return () => {
      if (unlistenProgress) unlistenProgress()
      if (unlistenSuccess) unlistenSuccess()
    }
  }, [step, skill.id, onComplete])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <MacGlass radius={20} style={{ width: '400px', overflow: 'hidden' }}>
        <div style={{ padding: '32px', textAlign: 'center' }}>
          {step === 1 && (
            <>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '8px',
                }}
              >
                Install {skill.name}
              </h3>
              <p
                style={{
                  color: 'var(--muted)',
                  fontSize: '14px',
                  marginBottom: '24px',
                }}
              >
                This will download and configure the skill in your library.
              </p>

              <div
                style={{
                  textAlign: 'left',
                  background: 'var(--bg)',
                  padding: '16px',
                  borderRadius: 'var(--r-lg)',
                  marginBottom: '24px',
                }}
              >
                <h4
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                  }}
                >
                  Required Dependencies
                </h4>
                {loadingDeps ? (
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    Resolving...
                  </div>
                ) : deps.length > 0 ? (
                  <ul
                    style={{
                      listStyle: 'none',
                      fontSize: '13px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {deps.map((d) => (
                      <li
                        key={d}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <div
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: 'var(--accent)',
                          }}
                        />
                        {d}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    No extra dependencies required.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--line)',
                    background: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  disabled={loadingDeps}
                  onClick={() => setStep(2)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--r-md)',
                    border: 'none',
                    background: 'var(--accent)',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: loadingDeps ? 0.5 : 1,
                  }}
                >
                  Confirm Install
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 24px',
                  position: 'relative',
                }}
              >
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="var(--line)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="8"
                    strokeDasharray={226}
                    strokeDashoffset={226 - (226 * progress.percent) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyCenter: 'center',
                    fontWeight: '700',
                    fontSize: '14px',
                  }}
                >
                  {Math.round(progress.percent)}%
                </div>
              </div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '8px',
                }}
              >
                Installing...
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                {progress.message}
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '8px',
                }}
              >
                Success!
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                {skill.name} has been installed and is ready to use.
              </p>
            </>
          )}
        </div>
      </MacGlass>
    </div>
  )
}

function SkillDetail({
  skill,
  onClose,
  isRegistry = false,
  isInstalled = false,
  onInstall,
}) {
  if (!skill) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '420px',
        height: '100%',
        background: 'var(--paper)',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.05)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid var(--line)',
      }}
    >
      <div
        style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: 'var(--muted)',
          }}
        >
          ✕
        </button>
        <span style={{ fontWeight: '700', fontSize: '15px' }}>
          {isRegistry ? 'Registry Skill' : 'Skill Details'}
        </span>
        <div style={{ width: '18px' }} />
      </div>

      <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: 'var(--r-xl)',
              background: 'var(--accent-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              margin: '0 auto 16px',
            }}
          >
            {skill.type === 'method' ? '🛠️' : '📦'}
          </div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>
            {skill.name}
          </h2>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            {isInstalled ? (
              <StatusBadge status="installed" />
            ) : (
              <StatusBadge status={skill.status} />
            )}
            <span style={{ color: 'var(--muted)', fontSize: '13px' }}>
              v{skill.version}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: 'var(--muted)',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            Description
          </h3>
          <p
            style={{
              fontSize: '15px',
              lineHeight: '1.6',
              color: 'var(--ink-2)',
            }}
          >
            {skill.description}
          </p>
          {skill.longDescription && (
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: 'var(--muted)',
                marginTop: '12px',
              }}
            >
              {skill.longDescription}
            </p>
          )}
        </div>

        {skill.dependencies && skill.dependencies.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              Dependencies
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {skill.dependencies.map((dep) => (
                <span
                  key={dep}
                  style={{
                    background: 'var(--bg)',
                    padding: '4px 10px',
                    borderRadius: 'var(--r-sm)',
                    fontSize: '12px',
                  }}
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '32px' }}>
          <h3
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: 'var(--muted)',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            Metadata
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '12px',
              fontSize: '14px',
            }}
          >
            <span style={{ color: 'var(--muted)' }}>Type</span>
            <span style={{ textTransform: 'capitalize' }}>
              {skill.type || 'skill'}
            </span>
            <span style={{ color: 'var(--muted)' }}>Author</span>
            <span>{skill.author}</span>
            <span style={{ color: 'var(--muted)' }}>Skill ID</span>
            <code
              style={{
                fontSize: '12px',
                background: 'var(--bg)',
                padding: '2px 4px',
                borderRadius: '4px',
              }}
            >
              {skill.id}
            </code>
          </div>
        </div>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {isRegistry ? (
            <button
              disabled={isInstalled}
              onClick={() => onInstall(skill)}
              style={{
                padding: '12px',
                borderRadius: 'var(--r-md)',
                background: isInstalled ? 'var(--line)' : 'var(--accent)',
                color: 'white',
                border: 'none',
                fontWeight: '600',
                cursor: isInstalled ? 'default' : 'pointer',
              }}
            >
              {isInstalled ? 'Already Installed' : 'Install Skill'}
            </button>
          ) : (
            <>
              <button
                style={{
                  padding: '12px',
                  borderRadius: 'var(--r-md)',
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Enable Skill
              </button>
              <button
                style={{
                  padding: '12px',
                  borderRadius: 'var(--r-md)',
                  background: 'rgba(255,0,0,0.05)',
                  color: 'var(--danger)',
                  border: '1px solid var(--danger)',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Uninstall
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingsView({ config, onUpdate }) {
  const handlePickDir = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select Skills Directory',
    })

    if (selected) {
      onUpdate({ ...config, skills_dir: selected })
    }
  }

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '32px' }}>Settings</h2>

      <div style={{ marginBottom: '48px' }}>
        <h3
          style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}
        >
          Library Configuration
        </h3>
        <MacGlass radius={14}>
          <div
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--muted)',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                }}
              >
                Skills Directory
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    background: 'var(--bg)',
                    borderRadius: 'var(--r-md)',
                    fontSize: '13px',
                    color: 'var(--ink-2)',
                    border: '1px solid var(--line)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {config.skills_dir || 'Default (~/.claude/skills)'}
                </div>
                <button
                  onClick={handlePickDir}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  Change...
                </button>
              </div>
              <p
                style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: 'var(--muted)',
                }}
              >
                The app will scan this directory for <code>skill.toml</code>{' '}
                manifest files.
              </p>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--line)',
                paddingTop: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>
                  Auto-reload library
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--muted)',
                    marginTop: '2px',
                  }}
                >
                  Watch for file changes and update automatically.
                </div>
              </div>
              <button
                onClick={() =>
                  onUpdate({ ...config, auto_reload: !config.auto_reload })
                }
                style={{
                  width: '40px',
                  height: '24px',
                  borderRadius: '12px',
                  background: config.auto_reload ? 'var(--ok)' : 'var(--line)',
                  position: 'relative',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: config.auto_reload ? '18px' : '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </button>
            </div>
          </div>
        </MacGlass>
      </div>

      <div style={{ marginBottom: '48px' }}>
        <h3
          style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}
        >
          About
        </h3>
        <MacGlass radius={14}>
          <div style={{ padding: '24px', fontSize: '14px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ fontSize: '32px' }}>✨</div>
              <div>
                <div style={{ fontWeight: '700' }}>
                  Skills & Methods Manager
                </div>
                <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
                  Version 0.1.0 (Alpha)
                </div>
              </div>
            </div>
            <p
              style={{
                marginTop: '16px',
                color: 'var(--ink-2)',
                lineHeight: '1.5',
              }}
            >
              A native-feeling macOS package manager for AI skills and SDD
              methods. Built with Tauri, Rust, and React.
            </p>
          </div>
        </MacGlass>
      </div>
    </div>
  )
}

function DiscoverView({ searchQuery, onSelectSkill, installedIds }) {
  const [registrySkills, setRegistrySkills] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      const cats = await fetchCategories()
      setCategories(cats)
    }
    loadCategories()
  }, [])

  useEffect(() => {
    async function loadRegistry() {
      setLoading(true)
      try {
        const result = await fetchRegistrySkills({
          q: searchQuery,
          category: selectedCategory,
        })
        setRegistrySkills(result.skills)
      } catch (error) {
        console.error('Failed to load registry:', error)
      } finally {
        setLoading(false)
      }
    }
    loadRegistry()
  }, [searchQuery, selectedCategory])

  return (
    <div style={{ display: 'flex', minHeight: '100%' }}>
      {/* Category Sidebar */}
      <div
        style={{
          width: '200px',
          borderRight: '1px solid var(--line)',
          padding: '20px',
        }}
      >
        <h3
          style={{
            fontSize: '11px',
            fontWeight: '700',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            marginBottom: '16px',
            letterSpacing: '0.04em',
          }}
        >
          Categories
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderRadius: '8px',
                background:
                  selectedCategory === cat.id
                    ? 'var(--accent-soft)'
                    : 'transparent',
                color:
                  selectedCategory === cat.id
                    ? 'var(--accent)'
                    : 'var(--ink-2)',
                border: 'none',
                fontSize: '13px',
                fontWeight: selectedCategory === cat.id ? '600' : '500',
                cursor: 'pointer',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <div style={{ flex: 1, padding: '32px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Discover</h2>
        <p
          style={{
            color: 'var(--muted)',
            marginBottom: '32px',
            fontSize: '14px',
          }}
        >
          Explore and install new capabilities for your AI agents.
        </p>

        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            <SkillCardSkeleton />
            <SkillCardSkeleton />
            <SkillCardSkeleton />
            <SkillCardSkeleton />
          </div>
        ) : registrySkills.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
            }}
          >
            {registrySkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onClick={async () => {
                  const detail = await fetchSkillDetail(skill.id)
                  onSelectSkill(detail)
                }}
                isInstalled={installedIds.includes(skill.id)}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: '48px' }}>🔍</div>
            <h3
              style={{ fontSize: '18px', fontWeight: '600', marginTop: '16px' }}
            >
              No skills found in registry
            </h3>
            <p style={{ color: 'var(--muted)', marginTop: '8px' }}>
              Try a different search term or category.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const [currentView, setCurrentView] = useState('library')
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({
    type: [],
    status: [],
  })
  const [config, setConfig] = useState({ skills_dir: null, auto_reload: true })
  const [installingSkill, setInstallingSkill] = useState(null)

  useEffect(() => {
    async function init() {
      try {
        const cfg = await invoke('get_config')
        setConfig(cfg)

        const result = await invoke('get_skills')
        const normalizedResult = result.map((s) => ({
          ...s,
          type: s.type || (s.id.includes('method') ? 'method' : 'skill'),
        }))
        setSkills(normalizedResult)
      } catch (error) {
        console.error('Initialization failed:', error)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const handleUpdateConfig = async (newConfig) => {
    try {
      await invoke('update_config', { config: newConfig })
      setConfig(newConfig)

      if (newConfig.skills_dir !== config.skills_dir) {
        setLoading(true)
        const result = await invoke('get_skills')
        setSkills(
          result.map((s) => ({
            ...s,
            type: s.type || (s.id.includes('method') ? 'method' : 'skill'),
          }))
        )
        setLoading(false)
      }
    } catch (error) {
      console.error('Failed to update config:', error)
    }
  }

  const handleInstallComplete = async () => {
    setInstallingSkill(null)
    setSelectedSkill(null)
    // Reload library
    setLoading(true)
    const result = await invoke('get_skills')
    setSkills(
      result.map((s) => ({
        ...s,
        type: s.type || (s.id.includes('method') ? 'method' : 'skill'),
      }))
    )
    setLoading(false)
    setCurrentView('library')
  }

  const toggleFilter = (category, value) => {
    setActiveFilters((prev) => {
      const current = prev[category]
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [category]: next }
    })
  }

  const filteredSkills = useMemo(() => {
    return skills.filter((skill) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query) ||
          skill.author.toLowerCase().includes(query)

        if (!matchesSearch) return false
      }

      if (activeFilters.type.length > 0) {
        if (!activeFilters.type.includes(skill.type)) return false
      }

      if (activeFilters.status.length > 0) {
        if (!activeFilters.status.includes(skill.status)) return false
      }

      return true
    })
  }, [skills, searchQuery, activeFilters])

  const counts = useMemo(() => {
    return {
      skill: skills.filter((s) => s.type === 'skill').length,
      method: skills.filter((s) => s.type === 'method').length,
      active: skills.filter((s) => s.status === 'active').length,
      outdated: skills.filter((s) => s.status === 'outdated').length,
      broken: skills.filter((s) => s.status === 'broken').length,
    }
  }, [skills])

  const installedIds = useMemo(() => skills.map((s) => s.id), [skills])

  const sidebar = (
    <>
      <MacSidebarHeader title="Library" />
      <MacSidebarItem
        label="My Skills"
        selected={currentView === 'library'}
        onClick={() => setCurrentView('library')}
      />
      <MacSidebarItem
        label="Discover"
        selected={currentView === 'discover'}
        onClick={() => setCurrentView('discover')}
      />

      <MacSidebarHeader title="App" />
      <MacSidebarItem
        label="Activity"
        selected={currentView === 'activity'}
        onClick={() => setCurrentView('activity')}
      />
      <MacSidebarItem
        label="Settings"
        selected={currentView === 'settings'}
        onClick={() => setCurrentView('settings')}
      />
    </>
  )

  return (
    <div style={{ position: 'relative' }}>
      <MacWindow
        title={currentView.charAt(0).toUpperCase() + currentView.slice(1)}
        sidebar={sidebar}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      >
        <div
          style={{
            padding:
              currentView === 'settings' || currentView === 'discover'
                ? '0'
                : '20px',
            opacity: selectedSkill || installingSkill ? 0.6 : 1,
            transition: 'opacity 0.2s ease',
            pointerEvents: selectedSkill || installingSkill ? 'none' : 'auto',
            minHeight: '100%',
          }}
        >
          {currentView === 'library' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '20px',
                }}
              >
                <h2 style={{ fontSize: '20px' }}>Installed Skills</h2>
                {skills.length > 0 && (
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    {filteredSkills.length} of {skills.length}
                  </span>
                )}
              </div>

              {!loading && skills.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                  }}
                >
                  <FilterChip
                    label="Skills"
                    active={activeFilters.type.includes('skill')}
                    onClick={() => toggleFilter('type', 'skill')}
                    count={counts.skill}
                  />
                  <FilterChip
                    label="Methods"
                    active={activeFilters.type.includes('method')}
                    onClick={() => toggleFilter('type', 'method')}
                    count={counts.method}
                  />
                  <div
                    style={{
                      width: '1px',
                      background: 'var(--line)',
                      margin: '4px 4px',
                    }}
                  />
                  <FilterChip
                    label="Active"
                    active={activeFilters.status.includes('active')}
                    onClick={() => toggleFilter('status', 'active')}
                    count={counts.active}
                  />
                  <FilterChip
                    label="Outdated"
                    active={activeFilters.status.includes('outdated')}
                    onClick={() => toggleFilter('status', 'outdated')}
                    count={counts.outdated}
                  />
                  {(activeFilters.type.length > 0 ||
                    activeFilters.status.length > 0 ||
                    searchQuery) && (
                    <button
                      onClick={() => {
                        setActiveFilters({ type: [], status: [] })
                        setSearchQuery('')
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: '0 8px',
                      }}
                    >
                      Clear all
                    </button>
                  )}
                </div>
              )}

              {loading ? (
                <div>
                  <SkillCardSkeleton />
                  <SkillCardSkeleton />
                  <SkillCardSkeleton />
                </div>
              ) : filteredSkills.length > 0 ? (
                <div>
                  {filteredSkills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      onClick={(s) => setSelectedSkill(s)}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '64px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ fontSize: '48px' }}>
                    {searchQuery ||
                    activeFilters.type.length ||
                    activeFilters.status.length
                      ? '🔍'
                      : '📭'}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
                    {searchQuery ||
                    activeFilters.type.length ||
                    activeFilters.status.length
                      ? 'No results found'
                      : 'No skills found'}
                  </h3>
                  <p
                    style={{
                      color: 'var(--muted)',
                      maxWidth: '300px',
                      lineHeight: '1.5',
                    }}
                  >
                    {searchQuery ||
                    activeFilters.type.length ||
                    activeFilters.status.length
                      ? "Adjust your search or filters to find what you're looking for."
                      : "You haven't installed any skills yet. Visit the **Discover** tab to browse and install capabilities."}
                  </p>
                  <button
                    onClick={() => {
                      if (
                        searchQuery ||
                        activeFilters.type.length ||
                        activeFilters.status.length
                      ) {
                        setSearchQuery('')
                        setActiveFilters({ type: [], status: [] })
                      } else {
                        setCurrentView('discover')
                      }
                    }}
                    style={{
                      marginTop: '8px',
                      padding: '8px 16px',
                      borderRadius: 'var(--r-md)',
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      border: 'none',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {searchQuery ||
                    activeFilters.type.length ||
                    activeFilters.status.length
                      ? 'Clear Filters'
                      : 'Go to Discover'}
                  </button>
                </div>
              )}
            </div>
          )}
          {currentView === 'discover' && (
            <DiscoverView
              searchQuery={searchQuery}
              onSelectSkill={setSelectedSkill}
              installedIds={installedIds}
            />
          )}
          {currentView === 'activity' && <div>Recent activity...</div>}
          {currentView === 'settings' && (
            <SettingsView config={config} onUpdate={handleUpdateConfig} />
          )}
        </div>
      </MacWindow>

      {selectedSkill && (
        <SkillDetail
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          isRegistry={installedIds.indexOf(selectedSkill.id) === -1}
          isInstalled={installedIds.includes(selectedSkill.id)}
          onInstall={(s) => setInstallingSkill(s)}
        />
      )}

      {installingSkill && (
        <InstallSheet
          skill={installingSkill}
          onClose={() => setInstallingSkill(null)}
          onComplete={handleInstallComplete}
        />
      )}
    </div>
  )
}

export default App
