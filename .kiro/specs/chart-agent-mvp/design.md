# Design Document - Chart Agent MVP

## Overview

The Chart Agent MVP is a focused AI agent that generates bar and line charts in FD or BNR brand colors. The system provides both CLI and web interfaces, processes text or Excel input, maintains session memory with persistence, and includes evaluation capabilities.

### Technology Stack

- **Runtime:** Node.js 20.18.1 (LTS)
- **Language:** TypeScript
- **Web Framework:** Next.js 14 (App Router)
- **LLM:** OpenAI GPT-5
- **Agent Framework:** Vercel AI SDK v5 for agent orchestration, LLM integration, and memory management
- **Charting (Web):** D3.js for client-side interactive chart rendering
- **Charting (CLI):** d3-node for server-side SVG generation in CLI
- **Excel Processing:** xlsx or exceljs
- **CLI:** Interactive REPL with d3-node rendering, started via npm script
- **Storage:** JSON files for memory persistence

### Key Design Principles

1. **Single Responsibility:** Agent only handles chart generation tasks
2. **Minimal Complexity:** Simple architecture suitable for 4-hour development
3. **Clear Boundaries:** Explicit task filtering to refuse non-chart requests
4. **Stateful Sessions:** Memory persists user preferences across sessions
5. **Dutch Language:** All user interactions in Dutch (Nederlands)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interfaces                       │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │   CLI Interface  │         │  Web Interface   │     │
│  │  (REPL + d3-node)│         │ (Next.js 14 App) │     │
│  └────────┬─────────┘         └────────┬─────────┘     │
└───────────┼──────────────────────────────┼──────────────┘
            │                              │
            └──────────────┬───────────────┘
                           │
            ┌──────────────▼──────────────┐
            │      Agent Controller        │
            │   (AI SDK Agent + Tools)     │
            │         (GPT-5)              │
            └──────────────┬──────────────┘
                           │
        ┏━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━┓
        ┃                                     ┃
┌───────▼────────┐  ┌──────────────┐  ┌─────▼──────┐
│  Input Parser  │  │ Memory Store │  │Chart Engine│
│  (Text/Excel)  │  │ (AI SDK +    │  │ (D3.js/    │
│  (xlsx lib)    │  │  JSON File)  │  │  d3-node)  │
└────────────────┘  └──────────────┘  └────────────┘
```

### Component Interaction Flow

```
User Input → Interface → Agent Controller → Tool Selection → Output
                              ↓                    ↑
                         Memory Store ←───────────┘
```

## Components and Interfaces

### 1. Agent Controller

**Responsibility:** Core agent logic using Vercel AI SDK to process requests and route to appropriate tools.

**Key Modules:**
```typescript
// src/features/agent/agent-core.ts
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { getAgentTools } from './tools';
import { getSystemPrompt } from './prompts';

export async function processAgentRequest(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  chartEngine: ChartEngine,
  excelData?: string
): Promise<AgentResponse> {
  const formattedMessage = getUserMessageTemplate(userMessage, excelData);
  
  const result = await generateText({
    model: anthropic('claude-sonnet-4.5'),
    messages: [
      { role: 'system', content: getSystemPrompt() },
      ...conversationHistory,
      { role: 'user', content: formattedMessage }
    ],
    tools: getAgentTools(chartEngine),
    maxSteps: 5
  });
  
  return formatAgentResponse(result);
}
```

**Tools Available to Agent (AI SDK format):**
1. `create_bar_chart` - Creates bar charts from data
2. `create_line_chart` - Creates line charts from data
3. `parse_text_data` - Extracts data from text input (LLM does this naturally)
4. `read_excel_file` - Reads data from Excel files

**Tool Definitions:**
```typescript
// src/features/agent/tools.ts
import { tool } from 'ai';
import { z } from 'zod';

