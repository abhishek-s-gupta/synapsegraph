# SynapseGraph Startup Script (One Command Launch)
Write-Host "======================================================================" -ForegroundColor Magenta
Write-Host " 🧠 [SYNAPSEGRAPH] Production-Grade Autonomous Research Platform" -ForegroundColor Cyan
Write-Host "    Self-Evolving AI Multi-Agent Arena • CPU Sandbox • Reproducibility" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Magenta
Write-Host ""

$Root = $PSScriptRoot
$BackendDir = Join-Path $Root "backend"
$FrontendDir = Join-Path $Root "frontend"

Write-Host "1. Initializing FastAPI Multi-Agent Engine on Port 8000..." -ForegroundColor Yellow
$BackendPython = Join-Path $BackendDir ".venv\Scripts\python.exe"
if (-not (Test-Path $BackendPython)) {
    $BackendPython = "python"
}

$backendProc = Start-Process -FilePath $BackendPython -ArgumentList "-m uvicorn main:app --host 0.0.0.0 --port 8000" -WorkingDirectory $BackendDir -PassThru

Start-Sleep -Seconds 2

Write-Host "2. Starting Vite Interactive Visual Canvas on Port 5173..." -ForegroundColor Green
$frontendProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory $FrontendDir -PassThru

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " ✨ SYNAPSEGRAPH IS RUNNING!" -ForegroundColor Green
Write-Host " 👉 Visual Research Canvas: http://localhost:5173" -ForegroundColor White
Write-Host " 👉 FastAPI Backend API:   http://localhost:8000" -ForegroundColor White
Write-Host " 👉 Interactive API Docs:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C or enter 'stop' to terminate both servers." -ForegroundColor Gray

try {
    while ($true) {
        $input = Read-Host
        if ($input -eq "stop" -or $input -eq "exit" -or $input -eq "q") {
            break
        }
    }
} finally {
    Write-Host "Terminating background processes..." -ForegroundColor Yellow
    Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue
    Write-Host "All processes cleanly stopped." -ForegroundColor Green
}
