# Skill Manifest Specification

Every skill or method must include a `skill.toml` file in its root directory to be recognized by the manager.

## `skill.toml` Structure

```toml
[skill]
id = "unique-skill-id"
name = "Human Readable Name"
description = "A short one-line summary of what the skill does."
version = "1.2.3"
author = "Your Name or Team"
dependencies = ["optional-dep-1", "optional-dep-2"]

# Optional: type defaults to "skill" if not specified.
# Can be "skill" or "method".
type = "skill"
```

## Icons
You can include an `icon.png` (64x64 or 128x128 recommended) in the same directory. The manager will automatically display it in the library.

## Documentation
An optional `README.md` can be included for detailed documentation, which will be accessible via the "View Docs" action in the manager.
