@echo off
cd /d "D:\TASK MANAGER"
"C:\Users\adity\AppData\Local\Programs\Git\cmd\git.exe" add -A
"C:\Users\adity\AppData\Local\Programs\Git\cmd\git.exe" commit -m "feat: Supabase realtime sync, IndexedDB offline, auth, sync indicators"
"C:\Users\adity\AppData\Local\Programs\Git\cmd\git.exe" push origin main
echo Done!
pause

