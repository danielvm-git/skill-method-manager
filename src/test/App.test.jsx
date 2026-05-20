import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '../App'

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

  it('switches views when sidebar items are clicked', () => {
    render(<App />)

    const discoverItem = screen.getByRole('button', { name: /Discover/i })
    fireEvent.click(discoverItem)

    expect(screen.getByText(/Discover new skills.../i)).toBeInTheDocument()

    const settingsItem = screen.getByRole('button', { name: /Settings/i })
    fireEvent.click(settingsItem)

    expect(screen.getByText(/Application settings.../i)).toBeInTheDocument()
  })
})
