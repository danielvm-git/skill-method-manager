# Registry API Specification

The Skills & Methods Manager communicates with a remote registry to fetch available skills and methods.

## Endpoints

### `GET /skills`
Returns a paginated list of skills available in the registry.

**Query Parameters:**
- `q`: Search query string.
- `category`: Category ID to filter by.
- `page`: Page number (default: 1).

**Response:**
```json
{
  "skills": [
    {
      "id": "skill-id",
      "name": "Skill Name",
      "description": "Short description",
      "version": "1.0.0",
      "author": "Author Name",
      "category": "category-id",
      "type": "skill"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 5
}
```

### `GET /skills/:id`
Returns detailed metadata for a specific skill.

**Response:**
```json
{
  "id": "skill-id",
  "name": "Skill Name",
  "description": "Short description",
  "longDescription": "Full markdown-enabled description...",
  "version": "1.0.0",
  "author": "Author Name",
  "type": "skill",
  "dependencies": ["dep-1", "dep-2"],
  "changelog": [
    { "version": "1.0.0", "date": "2026-05-19", "notes": "Initial release" }
  ]
}
```

### `GET /categories`
Returns a list of available categories.

**Response:**
```json
[
  { "id": "all", "label": "All Categories" },
  { "id": "data", "label": "Data Science" }
]
```
