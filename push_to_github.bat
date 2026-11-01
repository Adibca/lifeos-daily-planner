@echo off
echo ========================================================
echo Pushing LifeOS Daily Planner to GitHub...
echo ========================================================
cd /d "D:\TASK MANAGER"
"C:\Users\adity\AppData\Local\Programs\Git\cmd\git.exe" push -u origin main
echo.
echo If prompted, please click 'Authorize' in your browser.
pause

