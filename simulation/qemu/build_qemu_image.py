import os
import sys

def build_flash_image():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
    pio_build = os.path.join(base_dir, '.pio', 'build', 'esp32dev')
    output_bin = os.path.join(os.path.dirname(__file__), 'qemu_flash.bin')

    bootloader = os.path.join(pio_build, 'bootloader.bin')
    partitions = os.path.join(pio_build, 'partitions.bin')
    firmware = os.path.join(pio_build, 'firmware.bin')

    flash_size = 4 * 1024 * 1024  # 4MB
    flash_data = bytearray([0xFF] * flash_size)

    def write_at(offset, filepath):
        if os.path.exists(filepath):
            with open(filepath, 'rb') as f:
                data = f.read()
                flash_data[offset:offset + len(data)] = data
            print(f"  [+] Wrote {os.path.basename(filepath)} ({len(data)} bytes) at offset 0x{offset:X}")
        else:
            print(f"  [-] Warning: File missing {filepath}")

    print("Building 4MB QEMU SPI Flash Image...")
    write_at(0x1000, bootloader)
    write_at(0x8000, partitions)
    write_at(0x10000, firmware)

    with open(output_bin, 'wb') as f:
        f.write(flash_data)

    print(f"SUCCESS: Created QEMU flash image -> {output_bin} ({len(flash_data)} bytes)")

if __name__ == '__main__':
    build_flash_image()
