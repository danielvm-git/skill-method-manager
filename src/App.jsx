import { useState, useEffect } from 'react'
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
            📦
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
            📦
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

  useEffect(() => {
    async function loadSkills() {
      try {
        const result = await invoke('get_skills')
        setSkills(result)
      } catch (error) {
        console.error('Failed to load skills:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSkills()
  }, [])

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
              <h2 style={{ marginBottom: '20px', fontSize: '20px' }}>
                Installed Skills
              </h2>
              {loading ? (
                <p>Loading skills...</p>
              ) : skills.length > 0 ? (
                <div>
                  {skills.map((skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      onClick={(s) => setSelectedSkill(s)}
                    />
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--muted)' }}>
                  No skills found. Visit Discover to install some.
                </p>
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
