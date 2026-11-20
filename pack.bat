@echo off
rem ============================================================
rem  EIDE local VSIX packager
rem
rem  Usage:
rem    pack.bat                 -> builds eide-v<version>-local.vsix
rem    pack.bat myname.vsix     -> builds myname.vsix
rem
rem  NOTE: do NOT pass --no-dependencies to vsce. The webpack
rem  bundle marks x2js/jsonc/iconv-lite as externals, they are
rem  loaded from node_modules at runtime, so the VSIX must ship
rem  node_modules or the extension fails to activate
rem  ("command '_cl.eide.project.refresh' not found").
rem ============================================================
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] node not found in PATH
    exit /b 1
)

for /f "usebackq delims=" %%v in (`node -p "require('./package.json').version"`) do set "VERSION=%%v"
if not defined VERSION (
    echo [ERROR] cannot read version from package.json
    exit /b 1
)

set "OUT=%~1"
if not defined OUT set "OUT=eide-v%VERSION%-local.vsix"

if not exist "node_modules" (
    echo [INFO] node_modules missing, installing dependencies ...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed
        exit /b 1
    )
)

echo [INFO] building production bundle (webpack) ...
call npm run vscode:prepublish
if errorlevel 1 (
    echo [ERROR] webpack build failed
    exit /b 1
)

echo [INFO] packaging %OUT% (with runtime dependencies) ...
call npx --yes @vscode/vsce package -o "%OUT%"
if errorlevel 1 (
    echo [ERROR] vsce package failed
    exit /b 1
)

echo [INFO] done: %CD%\%OUT%
endlocal
