import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'
import { invoke } from '@tauri-apps/api/core'

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

const MOCK_SKILLS = [
  {
    id: 'skill-1',
    name: 'Text Summarizer',
    description: 'Summarizes long text into concise bullet points.',
    version: '1.0.2',
    author: 'Daniel VM',
    status: 'active',
    type: 'skill',
  },
  {
    id: 'method-1',
    name: 'TDD Workflow',
    description: 'A step-by-step method for test-driven development.',
    version: '2.1.0',
    author: 'AI Labs',
    status: 'outdated',
    type: 'method',
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

  it('filters skills by search query', async () => {
    vi.mocked(invoke).mockResolvedValue(MOCK_SKILLS)
    render(<App />)

    await screen.findByText(/Text Summarizer/i)
    expect(screen.getByText(/TDD Workflow/i)).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText(/Search/i)
    fireEvent.change(searchInput, { target: { value: 'Summarizer' } })

    expect(screen.getByText(/Text Summarizer/i)).toBeInTheDocument()
    expect(screen.queryByText(/TDD Workflow/i)).not.toBeInTheDocument()
  })

  it('filters skills by type chips', async () => {
    vi.mocked(invoke).mockResolvedValue(MOCK_SKILLS)
    render(<App />)

    await screen.findByText(/Text Summarizer/i)

    const methodsChip = screen.getByRole('button', { name: /Methods/i })
    fireEvent.click(methodsChip)

    expect(screen.getByText(/TDD Workflow/i)).toBeInTheDocument()
    expect(screen.queryByText(/Text Summarizer/i)).not.toBeInTheDocument()

    // Clear filter
    fireEvent.click(methodsChip)
    expect(screen.getByText(/Text Summarizer/i)).toBeInTheDocument()
  })

  it('shows no results found state', async () => {
    vi.mocked(invoke).mockResolvedValue(MOCK_SKILLS)
    render(<App />)

    await screen.findByText(/Text Summarizer/i)

    const searchInput = screen.getByPlaceholderText(/Search/i)
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    expect(screen.getByText(/No results found/i)).toBeInTheDocument()
    expect(screen.getByText(/Clear Filters/i)).toBeInTheDocument()
  })
})
