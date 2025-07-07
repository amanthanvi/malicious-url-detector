# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern URL threat analyzer web application built with Next.js 14, TypeScript, and Tailwind CSS that analyzes URLs for potential security threats using VirusTotal and Hugging Face APIs.

## Common Development Commands

### Setup and Running
```bash
# Install dependencies
npm install

# Set up environment variables (create .env.local file)
echo "VIRUSTOTAL_API_KEY=your_key_here" > .env.local
echo "HUGGINGFACE_API_KEY=your_key_here" >> .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm run start

# Run linting
npm run lint
```

### Development Notes
- The application runs on `http://localhost:3000` by default
- Uses Next.js App Router with TypeScript
- Vercel-optimized for deployment
- Flask backup files are stored in `/flask-backup/` directory

## Architecture and Code Structure

### Application Pattern
- **Next.js 14 App Router Architecture**:
  - API Routes: `/app/api/analyze/route.ts` for backend logic
  - Components: Modular React components in `/app/components/`
  - Utilities: Helper functions in `/app/utils/` and `/app/lib/`
  - Types: TypeScript interfaces in `/app/types/`
  - Hooks: Custom React hooks in `/app/hooks/`

### Key Implementation Details

1. **URL Analysis Flow**:
   - Client-side validation → API route call → Parallel API requests → Caching → Response
   - LRU cache with 15-minute TTL for reducing API calls
   - Comprehensive error handling with user-friendly messages

2. **API Integration** (`/app/api/analyze/route.ts`):
   - **VirusTotal**: Asynchronous analysis with polling (up to 10 retries, 15s intervals)
   - **Hugging Face**: Synchronous inference call to `elftsdmr/malware-url-detect` model
   - Both APIs handle timeouts and errors gracefully

3. **Result Classification Logic**:
   - Threat analyzer in `/app/lib/threatAnalyzer.ts`
   - Risk levels: low, medium, high, critical
   - Detailed threat categories and recommendations

4. **State Management**:
   - Local storage for URL history
   - React state for UI interactions
   - Server-side caching for API results

### Important Code Patterns

- **URL Validation**: Utility functions in `/app/utils/url.ts`
- **Caching**: LRU cache implementation in `/app/lib/cache.ts`
- **Theme Support**: Dark/light mode with system preference detection
- **Animations**: Framer Motion for smooth UI transitions
- **Type Safety**: Full TypeScript coverage with strict mode

## Features

- **Single URL Analysis**: Real-time threat detection
- **Batch Analysis**: Process up to 10 URLs simultaneously
- **URL History**: Local storage of previous analyses
- **Educational Content**: Interactive learning about online threats
- **Export Functionality**: CSV export for batch results
- **Dark Mode**: Full theme support with persistence

## Environment Configuration

Required environment variables in `.env.local`:
```
VIRUSTOTAL_API_KEY=your_virustotal_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

## Deployment

- **Platform**: Optimized for Vercel deployment
- **Build Output**: Static and server-rendered pages
- **API Routes**: Serverless functions on Vercel
- **Environment**: Set API keys in Vercel dashboard

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Hero Icons
- **Animations**: Framer Motion
- **API Client**: Native fetch
- **Caching**: LRU Cache
- **Theme**: next-themes
- **Analytics**: Vercel Analytics