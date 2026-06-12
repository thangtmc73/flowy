#!/bin/sh
# nginx listens on port 8080 (public), Python agent on 8081 (internal only)
AGENT_PORT=8081 python main.py &
nginx -g "daemon off;"