export function getAgentTools(chartEngine: ChartEngine) {
  return {
    create_bar_chart: tool({
      description: 'Create a bar chart with the provided data in FD or BNR brand colors',
      parameters: z.object({
        labels: z.array(z.string()).describe('X-axis labels'),
        values: z.array(z.number()).describe('Y-axis values'),
        title: z.string().describe('Chart title'),
        unit: z.string().optional().describe('Unit of measurement'),
        colorScheme: z.enum(['fd', 'bnr']).describe('Brand color scheme')
      }),
      execute: async ({ labels, values, title, unit, colorScheme }) => {
        const result = await chartEngine.createBarChart(
          { labels, values, title, unit, chartType: 'bar' },
          colorScheme
        );
        return { success: true, filePath: result.filePath };
      }
    }),
    
    create_line_chart: tool({
      description: 'Create a line chart with the provided data in FD or BNR brand colors',
      parameters: z.object({
        labels: z.array(z.string()).describe('X-axis labels'),
        values: z.array(z.number()).describe('Y-axis values'),
        title: z.string().describe('Chart title'),
        unit: z.string().optional().describe('Unit of measurement'),
        colorScheme: z.enum(['fd', 'bnr']).describe('Brand color scheme')
      }),
      execute: async ({ labels, values, title, unit, colorScheme }) => {
        const result = await chartEngine.createLineChart(
          { labels, values, title, unit, chartType: 'line' },
          colorScheme
        );
        return { success: true, filePath: result.filePath };
      }
    })
  };
}
```

**System Prompt with XML Tags:**
```typescript
// src/features/agent/prompts.ts
export function getSystemPrompt(): string {
  return `You are a specialized chart generation agent for FD Mediagroep.

<role>
You are a chart generation assistant that creates bar and line charts in FD or BNR brand colors.
FD Mediagroep is a Dutch media company that values clear data visualization.
</role>

<capabilities>
Your ONLY capabilities are:
- Creating bar charts
- Creating line charts
- Using FD brand colors (primary: #379596, content: #191919, background: #ffeadb)
- Using BNR brand colors (primary: #ffd200, content: #000, background: #fff)
</capabilities>

<restrictions>
You MUST refuse:
- Any request not related to creating bar or line charts
- Requests for other chart types (pie, scatter, bubble, etc.)
- General questions unrelated to chart generation
- Any task outside of chart creation

When refusing, be polite and briefly explain what you CAN do.
</restrictions>

<brand_colors>
FD Colors:
- Primary: #379596
- Content: #191919
- Background: #ffeadb

BNR Colors:
- Primary: #ffd200
- Content: #000
- Background: #fff
</brand_colors>

<instructions>
1. Extract labels and values from user input
2. Determine appropriate chart type (bar or line)
3. Remember user's color preference (FD or BNR) across the conversation
4. If no color preference specified, ask the user or default to FD
5. Create a descriptive title for the chart
6. Include units of measurement if provided
7. Always confirm chart creation with the file path
</instructions>

<behavior>
- Be concise and professional
- Focus only on chart generation tasks
- Remember preferences within the conversation
- Politely decline off-topic requests
- ALWAYS respond in Dutch (Nederlands)
- Use professional Dutch business language
</behavior>`;
}

export function getUserMessageTemplate(userInput: string, excelData?: string): string {
  if (excelData) {
    return `<user_request>${userInput}</user_request>

<excel_data>
${excelData}
</excel_data>`;
  }
  
  return `<user_request>${userInput}</user_request>`;
}
```

### 2. Input Parser

**Responsibility:** Extract structured data from text or Excel input.

**Key Modules:**
```typescript
// src/parsers/input-parser.ts
import * as XLSX from 'xlsx';

export class InputParser {
  async parseTextInput(text: string): Promise<ChartData> {
    // LLM extracts structured data from natural language
    // This is handled by the agent's tool calling
    // Returns: { labels, values, title, unit }
  }
  
  async parseExcelFile(filePath: string): Promise<ChartData> {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Extract labels and values from first two columns
    // Return structured ChartData
  }
}
```

**Text Parsing Strategy:**
- Use GPT-5 (via AI SDK) to extract structured data from natural language
- Identify labels (x-axis), values (y-axis), title, and units
- Handle various formats (inline, bullet points, etc.)
- Agent uses tool calling to structure the data

**Excel Parsing Strategy:**
- Use `xlsx` library to read Excel files
- Read first sheet by default
- Assume first column = labels, second column = values
- Use first row as headers if present
- Support .xlsx and .xls formats

### 3. Chart Engine

**Responsibility:** Generate charts using D3.js (web) and d3-node (CLI) with brand colors.

**Key Modules:**
```typescript
// src/features/charts/chart-engine.ts
import { D3Node } from 'd3-node';
import * as d3 from 'd3';
import fs from 'fs/promises';
import path from 'path';

export class ChartEngine {
  private outputDir: string;
  
  constructor(outputDir: string = './public/charts') {
    this.outputDir = outputDir;
  }
  
