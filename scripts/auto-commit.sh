#!/bin/bash

# Auto-commit script with conventional commits
# Author: Kiro (Agentic IDE)

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Git author configuration
export GIT_AUTHOR_NAME="Kiro"
export GIT_AUTHOR_EMAIL="kiro@agentic-ide.dev"
export GIT_COMMITTER_NAME="Kiro"
export GIT_COMMITTER_EMAIL="kiro@agentic-ide.dev"

