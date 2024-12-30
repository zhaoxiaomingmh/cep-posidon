@echo off
setlocal
chcp 65001 >nul

:: 检查是否以管理员身份运行
openfiles >nul 2>&1
if %errorlevel% neq 0 (
    echo 请求管理员权限...
    powershell -Command "Start-Process '%~0' -ArgumentList '%~1' -Verb RunAs"
    exit /b
)

:: 定义源文件夹和目标文件夹
set "source=%~1"
set "targetDir=C:\Program Files\Common Files\Adobe\Plug-Ins\CC\Generator\com.posidon.generator"
set "target=C:\Program Files\Common Files\Adobe\Plug-Ins\CC\Generator"

:: 检查源文件夹是否存在
if not exist "%source%" (
    echo 源文件夹 %source% 不存在。
    pause
    exit /b
)

:: 检查并创建目标文件夹的父目录
if not exist "C:\Program Files\Common Files\Adobe\Plug-Ins\CC\Generator" (
    echo 创建目标文件夹的父目录...
    mkdir "C:\Program Files\Common Files\Adobe\Plug-Ins\CC\Generator"
    if %errorlevel% neq 0 (
        echo 创建目标文件夹的父目录失败，错误代码：%errorlevel%
        pause
        exit /b
    )
)

:: 删除目标文件夹（如果存在）
if exist "%targetDir%" (
    echo 删除目标文件夹...
    rmdir /s /q "%targetDir%"
    if %errorlevel% neq 0 (
        echo 删除目标文件夹失败，错误代码：%errorlevel%
        pause
        exit /b
    )
)

:: 移动源文件夹到目标位置
move "%source%" "%target%"
if %errorlevel% neq 0 (
    echo 移动文件夹失败，错误代码：%errorlevel%
    pause
    exit /b
)

echo Success