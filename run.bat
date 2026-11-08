@echo off
rem HaqVaani — one-click local app launcher (Windows).
rem Creates a venv on first run, installs deps, starts the server and opens the browser.
setlocal
cd /d "%~dp0"
if not exist .venv (
  echo [HaqVaani] First run: creating virtual environment...
  python -m venv .venv
)
call .venv\Scripts\activate.bat
python -c "import fastapi,uvicorn,pydantic,httpx,python_multipart" 2>nul || (
  echo [HaqVaani] Installing dependencies...
  pip install -r requirements.txt
)
start "" /b cmd /c "timeout /t 2 /nobreak >nul & start "" http://localhost:8000"
python -m haqvaani
