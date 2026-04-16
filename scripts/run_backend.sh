#!/bin/bash
cd "$(dirname "$0")/.."
uvicorn backend.app:app --reload --port 8000