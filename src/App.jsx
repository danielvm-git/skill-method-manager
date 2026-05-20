import { useState } from 'react'
import {
  MacWindow,
  MacSidebarItem,
  MacSidebarHeader,
} from './components/macos-window'

function App() {
  const [currentView, setCurrentView] = useState('library')

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
    <MacWindow
      title={currentView.charAt(0).toUpperCase() + currentView.slice(1)}
      sidebar={sidebar}
    >
      <div style={{ padding: '20px' }}>
        {currentView === 'library' && (
          <div>
            <h2 style={{ marginBottom: '16px' }}>Installed Skills</h2>
            <p style={{ color: 'var(--muted)' }}>
              No skills found. Visit Discover to install some.
            </p>
          </div>
        )}
        {currentView === 'discover' && <div>Discover new skills...</div>}
        {currentView === 'activity' && <div>Recent activity...</div>}
        {currentView === 'settings' && <div>Application settings...</div>}
      </div>
    </MacWindow>
  )
}

export default App
