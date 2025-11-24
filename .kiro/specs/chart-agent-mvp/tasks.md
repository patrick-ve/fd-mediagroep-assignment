# Implementation Plan

- [ ] 1. Set up project structure and dependencies
  - Initialize Next.js 14 project with TypeScript
  - Install core dependencies: AI SDK, Anthropic, D3.js, d3-node, xlsx, zod
  - Create feature-based folder structure (features/agent, features/charts, features/parsers, features/ui)
  - Set up environment variables (.env.local with ANTHROPIC_API_KEY)
  - Configure TypeScript with strict mode
  - _Requirements: 1.1, 1.2_

- [ ] 2. Implement brand colors configuration
  - [ ] 2.1 Create colors configuration module
    - Define FD and BNR color schemes as TypeScript constants
    - Export ColorScheme type and BrandColors interface
    - _Requirements: 2.2_

- [ ] 3. Implement chart engine with D3
  - [ ] 3.1 Create base chart engine class
    - Set up ChartEngine class with d3-node integration
    - Implement SVG file saving functionality
    - Create chart output directory management
    - _Requirements: 2.3, 2.4, 7.1, 7.2_
  
  - [ ] 3.2 Implement bar chart generation
    - Create bar chart using d3-node with brand colors
    - Apply FD/BNR styling (background, bars, text)
    - Return both SVG string and file path
    - Write unit tests for bar chart generation
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 3.3 Implement line chart generation
    - Create line chart using d3-node with brand colors
    - Apply FD/BNR styling (background, line, text)
    - Return both SVG string and file path
    - Write unit tests for line chart generation
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 4. Implement Excel parser
  - [ ] 4.1 Create Excel file parser
    - Use xlsx library to read Excel files
    - Extract labels from first column, values from second column
    - Handle headers and multiple sheet scenarios
    - Return structured ChartData
    - Write unit tests with sample Excel files
    - _Requirements: 3.2, 3.4_

- [ ] 5. Implement agent system prompts with XML tags
  - [ ] 5.1 Create system prompt module
    - Define getSystemPrompt() with XML-tagged sections
    - Include role, capabilities, restrictions, brand_colors, instructions, behavior
    - Specify Dutch language requirement in behavior section
    - Create getUserMessageTemplate() to wrap user input in XML tags
    - _Requirements: 4.1, 4.2, 4.3, 5.4_

- [ ] 6. Implement AI SDK agent tools
  - [ ] 6.1 Create agent tools definitions
    - Define create_bar_chart tool with zod schema
    - Define create_line_chart tool with zod schema
    - Connect tools to ChartEngine methods
    - Return success status and file path from tool execution
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 7. Implement core agent logic
  - [ ] 7.1 Create agent core module
    - Implement processAgentRequest() function using AI SDK
    - Configure Claude Sonnet 4.5 model
    - Integrate conversation history for memory
    - Handle Excel data in user messages
    - Format agent responses with Dutch messages
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Implement CLI interface
  - [ ] 8.1 Create CLI entry point
    - Set up readline interface with custom prompt
    - Display Dutch welcome message
    - Implement REPL loop for user input
    - Handle /exit command
    - Integrate with agent core
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7_
  
  - [ ] 8.2 Add CLI chart display
    - Display SVG string in terminal
    - Show file path confirmation in Dutch
    - Handle errors with Dutch error messages
    - _Requirements: 2.4, 7.4_
  
  - [ ] 8.3 Add CLI Excel file support
    - Accept file path as input
    - Parse Excel file and pass data to agent
    - Handle file not found errors
    - _Requirements: 1.5, 3.2_

- [ ] 9. Implement Next.js web interface
  - [ ] 9.1 Create API route for chat
    - Set up POST /api/chat endpoint
    - Accept message and conversation history
    - Call agent core with user message
    - Return agent response with chart data
    - Handle errors gracefully
    - _Requirements: 1.2, 1.4_
  
  - [ ] 9.2 Create API route for file upload
    - Set up POST /api/upload endpoint
    - Accept Excel file via FormData
    - Save file temporarily
    - Parse Excel and return chart data
    - Clean up temporary files
    - _Requirements: 1.6, 3.2_
  
  - [ ] 9.3 Create chat interface component
    - Build React chat UI with message history
    - Display user and agent messages in Dutch
    - Show loading state during agent processing
    - Handle error states
    - _Requirements: 1.4, 1.8_
  
  - [ ] 9.4 Create chart display component
    - Build D3.js client-side chart renderer
    - Accept chart data from API
    - Render bar and line charts with brand colors
    - Make charts responsive
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 9.5 Create file upload component
    - Build file upload UI for Excel files
    - Validate file type (.xlsx, .xls)
    - Show upload progress
    - Display error messages in Dutch
    - _Requirements: 1.6, 3.2, 3.4_
  
  - [ ] 9.6 Create main page
    - Integrate chat interface, chart display, and file upload
    - Set up layout with Next.js App Router
    - Add Dutch UI labels and instructions
    - _Requirements: 1.2, 1.4_

- [ ] 10. Implement evaluation system
  - [ ] 10.1 Create request filtering eval
    - Define test cases for accept/refuse scenarios
    - Test valid chart requests (bar, line)
    - Test invalid requests (pie chart, weather, poems)
    - Verify agent refuses correctly with explanations
    - Output JSON results with pass/fail counts
    - _Requirements: 6.1, 6.2_
  
  - [ ] 10.2 Create data accuracy eval
    - Define test cases with expected labels and values
    - Test text input parsing (inline data, decimal values)
    - Test Excel file parsing
    - Verify chart data matches expected output
    - Output JSON results with detailed failures
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [ ] 10.3 Create eval runner
    - Implement runAllEvals() function
    - Execute both filtering and accuracy evals
    - Aggregate results
    - Output comprehensive JSON report
    - Add npm script "eval" to run evaluations
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 11. Add TypeScript types and interfaces
  - Create ChartData interface
  - Create AgentResponse interface
  - Create ColorScheme type
  - Create BrandColors interface
  - Export all types from lib/types.ts
  - _Requirements: 2.1, 2.3, 7.1_

- [ ] 12. Create package.json scripts
  - Add "cli" script to run CLI with tsx
  - Add "dev" script for Next.js development
  - Add "build" script for production build
  - Add "start" script for production server
  - Add "eval" script to run evaluations
  - _Requirements: 1.1, 1.2_

- [ ] 13. Create sample test data
  - Create sample Excel files for testing (OV checkins, studieschuld)
  - Add test data for evaluations
  - Document test prompts in README
  - _Requirements: 3.2, 6.3, 6.4_

- [ ] 14. Add error handling and validation
  - Validate Excel file format and size
  - Handle LLM API failures with retry logic
  - Sanitize file paths to prevent traversal
  - Add input validation for chart data
  - Display user-friendly Dutch error messages
  - _Requirements: 3.4, 4.3_

- [ ] 15. Create documentation
  - Write README with setup instructions
  - Document CLI usage with examples
  - Document web interface usage
  - Add environment variable documentation
  - Include test prompt examples in Dutch
  - Document evaluation system
  - _Requirements: All_

- [ ] 16. Final integration and testing
  - Test complete CLI flow with both test prompts
  - Test complete web flow with file upload
  - Verify Dutch language in all interactions
  - Run both evaluations and verify passing
  - Test FD and BNR color schemes
  - Verify memory persistence across conversation
  - Test error scenarios
  - _Requirements: All_
