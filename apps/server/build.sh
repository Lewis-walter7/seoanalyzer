#!/bin/bash

# Install Bun
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Install deps, generate prisma, build
bun install
bunx prisma generate
bun run build
