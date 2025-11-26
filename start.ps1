# Smart Assignment System - Start Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting Smart Assignment System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    return $connection.TcpTestSucceeded
}

# Check if ports are already in use
Write-Host "Checking if ports are available..." -ForegroundColor Yellow
if (Test-Port 5000) {
    Write-Host "⚠ Port 5000 is already in use. Backend may already be running." -ForegroundColor Yellow
}
if (Test-Port 5173) {
    Write-Host "⚠ Port 5173 is already in use. Frontend may already be running." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host 'Backend Server Starting...' -ForegroundColor Green; npm run dev"

Start-Sleep -Seconds 3

Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host 'Frontend Server Starting...' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Servers Starting!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "Two new PowerShell windows have been opened." -ForegroundColor Yellow
Write-Host "Press Ctrl+C in each window to stop the servers." -ForegroundColor Yellow
Write-Host ""
