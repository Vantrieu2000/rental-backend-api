@echo off
REM Deployment script for Windows
REM This will SSH into your server and run the deployment

echo ========================================
echo   Rental Backend API - Deploy to Server
echo ========================================
echo.

set SERVER_IP=158.178.236.169
set SERVER_USER=ubuntu
set SERVER_PASS=Admin@02122000

echo Connecting to server %SERVER_IP%...
echo.

REM Create a temporary script file
echo curl -o deploy.sh https://raw.githubusercontent.com/Vantrieu2000/rental-backend-api/main/deploy.sh > temp_deploy.sh
echo chmod +x deploy.sh >> temp_deploy.sh
echo ./deploy.sh >> temp_deploy.sh

REM SSH and run the script
ssh %SERVER_USER%@%SERVER_IP% "bash -s" < temp_deploy.sh

REM Clean up
del temp_deploy.sh

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo API should be running at:
echo   http://%SERVER_IP%:3000
echo   http://%SERVER_IP%:3000/api/docs
echo.
pause