  async createBarChart(
    data: ChartData, 
    colorScheme: 'fd' | 'bnr'
  ): Promise<{ svgString: string; filePath: string }> {
    const d3n = new D3Node();
    const svg = d3n.createSVG(800, 600);
    
    // Create bar chart using D3
    const colors = BRAND_COLORS[colorScheme];
    // ... D3 bar chart logic
    
    const svgString = d3n.svgString();
    const filePath = await this.saveChart(svgString, 'bar');
    
    return { svgString, filePath };
  }
  
  async createLineChart(
    data: ChartData,
    colorScheme: 'fd' | 'bnr'
  ): Promise<{ svgString: string; filePath: string }> {
    const d3n = new D3Node();
    const svg = d3n.createSVG(800, 600);
    
    // Create line chart using D3
    const colors = BRAND_COLORS[colorScheme];
    // ... D3 line chart logic
    
    const svgString = d3n.svgString();
    const filePath = await this.saveChart(svgString, 'line');
    
    return { svgString, filePath };
  }
  
  private async saveChart(svgString: string, type: string): Promise<string> {
    const filename = `${type}-${Date.now()}.svg`;
    const filePath = path.join(this.outputDir, filename);
    await fs.writeFile(filePath, svgString);
    return filePath;
  }
}

// src/features/charts/colors.ts
export const BRAND_COLORS = {
  fd: {
    primary: '#379596',
    content: '#191919',
    background: '#ffeadb'
  },
  bnr: {
    primary: '#ffd200',
    content: '#000',
    background: '#fff'
  }
} as const;
```

**Chart Styling:**
- Background color from brand palette
- Bar/line color using primary brand color
- Text (labels, title, ticks) using content color
- Clean, professional appearance
- Automatic sizing based on data
- SVG output for scalability

**CLI Chart Display:**
```typescript
// src/cli/chart-display.ts
export function displayChartInTerminal(svgString: string): void {
  // Display SVG in terminal using d3-node output
  console.log('\n--- Chart Preview ---');
  console.log(svgString);
  console.log('--- End Chart ---\n');
  
  // Alternative: Use terminal-kit or blessed to render visual representation
}
```

**Web vs CLI Rendering:**
- **Web:** Server generates chart data via API, client renders with D3.js
- **CLI:** d3-node renders SVG server-side, both displays in terminal AND saves to file
- **Shared Logic:** Both use same ChartEngine class (DRY principle)

### 4. Memory Management

**Responsibility:** Manage conversation context and user preferences using AI SDK's built-in memory.

**AI SDK Memory Integration:**
```typescript
// src/features/agent/agent-core.ts
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function processAgentRequest(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>
) {
  const result = await generateText({
    model: anthropic('claude-sonnet-4.5'),
    messages: [
      { role: 'system', content: getSystemPrompt() },
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ],
    tools: getAgentTools(),
    maxSteps: 5
  });
  
  return result;
}
```

**Memory Strategy:**
- **Session Memory:** AI SDK manages conversation history automatically
- **User Preferences:** Stored in AI SDK's message context (color preference, chart type preference)
- **No External Persistence:** AI SDK handles memory management out of the box
- **Context Window:** Maintain last N messages for context

**Note:** The system prompt is defined in section 1 (Agent Controller) with proper XML tags for security.

### 5. CLI Interface

**Responsibility:** Provide command-line interaction with d3-node chart rendering.

**Implementation:**
```typescript
// src/cli/index.ts
import readline from 'readline';
import { ChartAgent } from '../agent/chart-agent';
import { MemoryStore } from '../memory/memory-store';
import { ChartEngine } from '../charts/chart-engine';

export class CLIInterface {
  private agent: ChartAgent;
  private rl: readline.Interface;
  
