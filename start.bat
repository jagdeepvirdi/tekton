@echo off
cd /d "%~dp0"
echo.
echo  =========================================
echo   TEKTON INDIA  —  Static Website Server
echo  =========================================
echo.
echo   Site          -^>  http://localhost:4200
echo   Configurator  -^>  http://localhost:4200/configurator.html
echo   Products      -^>  http://localhost:4200/products.html
echo.
echo   Press Ctrl+C to stop the server.
echo.
start "" http://localhost:4200
python -m http.server 4200
