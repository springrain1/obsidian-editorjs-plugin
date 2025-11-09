@echo off
echo Installing Editor.js inline tools and checklist...
echo.

cd /d "%~dp0"

echo Installing @editorjs/checklist...
call npm install @editorjs/checklist@^1.6.0 --save

echo Installing @editorjs/inline-code...
call npm install @editorjs/inline-code@^1.5.1 --save

echo Installing @editorjs/marker...
call npm install @editorjs/marker@^1.4.0 --save

echo Installing @editorjs/underline...
call npm install @editorjs/underline@^1.1.0 --save

echo.
echo Installation complete!
echo.
echo Next steps:
echo 1. Run 'npm run build' to compile the plugin
echo 2. Reload the plugin in Obsidian
echo.
pause
