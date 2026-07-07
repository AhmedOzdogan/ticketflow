#!/bin/bash

set -e

echo "🚀 Starting TicketFlow Django API..."

cd "$(dirname "$0")/../api"

if [ ! -d ".venv" ]; then
  echo "❌ Virtual environment not found."
  echo "Run this first:"
  echo "python3 -m venv .venv"
  echo "source .venv/bin/activate"
  echo "pip install -r requirements.txt"
  exit 1
fi

source .venv/bin/activate

echo "🐘 Starting PostgreSQL Docker container..."
cd ..
docker compose up -d postgres

cd api

echo "✅ Running Django checks..."
python manage.py check

echo "🗄️ Running migrations..."
python manage.py migrate

echo "🌍 Starting Django server..."
python manage.py runserver