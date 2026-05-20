import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn((command) => {
    if (command === 'get_skills') {
      return Promise.resolve([
        {
          id: 'skill-1',
          name: 'Text Summarizer',
          description: 'Summarizes long text into concise bullet points.',
          version: '1.0.2',
          author: 'Daniel VM',
          status: 'active',
        },
      ])
    }
    return Promise.resolve([])
  }),
}))

describe('App', () => {
  it('renders sidebar navigation', () => {
    render(<App />)
    expect(
      screen.getByRole('button', { name: /My Skills/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Discover/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Settings/i })
    ).toBeInTheDocument()
  })

  it('fetches and displays skills on mount', async () => {
    render(<App />)

    // Wait for skills to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Text Summarizer/i)).toBeInTheDocument()
    })
  })

  it('opens skill detail panel when a skill card is clicked', async () => {
    render(<App />)

    // Wait for skill to load
    const skillCard = await screen.findByText(/Text Summarizer/i)
    fireEvent.click(skillCard)

    // Check if detail panel is open
    expect(screen.getByText(/Skill Details/i)).toBeInTheDocument()

    // Check for description in detail panel (should find at least one)
    const descriptions = screen.getAllByText(/Summarizes long text/i)
    expect(descriptions.length).toBeGreaterThan(0)

    // Close the panel
    const closeButton = screen.getByText('✕')
    fireEvent.click(closeButton)

    // Check if panel is closed
    expect(screen.queryByText(/Skill Details/i)).not.toBeInTheDocument()
  })

  it('switches views when sidebar items are clicked', async () => {
    render(<App />)

    const discoverItem = screen.getByRole('button', { name: /Discover/i })
    fireEvent.click(discoverItem)

    expect(screen.getByText(/Discover new skills.../i)).toBeInTheDocument()
  })
})
