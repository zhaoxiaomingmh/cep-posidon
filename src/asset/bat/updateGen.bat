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

:: 路径定义
set "source=%~1"
set "targetDir=C:\Program Files\Common Files\Adobe\Plug-Ins\CC\Generator\com.posidon.generator"

:: 验证源目录
if not defined source (
  echo 错误：请拖放源文件夹到脚本
  pause
  exit /b
)
if not exist "%source%\" (
  echo 源文件夹 %source% 不存在
  pause
  exit /b
)

:: 创建目标目录
if not exist "%targetDir%" (
  mkdir "%targetDir%" || (
    echo 创建目录失败：%targetDir%
    pause
    exit /b
  )
)

:: 移动操作函数 dist
if exist "%source%\dist" (
  echo 移动 dist...
  if exist "%targetDir%\dist" (
    rmdir /s /q "%targetDir%\dist"
    echo 删除旧文件夹
    if %errorlevel% neq 0 (
        echo 删除目标文件夹失败，错误代码：%errorlevel%
        pause
        exit /b
    )
  )
  move "%source%\dist" "%targetDir%" 
  if %errorlevel% neq 0 (
    echo 移动文件夹失败，错误代码：%errorlevel%
    pause
    exit /b
  )
  echo 移动文件夹dist成功
)
:: 移动操作函数 jsx
if exist "%source%\jsx" (
  echo 移动 jsx...
  if exist "%targetDir%\jsx" (
    rmdir /s /q "%targetDir%\jsx"
    echo 删除旧文件夹
    if %errorlevel% neq 0 (
        echo 删除目标文件夹失败，错误代码：%errorlevel%
        pause
        exit /b
    )
  )
  move "%source%\jsx" "%targetDir%" 
  if %errorlevel% neq 0 (
    echo 移动文件夹失败，错误代码：%errorlevel%
    pause
    exit /b
  )
  echo 移动文件夹jsx成功
)

if exist "%source%\package.json" (
  echo 处理package.json...
   if exist "%targetDir%\package.json" (
     del /q "%targetDir%\package.json" || (
          echo 删除旧版package.json失败
          pause
          exit /b
     )
   )

   move /y "%source%\package.json" "%targetDir%\" >nul || (
    echo 移动package.json失败
     pause
    exit /b
  )

    echo 移动package.json成功
)

if exist "%source%\node_modules" (
  echo 移动 node_modules...
  if not exist "%targetDir%\node_modules" (
  move "%source%\node_modules" "%targetDir%" 
  if %errorlevel% neq 0 (
    echo 移动文件夹失败，错误代码：%errorlevel%
    pause
    exit /b
  )
  echo 移动文件夹node_modules成功
  )
)



echo 成功
pause
