# Public Static Files

This directory contains static files that are served directly by Next.js.

## Directory Structure

```
public/
├── favicon/           # Favicon files
│   └── favicon.svg    # Main favicon
├── icons/             # Application icons
│   └── app-icon.svg   # Main app icon
├── images/            # Image assets
│   └── team-placeholder.svg  # Placeholder for team members
├── default-avatar.svg # Default user avatar
└── README.md         # This file
```

## Usage

- **Favicon**: Automatically used by browsers for the site icon
- **Icons**: Used for app icons, PWA manifests, etc.
- **Images**: Static images used throughout the application
- **Avatars**: Default user avatars when Discord avatars are not available

## File Types

- **SVG**: Scalable vector graphics for icons and simple images
- **PNG/JPG**: For more complex images (when needed)
- **ICO**: For favicon compatibility (when needed)

## Adding New Files

1. Place new static files in the appropriate subdirectory
2. Reference them in your code using absolute paths from the public root
3. Example: `/images/new-image.svg` or `/icons/new-icon.svg`

## Next.js Integration

Next.js automatically serves files from the `public` directory at the root URL path. For example:
- `public/favicon/favicon.svg` → accessible at `/favicon/favicon.svg`
- `public/images/team-placeholder.svg` → accessible at `/images/team-placeholder.svg` 