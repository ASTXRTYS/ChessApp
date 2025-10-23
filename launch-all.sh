#!/bin/bash

# Chess Clock Design Gallery Launcher
# This script starts all four design variations on separate ports

echo "🚀 Starting Chess Clock Design Gallery..."
echo ""

# Colors for output
GREEN='\033[0.32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="/Users/Jason/Desktop/chess-clock/v2"

# Start each server in the background
echo "${CYAN}Starting Neo-Brutalist on http://localhost:8001${NC}"
cd "$BASE_DIR/neobrutalist" && python3 -m http.server 8001 &> /dev/null &
BRUTALIST_PID=$!

echo "${CYAN}Starting Glassmorphic on http://localhost:8002${NC}"
cd "$BASE_DIR/glassmorphic" && python3 -m http.server 8002 &> /dev/null &
GLASS_PID=$!

echo "${CYAN}Starting Japanese Zen on http://localhost:8003${NC}"
cd "$BASE_DIR/japanese-zen" && python3 -m http.server 8003 &> /dev/null &
ZEN_PID=$!

echo "${CYAN}Starting Cyberpunk on http://localhost:8004${NC}"
cd "$BASE_DIR/cyberpunk" && python3 -m http.server 8004 &> /dev/null &
CYBER_PID=$!

# Wait a moment for servers to start
sleep 2

echo ""
echo "${GREEN}✅ All servers running!${NC}"
echo ""
echo "📱 Design Gallery:"
echo "   • Neo-Brutalist:  http://localhost:8001"
echo "   • Glassmorphic:   http://localhost:8002"
echo "   • Japanese Zen:   http://localhost:8003"
echo "   • Cyberpunk:      http://localhost:8004"
echo ""
echo "📄 View all designs: file://$BASE_DIR/index.html"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Function to kill all servers on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all servers..."
    kill $BRUTALIST_PID $GLASS_PID $ZEN_PID $CYBER_PID 2> /dev/null
    echo "✅ All servers stopped"
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT TERM

# Keep script running
while true; do
    sleep 1
done
