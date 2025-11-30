# 🚀 Publishing Guide

This guide will help you publish `discord-conversation-wizard` to NPM and GitHub.

## Prerequisites

1. **NPM Account**: Create one at [npmjs.com](https://www.npmjs.com/signup)
2. **GitHub Account**: Ensure you have a GitHub account
3. **NPM Authentication**: Log in to NPM locally
   ```bash
   npm login
   ```

## Step 1: Push to GitHub

```bash
# Push changes
git push origin main
```

## Step 2: Publish to NPM

### First-time Publishing

```bash
# Ensure you're logged in
npm whoami

# Run tests and build
npm test
npm run build

# Publish to NPM
npm publish
```

### Version Updates

Follow semantic versioning (semver):

**Patch Release (1.0.x)** - Bug fixes:
```bash
npm version patch
npm publish
git push --tags
```

**Minor Release (1.x.0)** - New features (backward compatible):
```bash
npm version minor
npm publish
git push --tags
```

**Major Release (x.0.0)** - Breaking changes:
```bash
npm version major
npm publish
git push --tags
```

## Step 3: Create GitHub Release

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Choose a tag (e.g., `v1.0.0`)
4. Release title: `v1.0.0 - Release Name`
5. Description: Copy from CHANGELOG.md
6. Publish release

This will automatically trigger the GitHub Actions workflow to publish to NPM (if configured).

## Step 4: Add NPM Token to GitHub (Optional)

For automated publishing via GitHub Actions:

1. Generate NPM token:
   ```bash
   npm token create
   ```
2. Go to GitHub repository → Settings → Secrets and variables → Actions
3. Add secret: `NPM_TOKEN` with the generated token

Now releases will automatically publish to NPM!