  constructor() {
    const memory = new MemoryStore();
    const chartEngine = new ChartEngine();
    this.agent = new ChartAgent(memory, chartEngine);
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'chart-agent> '
    });
  }
  
  async run(): Promise<void> {
    console.log('Welkom bij Chart Agent MVP!');
    console.log('Ik kan staaf- en lijngrafieken maken in FD- of BNR-kleuren.');
    console.log('Typ "/exit" om af te sluiten.\n');
    
    this.rl.prompt();
    
    this.rl.on('line', async (input) => {
      await this.processCommand(input.trim());
      this.rl.prompt();
    });
    
    this.rl.on('close', () => {
      console.log('Tot ziens!');
      process.exit(0);
    });
  }
  
  private async processCommand(command: string): Promise<void> {
    if (command === '/exit') {
      this.rl.close();
      return;
    }
    
    try {
      const response = await this.agent.processRequest(command);
      console.log(response.message);
      
      if (response.chartPath) {
        console.log(`Grafiek opgeslagen in: ${response.chartPath}`);
        // Optionally display SVG in terminal using terminal-kit or similar
      }
    } catch (error) {
      console.error('Fout:', error.message);
    }
  }
}
```

**CLI Flow:**
1. Display welcome message
2. Enter REPL loop using readline
3. Accept user input (text or file path)
4. Pass to agent controller
5. Display response and chart path
6. Save memory on exit

**Package.json Script:**
```json
{
  "scripts": {
    "cli": "tsx src/cli/index.ts",
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

### 6. Web Interface

**Responsibility:** Provide browser-based interaction using Next.js 14.

**Implementation:**
- Next.js 14 App Router
- React Server Components where possible
- API Routes for agent interaction
- Client-side D3.js for chart rendering
- File upload support

**Project Structure (Feature-Based):**
```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Main chat interface
│   ├── layout.tsx            # Root layout
│   └── api/
│       ├── chat/route.ts     # Chat endpoint
│       └── upload/route.ts   # File upload endpoint
├── features/
│   ├── agent/                # Agent feature
│   │   ├── agent-core.ts     # Core agent logic (shared)
│   │   ├── tools.ts          # Agent tools definitions
│   │   └── prompts.ts        # System prompts
│   ├── charts/               # Chart generation feature
│   │   ├── chart-engine.ts   # Chart engine (shared)
│   │   ├── bar-chart.ts      # Bar chart logic
│   │   ├── line-chart.ts     # Line chart logic
│   │   └── colors.ts         # Brand colors config
│   ├── parsers/              # Input parsing feature
│   │   ├── text-parser.ts    # Text input parser
│   │   └── excel-parser.ts   # Excel file parser
│   └── ui/                   # UI components feature
│       ├── ChatInterface.tsx # Chat UI component
│       ├── ChartDisplay.tsx  # D3 chart component
│       └── FileUpload.tsx    # File upload component
├── cli/
│   └── index.ts              # CLI entry point (uses shared features)
├── lib/
│   ├── types.ts              # Shared TypeScript types
│   └── utils.ts              # Shared utilities
└── evals/
    ├── eval-filtering.ts     # Request filtering eval
    ├── eval-accuracy.ts      # Data accuracy eval
    └── runner.ts             # Eval runner
```

**Benefits of Feature-Based Structure:**
- **DRY Principle:** Agent and chart logic shared between CLI and web
- **Scalability:** Easy to add new features without cluttering
- **Maintainability:** Related code grouped together
- **Clear Boundaries:** Each feature is self-contained

**API Routes:**
```typescript
// app/api/chat/route.ts
export async function POST(request: Request) {
  const { message, sessionId } = await request.json();
  
  const agent = new ChartAgent(memory, chartEngine);
  const response = await agent.processRequest(message);
  
  return Response.json({
    message: response.message,
    chartData: response.chartData,
    success: response.success
  });
}

// app/api/upload/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Save file temporarily and process
  // Return chart data
}
```

**Client Components:**
```typescript
// components/ChartDisplay.tsx
'use client';
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export function ChartDisplay({ data, type, colorScheme }) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || !data) return;
    
    // Render D3 chart client-side
    const svg = d3.select(svgRef.current);
    // ... D3 rendering logic
  }, [data, type, colorScheme]);
  
  return <svg ref={svgRef} />;
}
```

## Data Models

### ChartData
```typescript
// src/types/chart.ts
export interface ChartData {
  labels: string[];
  values: number[];
  title: string;
  unit?: string;
  chartType: 'bar' | 'line';
}
```

### AgentResponse
```typescript
// src/types/agent.ts
export interface AgentResponse {
  message: string;
  chartData?: ChartData;
  chartPath?: string;
  success: boolean;
  error?: string;
}
```

### ColorScheme
```typescript
// src/types/colors.ts
export type ColorScheme = 'fd' | 'bnr';

export interface BrandColors {
  primary: string;
  content: string;
  background: string;
}
```

## Error Handling

### Input Validation Errors
- Invalid Excel file format → Clear error message
- Missing data in Excel → Request clarification
- Ambiguous text input → Ask clarifying questions

### Agent Errors
- Non-chart request → Polite refusal with explanation
- Unsupported chart type → Explain limitations
- LLM API failure → Graceful degradation with retry

### File System Errors
- Cannot write chart file → Report error with path
- Memory file corrupted → Reset to defaults

**Error Response Format:**
```python
{
    "success": False,
    "error": "Error description",
    "suggestion": "What user can do"
}
```

## Testing Strategy

### Unit Tests
- Input parser with various text formats
- Excel reader with sample files
- Chart engine output validation
- Memory store persistence

### Integration Tests
- End-to-end CLI flow
- End-to-end web flow
- Agent tool selection

### Evaluation Tests

**Eval 1: Request Filtering**
```typescript
// src/evals/eval-filtering.ts
import { ChartAgent } from '../agent/chart-agent';

interface FilteringTestCase {
  input: string;
  expected: 'accept' | 'refuse';
  description: string;
}

const testCases: FilteringTestCase[] = [
  {
    input: "Create a bar chart with data X",
    expected: "accept",
    description: "Valid bar chart request"
  },
  {
    input: "What's the weather today?",
    expected: "refuse",
    description: "Non-chart request"
  },
  {
    input: "Make a pie chart",
    expected: "refuse",
    description: "Unsupported chart type"
  },
  {
    input: "Show me a line graph of sales",
    expected: "accept",
    description: "Valid line chart request"
  },
  {
    input: "Write me a poem",
    expected: "refuse",
    description: "Completely unrelated request"
  }
];

export async function runFilteringEval(): Promise<EvalResult> {
  // Run test cases and return results
}
```

**Eval 2: Data Accuracy**
```typescript
// src/evals/eval-accuracy.ts
interface AccuracyTestCase {
  input: string;
  expectedLabels: string[];
  expectedValues: number[];
  description: string;
}

const testCases: AccuracyTestCase[] = [
  {
    input: "Chart with Mon=10, Tue=20, Wed=15",
    expectedLabels: ["Mon", "Tue", "Wed"],
    expectedValues: [10, 20, 15],
    description: "Simple inline data"
  },
  {
    input: "Maandag = 4.1, Dinsdag = 4.2, Woensdag = 4.4",
    expectedLabels: ["Maandag", "Dinsdag", "Woensdag"],
    expectedValues: [4.1, 4.2, 4.4],
    description: "Decimal values"
  }
  // Test with Excel files
  // Test with different number formats
];

export async function runAccuracyEval(): Promise<EvalResult> {
  // Run test cases and validate chart data
}
```

**Evaluation Implementation:**
```typescript
// src/evals/runner.ts
export interface EvalResult {
  testName: string;
  passed: number;
  failed: number;
  total: number;
  details: TestCaseResult[];
}

export async function runAllEvals(): Promise<void> {
  const results = [
    await runFilteringEval(),
    await runAccuracyEval()
  ];
  
  // Output JSON results
  console.log(JSON.stringify(results, null, 2));
}
```

**Package.json Script:**
```json
{
  "scripts": {
    "eval": "tsx src/evals/runner.ts"
  }
}
```

## Security Considerations

1. **File Upload Validation:** Only accept .xlsx, .xls files
2. **Path Traversal Prevention:** Sanitize file paths
3. **LLM Prompt Injection:** Use structured prompts with clear boundaries
4. **Resource Limits:** Limit chart size and data points
5. **API Key Security:** Store OpenAI key in environment variables

## Performance Considerations

1. **LLM Calls:** Minimize by caching common patterns
2. **Chart Generation:** Async for web interface
3. **File Size:** Limit Excel file size to 10MB
4. **Memory:** Keep session data minimal

## Deployment

### Installation
```bash
npm install
```

### CLI Usage
```bash
npm run cli
```

### Web Development
```bash
npm run dev
# Access at http://localhost:3000
```

### Web Production
```bash
npm run build
npm start
```

### Run Evaluations
```bash
npm run eval
```

### Environment Variables
```env
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
CHART_OUTPUT_DIR=./public/charts
NODE_ENV=development
```

### Dependencies (package.json)
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@ai-sdk/anthropic": "^1.0.0",
    "ai": "^5.0.0",
    "d3": "^7.0.0",
    "d3-node": "^3.0.0",
    "xlsx": "^0.18.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/d3": "^7.0.0",
    "typescript": "^5.0.0",
    "tsx": "^4.0.0"
  }
}
```

## Future Enhancements (Out of Scope for MVP)

- Additional chart types (pie, scatter)
- More color schemes
- Chart customization options
- Multi-user support
- Cloud storage integration
- Advanced memory (conversation history)
