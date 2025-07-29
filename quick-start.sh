#!/bin/bash

# City Work Quick Start Menu (Linux/Mac Version)

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo
echo "========================================"
echo "     City Work Quick Start Menu"
echo "========================================"
echo
echo "Please select startup option:"
echo
echo "[1] Full Project Startup (Recommended)"
echo "    Includes: Database + Backend + Frontend + Auto Browser"
echo
echo "[2] Web Version Startup"
echo "    Includes: Database + Backend + Web Frontend"
echo
echo "[3] Production Deployment"
echo "    Deploy to production environment"
echo
echo "[4] Stop All Services"
echo
echo "[0] Exit"
echo
echo "========================================"
read -p "Enter option (0-4): " choice

case $choice in
    1)
        echo -e "${GREEN}Starting full project...${NC}"
        chmod +x scripts/start-project.sh
        ./scripts/start-project.sh
        ;;
    2)
        echo -e "${GREEN}Starting web version...${NC}"
        # If there's a web version sh script, call it here
        echo -e "${YELLOW}Web version script is under development, please use option 1${NC}"
        ;;
    3)
        echo -e "${GREEN}Deploying to production...${NC}"
        chmod +x scripts/deploy-production.sh
        ./scripts/deploy-production.sh
        ;;
    4)
        echo -e "${GREEN}Stopping all services...${NC}"
        chmod +x scripts/stop-project.sh
        if [ -f scripts/stop-project.sh ]; then
            ./scripts/stop-project.sh
        else
            echo -e "${YELLOW}Stop script not found, please manually stop services${NC}"
        fi
        ;;
    0)
        echo -e "${GREEN}Goodbye!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option, please try again${NC}"
        ;;
esac

echo
echo -e "${GREEN}Operation completed!${NC}"