/**
 * Registry API Client
 *
 * Implements the contract defined in Story 7.1.
 * Currently using mock data until a real registry endpoint is available.
 */

const MOCK_REGISTRY_SKILLS = [
  {
    id: 'reg-skill-1',
    name: 'Python Data Analyst',
    description:
      'Expert Python assistant for data cleaning, visualization, and statistical analysis.',
    version: '1.2.0',
    author: 'DataSci Team',
    category: 'data',
    type: 'skill',
  },
  {
    id: 'reg-skill-2',
    name: 'React Component Generator',
    description:
      'Generates polished, accessible React components from natural language descriptions.',
    version: '0.9.5',
    author: 'UI Wizards',
    category: 'development',
    type: 'skill',
  },
  {
    id: 'reg-method-1',
    name: 'PR Review Protocol',
    description:
      'A structured method for conducting thorough and constructive pull request reviews.',
    version: '2.0.1',
    author: 'Engineering Ops',
    category: 'process',
    type: 'method',
  },
  {
    id: 'reg-skill-3',
    name: 'SQL Optimizer',
    description:
      'Analyzes SQL queries and suggests optimizations for performance and readability.',
    version: '1.1.0',
    author: 'DB Pros',
    category: 'data',
    type: 'skill',
  },
]

export async function fetchRegistrySkills({ q, category, page = 1 } = {}) {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800))

  let results = [...MOCK_REGISTRY_SKILLS]

  if (q) {
    const query = q.toLowerCase()
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
    )
  }

  if (category && category !== 'all') {
    results = results.filter((s) => s.category === category)
  }

  return {
    skills: results,
    total: results.length,
    page,
    pages: 1,
  }
}

export async function fetchSkillDetail(id) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const skill = MOCK_REGISTRY_SKILLS.find((s) => s.id === id)

  if (!skill) throw new Error('Skill not found in registry')

  return {
    ...skill,
    longDescription: `${skill.description} This skill is designed to work seamlessly with the bigpowers methodology. It includes pre-configured prompts, validation rules, and best practices derived from years of industry experience.`,
    changelog: [
      {
        version: '1.2.0',
        date: '2026-05-10',
        notes: 'Improved performance and added support for new data formats.',
      },
      {
        version: '1.1.0',
        date: '2026-04-15',
        notes: 'Initial release with core functionality.',
      },
    ],
    dependencies: ['skill-base-lib', 'utils-v2'],
  }
}

export async function fetchCategories() {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return [
    { id: 'all', label: 'All Categories' },
    { id: 'data', label: 'Data Science' },
    { id: 'development', label: 'Development' },
    { id: 'process', label: 'Process & Workflow' },
  ]
}
