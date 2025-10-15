@echo off
REM =====================================================
REM Database Setup Script for Windows
REM =====================================================
REM
REM This script sets up the PostgreSQL database for the
REM Experiences Platform.
REM
REM Prerequisites:
REM - PostgreSQL installed
REM - psql in your PATH
REM =====================================================

echo.
echo ========================================
echo  Experiences Platform Database Setup
echo ========================================
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: psql not found in PATH
    echo Please install PostgreSQL or add it to your PATH
    pause
    exit /b 1
)

echo PostgreSQL found!
echo.

REM Prompt for PostgreSQL credentials
set /p PGUSER="Enter PostgreSQL username (default: postgres): " || set PGUSER=postgres
echo Using username: %PGUSER%
echo.

REM Ask if user wants to reset existing database
set /p RESET="Drop existing database if it exists? (y/N): " || set RESET=n
echo.

if /i "%RESET%"=="y" (
    echo WARNING: This will DELETE ALL DATA in experiences_platform database!
    set /p CONFIRM="Are you sure? Type YES to confirm: "
    
    if /i "%CONFIRM%"=="YES" (
        echo.
        echo Resetting database...
        psql -U %PGUSER% -d postgres -f reset_database.sql
        if %ERRORLEVEL% NEQ 0 (
            echo ERROR: Failed to reset database
            pause
            exit /b 1
        )
    ) else (
        echo Database reset cancelled.
        pause
        exit /b 0
    )
) else (
    echo Creating new database...
    psql -U %PGUSER% -d postgres -c "CREATE DATABASE experiences_platform;"
    if %ERRORLEVEL% NEQ 0 (
        echo Note: Database might already exist. Continuing...
    )
)

echo.
echo Installing schema...
psql -U %PGUSER% -d experiences_platform -f database_schema.sql

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install schema
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Database: experiences_platform
echo Tables created: 15+
echo Default categories: 6
echo.
echo To verify, run:
echo   psql -U %PGUSER% -d experiences_platform -c "\dt"
echo.

pause

