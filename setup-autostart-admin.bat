@echo off
PowerShell -Command "Start-Process PowerShell -ArgumentList '-ExecutionPolicy Bypass -File ""d:\Claude-code-app\clay-book\setup-autostart.ps1""' -Verb RunAs"
