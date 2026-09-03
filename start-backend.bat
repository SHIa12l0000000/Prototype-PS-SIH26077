@echo off
title SKYSHIELD Backend (FastAPI)
echo ========================================================
echo  Starting SKYSHIELD Backend API on http://127.0.0.1:8000
echo ========================================================
python -m uvicorn backend.app.main:app --reload --port 8000
pause
