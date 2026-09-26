@echo off
echo ========================================================
echo 🚀 Building 4MB QEMU ESP32 Flash Image...
echo ========================================================
python %~dp0build_qemu_image.py

if not exist "%~dp0qemu_flash.bin" (
    echo [ERROR] Flash image creation failed! Run 'pio run -e esp32dev' first.
    pause
    exit /b 1
)

echo ========================================================
echo ⚡ Launching QEMU ESP32 System Emulator...
echo ========================================================
qemu-system-xtensa -nographic -machine esp32 ^
  -drive file=%~dp0qemu_flash.bin,if=mtd,format=raw ^
  -net nic,model=esp32 -net user,hostfwd=tcp::8080-:80
