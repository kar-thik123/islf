@echo off
echo Starting ISLF Logistics Application for Hamachi Access...
echo.
echo Your Hamachi IP: 25.5.93.125
echo Backend will be available at: http://25.5.93.125:3001
echo Frontend will be available at: http://25.5.93.125:4200
echo.
echo Starting Backend Server...
cd islf_server_main
start "Backend Server" cmd /k "node main.js"
echo Backend server started!
echo.
echo Starting Frontend Server...
cd ..\islf_ui_main\islf_logistics
start "Frontend Server" cmd /k "ng serve --host 0.0.0.0 --port 4200"
echo Frontend server started!
echo.
echo Both servers are now running!
echo You can access the application at:
echo - Local: http://localhost:4200
echo - Hamachi: http://25.5.93.125:4200
echo.
pause 