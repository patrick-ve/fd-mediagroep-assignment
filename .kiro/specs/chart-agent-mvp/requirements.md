# Requirements Document

## Introduction

This document outlines the requirements for a Chart Agent MVP that creates bar and line charts in FD or BNR brand colors. The agent operates via CLI, accepts text or Excel input, generates PNG/SVG output, maintains session memory with persistence, and includes evaluation capabilities to ensure correct behavior.

## Requirements

### Requirement 1: Dual Interface (CLI and Web)

**User Story:** As a user, I want to interact with the agent through either a command-line interface or a web interface, so that I can choose the interaction method that suits my workflow.

#### Acceptance Criteria

1. WHEN the user starts the CLI application THEN the system SHALL present a command prompt ready to accept input
2. WHEN the user starts the web application THEN the system SHALL serve a web interface accessible via browser
3. WHEN the user enters a text command in CLI THEN the system SHALL process the request and respond appropriately
4. WHEN the user interacts via web interface THEN the system SHALL provide a chat-like interface for requests
5. WHEN the user provides an Excel file path in CLI THEN the system SHALL read and process the file
6. WHEN the user uploads an Excel file via web interface THEN the system SHALL read and process the file
7. WHEN the user exits the CLI application THEN the system SHALL save session memory and terminate gracefully
8. WHEN the user closes the web browser THEN the system SHALL maintain session state for reconnection

### Requirement 2: Chart Generation

**User Story:** As a user, I want to generate bar or line charts with my data, so that I can visualize information in FD or BNR brand style.

#### Acceptance Criteria

1. WHEN the user requests a chart with valid data THEN the system SHALL generate either a bar chart or line chart
2. WHEN generating a chart THEN the system SHALL use FD colors (primary: #379596, content: #191919, background: #ffeadb) OR BNR colors (primary: #ffd200, content: #000, background: #fff)
3. WHEN a chart is generated THEN the system SHALL save it as PNG or SVG format
4. WHEN a chart is saved THEN the system SHALL inform the user of the output file location
5. WHEN the user provides data in text format THEN the system SHALL parse the data correctly
6. WHEN the user provides an Excel file THEN the system SHALL extract data from the file

### Requirement 3: Input Processing

**User Story:** As a user, I want to provide data either as free text or Excel files, so that I have flexibility in how I supply information.

#### Acceptance Criteria

1. WHEN the user provides text input with data points THEN the system SHALL extract labels and values
2. WHEN the user provides an Excel file path THEN the system SHALL read the file and extract chart data
3. WHEN input data is ambiguous THEN the system SHALL ask clarifying questions using text responses
4. WHEN input data is invalid or incomplete THEN the system SHALL provide clear error messages

### Requirement 4: Task Filtering

**User Story:** As a user, I want the agent to refuse non-chart tasks, so that it stays focused on its core purpose.

#### Acceptance Criteria

1. WHEN the user requests a task unrelated to chart generation THEN the system SHALL politely refuse
2. WHEN the user asks for chart types other than bar or line charts THEN the system SHALL refuse and explain limitations
3. WHEN refusing a request THEN the system SHALL provide a brief explanation of what it can do

### Requirement 5: Memory Management

**User Story:** As a user, I want the agent to remember my preferences within a session and persist them, so that I don't have to repeat my style choices.

#### Acceptance Criteria

1. WHEN the user specifies a color preference (FD or BNR) THEN the system SHALL remember it for the session
2. WHEN the user starts a new session THEN the system SHALL load previously persisted preferences
3. WHEN the session ends THEN the system SHALL persist the user's color preference to disk
4. WHEN no preference is set THEN the system SHALL use a default color scheme

### Requirement 6: Evaluation System

**User Story:** As a developer, I want automated evaluations to verify the agent's behavior, so that I can ensure quality and correctness.

#### Acceptance Criteria

1. WHEN running eval 1 THEN the system SHALL correctly accept chart generation requests
2. WHEN running eval 1 THEN the system SHALL correctly refuse non-chart requests
3. WHEN running eval 2 THEN the system SHALL verify that generated charts contain the correct data points
4. WHEN running eval 2 THEN the system SHALL verify that chart labels match the input data
5. WHEN an eval fails THEN the system SHALL report which test case failed and why

### Requirement 7: Output Format

**User Story:** As a user, I want charts saved as image files, so that I can use them in presentations and documents.

#### Acceptance Criteria

1. WHEN a chart is generated THEN the system SHALL save it as PNG or SVG format
2. WHEN saving a chart THEN the system SHALL use a descriptive filename
3. WHEN a chart file already exists THEN the system SHALL either overwrite or create a new version
4. WHEN a chart is saved THEN the system SHALL display only the file path, not the chart content in text form
