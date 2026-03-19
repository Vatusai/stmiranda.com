#!/bin/bash

echo "🚀 Iniciando Stephanie Miranda Web..."
echo ""

# Verificar si el puerto 3001 está ocupado
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Puerto 3001 ocupado. Cerrando proceso anterior..."
    kill $(lsof -Pi :3001 -sTCP:LISTEN -t) 2>/dev/null || true
    sleep 1
fi

# Verificar si el puerto 5173 está ocupado
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Puerto 5173 ocupado. Cerrando proceso anterior..."
    kill $(lsof -Pi :5173 -sTCP:LISTEN -t) 2>/dev/null || true
    sleep 1
fi

echo "📦 Iniciando Backend (http://localhost:3001)..."
cd backend
node src/server.js &
BACKEND_PID=$!
cd ..

# Esperar a que el backend inicie
sleep 3

# Verificar si backend está corriendo
if ! lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Error: El backend no pudo iniciar"
    exit 1
fi

echo "✅ Backend iniciado correctamente"
echo ""
echo "🎨 Iniciando Frontend (http://localhost:5173)..."
npm run client

# Al cerrar, matar el backend
trap "echo ''; echo '🛑 Deteniendo backend...'; kill $BACKEND_PID 2>/dev/null || true" EXIT
