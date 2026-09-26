# Device & Bus Manager Usermod for WLED

The **Device & Bus Manager Usermod** provides centralized I2C (`Wire`) and SPI peripheral bus management, hardware pin reservation via WLED's `pinManager`, thread-safe transaction locking, and an automated I2C bus scanner.

## Features

- **Centralized Bus Allocator**: Configures and initializes I2C and SPI buses safely with conflict protection via `pinManager`.
- **Thread-Safe Transaction Mutex**: Implements `lockI2C()` / `unlockI2C()` and `lockSPI()` / `unlockSPI()` using FreeRTOS mutexes to guarantee thread-safe multi-usermod access.
- **Automated I2C Bus Scanner**: Scans addresses `0x08` through `0x77` on boot, exposing detected hardware device addresses (OLEDs, BME280, IMUs, RTCs) in the WLED UI Info page.
- **Extensible Architecture**: Designed to easily accommodate future expansion for UART/Serial bus management.

## Enabling the Usermod

Add the following to your build flags or `platformio_override.ini`:

```ini
build_flags =
  -D USERMOD_DEVICE_MANAGER
custom_usermods =
  usermods/device_manager
```

## API Usage for Usermod Developers

```cpp
#include "usermod_v2_device_manager.h"

// Lookup DeviceManager instance
UsermodDeviceManager* devMgr = (UsermodDeviceManager*) UsermodManager::lookup(USERMOD_ID_DEVICE_MANAGER);

if (devMgr != nullptr) {
  // Lock I2C bus during transaction
  if (devMgr->lockI2C()) {
    Wire.beginTransmission(0x3C);
    Wire.write(0x00);
    Wire.endTransmission();
    devMgr->unlockI2C();
  }
}
```
