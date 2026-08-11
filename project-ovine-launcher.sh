#!/usr/bin/env bash

# SPDX-License-Identifier: CC-BY-SA-4.0
# [a2ml-metadata-block]
# id = "project-ovine"
# type = "launcher"
# version = "0.1.0"
# app-name = "project-ovine"
# app-display = "Project Ovine"
# app-url = "http://localhost:8899"
# standards-compliance = ["launcher-standard.a2ml"]
# modes = ["--auto", "--start", "--stop", "--status", "--integ", "--disinteg", "--help", "--version"]
# platforms = ["linux", "wsl"]
# lifecycle-phases-covered = ["LM-LA-INSTALL"]
# lifecycle-phases-deferred = []

APP_NAME="project-ovine"
VERSION="0.1.0 (local) [linux-wsl]"
PORT=8899
URL="http://localhost:$PORT"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# XDG state and runtime dirs
RUNTIME_DIR="${XDG_RUNTIME_DIR:-${TMPDIR:-/tmp}}"
STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}"
PID_FILE="$RUNTIME_DIR/${APP_NAME}-server.pid"
LOG_FILE="$STATE_DIR/${APP_NAME}/server.log"

mkdir -p "$(dirname "$PID_FILE")"
mkdir -p "$(dirname "$LOG_FILE")"

start_server() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "Server already running at $URL (PID $(cat $PID_FILE))"
        return 0
    fi
    echo "Starting Project Ovine on port $PORT..."
    nohup python3 -m http.server $PORT -d "$REPO_DIR" > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    
    # Wait for URL
    for i in {1..15}; do
        if curl -s -f -m 2 "$URL" > /dev/null; then
            echo "Server is up!"
            return 0
        fi
        sleep 1
    done
    echo "Server failed to start within 15 seconds. Check logs at $LOG_FILE"
    exit 1
}

stop_server() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 $PID 2>/dev/null; then
            echo "Stopping server (PID $PID)..."
            kill $PID
        else
            echo "Server not running."
        fi
        rm -f "$PID_FILE"
    else
        echo "Server not running."
    fi
}

status_server() {
    if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
        echo "RUNNING (PID $(cat $PID_FILE)) at $URL"
    else
        echo "STOPPED"
    fi
}

open_browser() {
    echo "Opening $URL in browser..."
    if grep -i "microsoft" /proc/version >/dev/null 2>&1; then
        wslview "$URL" || cmd.exe /c start "$URL"
    elif command -v xdg-open >/dev/null; then
        xdg-open "$URL"
    else
        echo "Open manually: $URL"
    fi
}

integration() {
    echo "Integrating desktop shortcut to Windows Desktop..."
    cat << 'EOF' > /tmp/create_shortcut.ps1
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("C:\Users\USER\Desktop\Project Ovine.lnk")
$Shortcut.TargetPath = "wsl.exe"
$Shortcut.Arguments = "-e bash -c `"/home/hyperpolymath/developer/repos/metadatastician/meta-repos/project-ovine/project-ovine-launcher.sh --auto`""
$Shortcut.Save()
EOF
    powershell.exe -ExecutionPolicy Bypass -File "$(wslpath -w /tmp/create_shortcut.ps1)"
    echo "Integration complete."
}

disintegration() {
    echo "Removing desktop shortcut..."
    powershell.exe -Command "Remove-Item 'C:\Users\USER\Desktop\Project Ovine.lnk' -ErrorAction SilentlyContinue"
    echo "Disintegration complete."
}

MODE="$1"
case "$MODE" in
    "--browser"|"--web"|"--auto"|"")
        start_server
        open_browser
        ;;
    "--start")
        start_server
        ;;
    "--stop")
        stop_server
        ;;
    "--status")
        status_server
        ;;
    "--integ")
        integration
        ;;
    "--disinteg")
        disintegration
        ;;
    "--version")
        echo "$APP_NAME $VERSION"
        ;;
    "--help")
        echo "Usage: $0 [--auto|--start|--stop|--status|--integ|--disinteg|--help|--version]"
        ;;
    *)
        echo "Unknown mode: $MODE"
        exit 1
        ;;
esac
