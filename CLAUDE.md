# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Chart Agent MVP** - An AI-powered chart generation agent for FD Mediagroep that creates bar and line charts in FD or BNR brand colors. Built with Next.js 14, OpenAI GPT-5, and Vercel AI SDK v5.

**Runtime:** Node.js 20.18.1 (LTS) - use `nvm use` to switch to the correct version (specified in `.nvmrc`)

**Primary interfaces:**
- CLI interface (for terminal-based chart generation)
- Web interface (Next.js app with chat UI)

**Key constraint:** This agent is deliberately restricted to ONLY create bar and line charts in FD or BNR colors. It will refuse all other requests.

## Common Commands

```bash
# Development
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run cli          # Run CLI interface for chart generation
npm run build        # Build for production
npm start            # Start production server

# Testing & Quality
npm run eval         # Run evaluation suite (filtering + accuracy tests)
npm run lint         # Run ESLint

# Setup
nvm use              # Switch to Node.js 20.18.1
npm install          # Install dependencies
```

## Environment Setup

Create `.env.local` (copy from `.env.local.example`):
```
OPENAI_API_KEY=sk-your-api-key-here
```

## Architecture

### Agent System (Vercel AI SDK v5)

The core agent flow is in `src/features/agent/`:

1. **agent-core.ts** - Main orchestration using `generateText()` from AI SDK
   - Uses OpenAI GPT-5 model (`gpt-5`)
   - Processes user messages with conversation history
   - Executes tools via `maxSteps: 5`
   - Returns `AgentResponse` with message, chartPath, and success status

2. **tools.ts** - AI SDK tool definitions
   - `create_bar_chart` - Bar chart generation tool
   - `create_line_chart` - Line chart generation tool
   - Both tools use `jsonSchema<>()` with strict Zod-style schemas
   - Tools receive `ChartEngine` instance and execute chart creation
   - Important: All parameters use `additionalProperties: false` for strict validation

3. **prompts.ts** - System prompts with XML-structured constraints
   - Defines role, capabilities, restrictions, and behavior
   - Uses XML tags (`<role>`, `<capabilities>`, `<restrictions>`) for clear boundaries
   - Enforces Dutch language responses and professional tone
   - Instructs agent to remember color preferences across conversation
   - User messages can include `<excel_data>` when Excel files are uploaded

### Chart Generation (D3.js)

`src/features/charts/chart-engine.ts` - Server-side SVG generation using d3-node:
- `ChartEngine` class with `createBarChart()` and `createLineChart()` methods
- Generates 800x600 SVGs with brand colors (from `colors.ts`)
- Saves to `./public/charts/` with timestamped filenames
- Returns both SVG string and file path

Brand colors in `src/features/charts/colors.ts`:
- **FD:** Primary `#379596`, Content `#191919`, Background `#ffeadb`
- **BNR:** Primary `#ffd200`, Content `#000`, Background `#fff`

### Data Parsing

`src/features/parsers/excel-parser.ts` - Excel file processing using `xlsx` library
- Parses .xlsx/.xls files
- Extracts first two columns (labels, values)
- Formats data for agent consumption

### API Routes

- `/api/chat` - Chat endpoint that processes messages via `processAgentRequest()`
- `/api/upload` - File upload endpoint for Excel files

### Web UI Components

Located in `src/features/ui/`:
- `ChatInterface.tsx` - Main chat UI
- `ChartDisplay.tsx` - SVG chart rendering
- `FileUpload.tsx` - Excel file upload component

### Type System

`src/lib/types.ts` defines core types:
- `ChartData` - Chart configuration (labels, values, title, unit, chartType)
- `ColorScheme` - 'fd' | 'bnr'
- `AgentResponse` - Agent output structure
- `ConversationMessage` - Chat message format

### Evaluation System

`src/evals/` contains automated tests:
- `eval-filtering.ts` - Tests agent request filtering (accepts chart requests, rejects others)
- `eval-accuracy.ts` - Tests data accuracy in generated charts
- `runner.ts` - Orchestrates evaluation execution
- Results saved to `./eval-results/`

## Key Architectural Patterns

1. **Strict Tool Schema Validation** - All AI SDK tools use `additionalProperties: false` to prevent hallucination of extra parameters

2. **XML-Structured Prompts** - System prompts use XML tags to create clear boundaries for agent behavior

3. **Stateless Chart Engine** - `ChartEngine` is instantiated per request with no shared state

4. **Conversation Memory** - Agent remembers color preferences within a conversation via message history

5. **Server-Side Rendering** - All charts generated server-side with d3-node (not client-side D3)

6. **Dual Interface** - Same agent logic serves both CLI (via `src/cli/index.ts`) and web interface

## Path Aliases

TypeScript path mapping: `@/*` → `./src/*`

## Important Notes

- Agent deliberately refuses non-chart requests (this is intentional, not a bug)
- Charts are saved to `./public/charts/` - ensure this directory exists and is writable
- CLI interface uses d3-node for headless chart generation
- All agent responses are in Dutch
- Excel files must have ≥2 columns and be <10MB
