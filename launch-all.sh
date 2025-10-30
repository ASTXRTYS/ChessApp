#!/bin/bash

# Chess Clock Design Gallery Launcher
# This script starts all 9 design variations on separate ports
# 4 Original Design Gallery + 5 Terminal Hacker Variants

echo "🚀 Starting Chess Clock Design Gallery..."
echo ""

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[0;33m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Base directory (dynamically determined)
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Array to store all PIDs
PIDS=()

echo "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${MAGENTA}  Original Design Gallery (4 variants)${NC}"
echo "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Start each server in the background
echo "${CYAN}Starting Neo-Brutalist on http://localhost:8001${NC}"
cd "$BASE_DIR/neobrutalist" && python3 -m http.server 8001 &> /dev/null &
PIDS+=($!)

echo "${CYAN}Starting Glassmorphic on http://localhost:8002${NC}"
cd "$BASE_DIR/glassmorphic" && python3 -m http.server 8002 &> /dev/null &
PIDS+=($!)

echo "${CYAN}Starting Japanese Zen on http://localhost:8003${NC}"
cd "$BASE_DIR/japanese-zen" && python3 -m http.server 8003 &> /dev/null &
PIDS+=($!)

echo "${CYAN}Starting Cyberpunk on http://localhost:8004${NC}"
cd "$BASE_DIR/cyberpunk" && python3 -m http.server 8004 &> /dev/null &
PIDS+=($!)

echo ""
echo "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${MAGENTA}  Terminal Hacker Variants (5 variants)${NC}"
echo "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "${GREEN}Starting Matrix Rain Terminal on http://localhost:8005${NC}"
cd "$BASE_DIR/terminal-matrix" && python3 -m http.server 8005 &> /dev/null &
PIDS+=($!)

echo "${CYAN}Starting Neon Grid Terminal on http://localhost:8006${NC}"
cd "$BASE_DIR/terminal-neon-grid" && python3 -m http.server 8006 &> /dev/null &
PIDS+=($!)

echo "${YELLOW}Starting Tactical Terminal on http://localhost:8007${NC}"
cd "$BASE_DIR/terminal-tactical" && python3 -m http.server 8007 &> /dev/null &
PIDS+=($!)

echo "${CYAN}Starting Holographic Terminal on http://localhost:8008${NC}"
cd "$BASE_DIR/terminal-hologram" && python3 -m http.server 8008 &> /dev/null &
PIDS+=($!)

echo "${MAGENTA}Starting Glitch Terminal on http://localhost:8009${NC}"
cd "$BASE_DIR/terminal-glitch" && python3 -m http.server 8009 &> /dev/null &
PIDS+=($!)

# Wait a moment for servers to start
sleep 2

echo ""
echo "${GREEN}✅ All servers running!${NC}"
echo ""
echo "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}📱 Original Design Gallery:${NC}"
echo "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "   • Neo-Brutalist:  http://localhost:8001"
echo "   • Glassmorphic:   http://localhost:8002"
echo "   • Japanese Zen:   http://localhost:8003"
echo "   • Cyberpunk:      http://localhost:8004"
echo ""
echo "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}⚡ Terminal Hacker Variants:${NC}"
echo "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "   • Matrix Rain:    http://localhost:8005"
echo "   • Neon Grid:      http://localhost:8006"
echo "   • Tactical:       http://localhost:8007"
echo "   • Holographic:    http://localhost:8008"
echo "   • Glitch:         http://localhost:8009"
echo ""
echo "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "📄 View gallery: file://$BASE_DIR/index.html"
echo "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Function to kill all servers on exit
cleanup() {
    echo ""
    echo "${YELLOW}🛑 Stopping all servers...${NC}"
    for pid in "${PIDS[@]}"; do
        kill $pid 2> /dev/null
    done
    echo "${GREEN}✅ All servers stopped${NC}"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# Keep script running
while true; do
    sleep 1
done
