@echo off
echo ========================================
echo        停止 City Work 项目
echo ========================================
echo.

echo [1/3] 停止Docker服务...
docker-compose down

echo [2/3] 查找并停止Node.js进程...
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq node.exe" /fo table /nh 2^>nul') do (
    if not "%%i"=="PID" (
        echo 停止进程 %%i
        taskkill /pid %%i /f 2>nul
    )
)

echo [3/3] 查找并停止Expo进程...
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq expo.exe" /fo table /nh 2^>nul') do (
    if not "%%i"=="PID" (
        echo 停止进程 %%i
        taskkill /pid %%i /f 2>nul
    )
)

echo.
echo ========================================
echo           停止完成！
echo ========================================
echo.
pause