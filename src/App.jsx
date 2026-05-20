import { useState, useEffect, useMemo } from 'react'
import { invoke } from '@tauri-apps/api/core'
import {
  MacWindow,
  MacSidebarItem,
  MacSidebarHeader,
  MacGlass,
} from './components/macos-window'

function StatusBadge({ status }) {
  const colors = {
    active: 'var(--ok)',
    inactive: 'var(--muted)',
    outdated: 'var(--warn)',
    broken: 'var(--danger)',
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

function SkillCard({ skill, onClick }) {
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
            <StatusBadge status={skill.status} />
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

function SkillDetail({ skill, onClose }) {
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
          Skill Details
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
            <StatusBadge status={skill.status} />
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
        </div>
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

  useEffect(() => {
    async function loadSkills() {
      setLoading(true)
      try {
        const result = await invoke('get_skills')
        // Ensure type field exists for older mock data/manifests
        const normalizedResult = result.map((s) => ({
          ...s,
          type: s.type || (s.id.includes('method') ? 'method' : 'skill'),
        }))
        setSkills(normalizedResult)
      } catch (error) {
        console.error('Failed to load skills:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSkills()
  }, [])

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
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query) ||
          skill.author.toLowerCase().includes(query)

        if (!matchesSearch) return false
      }

      // Type filter (OR within group)
      if (activeFilters.type.length > 0) {
        if (!activeFilters.type.includes(skill.type)) return false
      }

      // Status filter (OR within group)
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
            padding: '20px',
            opacity: selectedSkill ? 0.6 : 1,
            transition: 'opacity 0.2s ease',
            pointerEvents: selectedSkill ? 'none' : 'auto',
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

              {/* Filter Row */}
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
          {currentView === 'discover' && <div>Discover new skills...</div>}
          {currentView === 'activity' && <div>Recent activity...</div>}
          {currentView === 'settings' && <div>Application settings...</div>}
        </div>
      </MacWindow>

      {selectedSkill && (
        <SkillDetail
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </div>
  )
}

export default App
