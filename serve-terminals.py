#!/usr/bin/env python3
"""
Multi-Port Terminal Server
Serves all 5 terminal hacker variants on different ports
"""

import http.server
import socketserver
import threading
import os
import sys

# Configuration
# Ports 8005-8009 to avoid conflict with original gallery (8001-8004)
TERMINALS = [
    {
        'name': 'Matrix Rain Terminal',
        'dir': 'terminal-matrix',
        'port': 8005,
        'color': '\033[92m'  # Green
    },
    {
        'name': 'Neon Grid Terminal',
        'dir': 'terminal-neon-grid',
        'port': 8006,
        'color': '\033[96m'  # Cyan
    },
    {
        'name': 'Tactical Terminal',
        'dir': 'terminal-tactical',
        'port': 8007,
        'color': '\033[93m'  # Yellow
    },
    {
        'name': 'Holographic Terminal',
        'dir': 'terminal-hologram',
        'port': 8008,
        'color': '\033[94m'  # Blue
    },
    {
        'name': 'Glitch Terminal',
        'dir': 'terminal-glitch',
        'port': 8009,
        'color': '\033[95m'  # Magenta
    }
]

RESET = '\033[0m'
BOLD = '\033[1m'

class QuietHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with minimal logging"""

    def log_message(self, format, *args):
        # Only log errors
        if self.command == 'GET' and '200' in str(args):
            return
        super().log_message(format, *args)

def serve_directory(directory, port, name, color):
    """Serve a directory on a specific port"""
    os.chdir(directory)

    with socketserver.TCPServer(("", port), QuietHTTPRequestHandler) as httpd:
        print(f"{color}{BOLD}✓ {name}{RESET}")
        print(f"  {color}http://localhost:{port}{RESET}")
        httpd.serve_forever()

def print_banner():
    """Print startup banner"""
    banner = f"""
{BOLD}╔═══════════════════════════════════════════════════════════╗
║         TERMINAL HACKER CHESS CLOCK SERVERS               ║
║                   Mobile-First Design                      ║
╚═══════════════════════════════════════════════════════════╝{RESET}
"""
    print(banner)

def main():
    """Start all servers"""
    print_banner()

    # Get base directory
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # Check if all directories exist
    missing = []
    for terminal in TERMINALS:
        path = os.path.join(base_dir, terminal['dir'])
        if not os.path.exists(path):
            missing.append(terminal['dir'])

    if missing:
        print(f"\n{BOLD}Error: Missing directories:{RESET}")
        for d in missing:
            print(f"  - {d}")
        sys.exit(1)

    print(f"{BOLD}Starting servers...{RESET}\n")

    # Start each server in a separate thread
    threads = []
    for terminal in TERMINALS:
        directory = os.path.join(base_dir, terminal['dir'])
        thread = threading.Thread(
            target=serve_directory,
            args=(directory, terminal['port'], terminal['name'], terminal['color']),
            daemon=True
        )
        thread.start()
        threads.append(thread)

    print(f"\n{BOLD}All servers running!{RESET}")
    print(f"{BOLD}Press Ctrl+C to stop all servers{RESET}\n")

    try:
        # Keep main thread alive
        for thread in threads:
            thread.join()
    except KeyboardInterrupt:
        print(f"\n\n{BOLD}Shutting down all servers...{RESET}")
        print(f"{BOLD}Goodbye!{RESET}\n")

if __name__ == "__main__":
    main()
