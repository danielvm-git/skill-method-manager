import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'
import { invoke } from '@tauri-apps/api/core'

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

// Mock API
vi.mock('../api/registry', () => ({
  fetchRegistrySkills: vi.fn(() =>
    Promise.resolve({
      skills: [
        {
          id: 'reg-skill-1',
          name: 'Registry Skill',
          description: 'From remote registry',
          version: '1.0.0',
          author: 'Remote Author',
          category: 'data',
          type: 'skill',
        },
      ],
      total: 1,
    })
  ),
  fetchCategories: vi.fn(() =>
    Promise.resolve([{ id: 'all', label: 'All Categories' }])
  ),
  fetchSkillDetail: vi.fn((id) =>
    Promise.resolve({
      id,
      name: 'Registry Skill',
      description: 'Detailed description',
      version: '1.0.0',
      author: 'Remote Author',
      type: 'skill',
    })
  ),
}))

const MOCK_SKILLS = [
  {
    id: 'skill-1',
    name: 'Local Skill',
    description: 'Installed locally',
    version: '1.0.2',
    author: 'Daniel VM',
    status: 'active',
    type: 'skill',
  },
]

describe('App', () => {
  it('renders sidebar navigation', () => {
    vi.mocked(invoke).mockResolvedValue([])
    render(<App />)
    expect(
      screen.getByRole('button', { name: /My Skills/i })
    ).toBeInTheDocument()
  })

  it('switches to discover view and displays registry skills', async () => {
    vi.mocked(invoke).mockResolvedValue(MOCK_SKILLS)
    render(<App />)

    const discoverNav = screen.getByRole('button', { name: /Discover/i })
    fireEvent.click(discoverNav)

    await waitFor(() => {
      expect(
        screen.getByText(/Explore and install new capabilities/i)
      ).toBeInTheDocument()
      expect(screen.getByText(/Registry Skill/i)).toBeInTheDocument()
    })
  })

  it('filters library skills by search query', async () => {
    vi.mocked(invoke).mockResolvedValue(MOCK_SKILLS)
    render(<App />)

    await screen.findByText(/Local Skill/i)

    const searchInput = screen.getByPlaceholderText(/Search/i)
    fireEvent.change(searchInput, { target: { value: 'Local' } })

    expect(screen.getByText(/Local Skill/i)).toBeInTheDocument()
  })
})
