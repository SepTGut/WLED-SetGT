# WLED-SetGT ✨

![WLED Logo](images/wled_logo_akemi.png)

**Next-Generation Lighting Firmware with Native Automation Engine & Real-Time ESP-IDF V5 Audio DSP**

[![Version 17.0.0-devV5](https://img.shields.io/badge/version-17.0.0--devV5-blue?style=flat-square)](https://github.com/SepTGut/WLED-SetGT/releases)
[![ESP-IDF V5](https://img.shields.io/badge/platform-ESP--IDF%20V5%20%2F%20Arduino%203.x-emerald?style=flat-square)](https://github.com/tasmota/platform-espressif32)
[![Wokwi Simulation Ready](https://img.shields.io/badge/simulation-Wokwi%20Ready-orange?style=flat-square)](https://wokwi.com)
[![Tests 16/16 Passed](https://img.shields.io/badge/tests-16%2F16%20passed-brightgreen?style=flat-square)](#run-automated-tests)
[![EUPL v1.2](https://img.shields.io/badge/license-EUPL%201.2-blue?style=flat-square)](https://raw.githubusercontent.com/SepTGut/WLED-SetGT/main/LICENSE)
[![Discord](https://img.shields.io/discord/473448917040758787.svg?colorB=5865F2&label=discord&style=flat-square)](https://discord.gg/QAh7wJHrRM)
[![Documentation](https://img.shields.io/badge/docs-kno.wled.ge-blueviolet?style=flat-square)](https://kno.wled.ge)

---

## 📑 Table of Contents

- [🌟 Overview](#-overview)
- [🛠️ Personal Fork & Development Ledger](#️-personal-fork--development-ledger)
  - [⚙️ Core Changes & Firmware Stabilization](#️-core-changes--firmware-stabilization)
  - [🧩 New Custom Usermods Added](#-new-custom-usermods-added)
  - [🖥️ Simulation Suite & Developer Tooling](#️-simulation-suite--developer-tooling)
  - [🔧 Personal Default Configuration](#-personal-default-configuration)
- [⚡ Feature Comparison](#-what-makes-wled-setgt-unique)
- [🚀 Key Modules Deep Dive](#-key-modules-deep-dive)
  - [🎛️ Glassmorphic Automation Engine](#️-glassmorphic-automation-engine)
  - [🎵 ESP-IDF V5 AudioReactive Driver](#-esp-idf-v5-audioreactive-driver)
  - [🔌 Harmonized Device Manager](#-harmonized-device-manager)
- [💻 Simulation with Wokwi](#-simulation-with-wokwi)
  - [Select Layout Mode](#select-layout-mode)
  - [Launch Simulation in VS Code](#launch-simulation-in-vs-code)
  - [Access Web UI](#access-web-ui)
  - [Monitor Live Packet Traffic](#monitor-live-packet-traffic)
- [📂 Project Directory Structure](#-project-directory-structure)
- [🛠️ Quick Start & Build Instructions](#️-quick-start--build-instructions)
  - [Prerequisites](#prerequisites)
  - [Clone & Install Dependencies](#clone--install-dependencies)
  - [Build Web UI Assets](#build-web-ui-assets)
  - [Run Automated Tests](#run-automated-tests)
  - [Compile ESP32 Firmware](#compile-esp32-firmware)
- [📊 Memory & Performance Blueprint](#-memory--performance-blueprint)
- [🌐 Supported Protocols & Integrations](#-supported-protocols--integrations)
- [⚙️ Compatible Hardware & LED Drivers](#️-compatible-hardware--led-drivers)
- [🤝 Contributing & AI Agent Policy](#-contributing--ai-agent-policy)
- [⚠️ Photosensitivity Warning & Disclaimer](#️-photosensitivity-warning--disclaimer)
- [📜 License & Credits](#-license--credits)

---

## 🌟 Overview

**WLED-SetGT** is an advanced, high-performance personal distribution of [WLED](https://github.com/wled/WLED) engineered for modern ESP32 microcontrollers using the **ESP-IDF V5.x** framework. It combines the legendary LED control capabilities of WLED with an offline **Glassmorphic Automation Engine**, ultra-low-jitter **AudioReactive DSP**, harmonized **I2C Device Management**, and a pre-configured **Wokwi simulation suite** for zero-hardware local development and testing.

Whether driving individual addressable LED strips, expansive 2D matrix arrays, or synchronized multi-node fixtures, WLED-SetGT delivers rock-solid stability and modern tooling.

---

## 🛠️ Personal Fork & Development Ledger

> [!NOTE]
> This section documents all custom components, architectural modifications, bug fixes, and development tooling introduced in this repository.

### ⚙️ Core Changes & Firmware Stabilization

| File / Component | What Changed | Technical Rationale & Impact |
| :--- | :--- | :--- |
| `wled00/cfg.cpp` | Gated default 2D panel injection with `else if (!fromFS)` | Prevents user-disabled 2D matrix configurations from being forcibly re-enabled on reboot. Preserves `cumulativeStart` offsets for multi-bus setups. |
| `wled00/bus_manager.cpp` | Replaced 100ms cutoff in `removeAll()` with safe 500ms watchdog loop | Uses `delay(1)` and `yield()` to feed FreeRTOS watchdog while waiting for active DMA/RMT transfers to finish cleanly before releasing bus memory. |
| `wled00/my_config.h` | Enabled `CLIENT_SSID "Wokwi-GUEST"` and `WLED_USE_MY_CONFIG` | Allows zero-configuration automatic Wi-Fi association when booting in Wokwi simulator or local development networks. |
| `wled00/const.h` | Activated `#define WLED_USE_MY_CONFIG` | Directs firmware preprocessor to load personal overrides from `my_config.h`. |
| `wled00/wled_server.cpp` | Registered `/automations` and `/automations.htm` routes | Enables firmware web server to serve the native Automation Engine UI via `handleStaticContent`. |
| `wled00/data/common.js` | Updated WebSocket URL resolution | Dynamically detects `wss://` on HTTPS and preserves custom host ports (e.g., `localhost:8180` in Wokwi) instead of defaulting to plain `ws://`. |
| `wled00/data/index.js` | Synchronized WebSocket auto-negotiation | Ensures seamless real-time UI synchronization across both physical hardware and simulated network environments. |
| `tools/cdata.js` | Integrated `PAGE_automations` into build pipeline | Automatically minifies `automations.htm` and compiles it into `wled00/html_other.h` during `npm run build`. |
| `wokwi.toml` & `diagram.json` | Placed at repository workspace root | Enables instant auto-discovery by the VS Code Wokwi extension and configures port forwarding (`localhost:8180` → `target:80`). |

### 🧩 New Custom Usermods Added

- 🎛️ **Automation Engine (`usermods/automation_engine/`):**
  - **Native Rules Engine:** Edge-triggered state evaluation for power state changes (`powerChanged`), preset switches (`presetChanged`), time-of-day matching, and solar position matching (Sunrise, Sunset, Dawn, Dusk).
  - **Glassmorphic Web UI (`automations.htm`):** Standalone, dark-mode acrylic web interface with trigger-to-action flow cards, Sun–Sat day picker pills, dynamic preset dropdowns, and toast notifications.
  - **Optimized Network Footprint:** Emits lightweight summary telemetry (`enabled`, `count`) in `addToJsonState()`, eliminating WebSocket broadcast saturation.
  - **Storage Engine:** 6KB LittleFS JSON document allocation (`DynamicJsonDocument doc(6144)`) for storing up to 16 complex multi-condition automation rules.
  - **Loop Safety Guards:** Recursion depth limiters (`executionDepth`) prevent automation cascade loops.

- 🎵 **AudioReactive Driver for ESP-IDF V5 (`usermods/audioreactive/`):**
  - **Dynamic Heap DSP Buffering:** Replaced static `rawBuf[1024]` task stack allocation with dynamic heap buffer (`_rawBuf`), completely eliminating stack overflow crashes in the 3592-word FreeRTOS FFT task.
  - **Channel Validation & Pin Protection:** Added strict bounds checking (`channel < 0 || channel > 7`) for ADC1 in both `AdcContSource` and `I2SAdcSource` to prevent invalid pin configuration and GPIO leaks.
  - **Partial Read Smoothing:** Implemented smooth sample decay filtering on partial DMA reads to eliminate acoustic impulse noise clicks in the frequency spectrum.

- 🔌 **Harmonized Device Manager (`usermods/device_manager/`):**
  - **Core `HW_I2C` Arbitration:** Harmonized with core WLED I2C pins (`i2c_sda`, `i2c_scl`), eliminating `PinOwner` pin allocation conflicts.
  - **Runtime Address Scanner:** Active diagnostic scanner exposed in `/json/info` to detect attached OLED/LCD displays and sensors.
  - **Safe FreeRTOS Mutexes:** Mutex creation deferred to `setup()` to avoid initialization race conditions.

- 📡 **ESP-NOW Wireless Mesh (`usermods/wled_espnow/`):**
  - Low-latency peer-to-peer wireless synchronization between WLED controllers without requiring an external Wi-Fi router.

- 🌡️ **Internal MCU Temperature Telemetry (`usermods/Internal_Temperature_v2/`):**
  - Real-time ESP32 on-chip silicon die temperature monitoring exposed in `/json/info` and web UI.

### 🖥️ Simulation Suite & Developer Tooling

WLED-SetGT includes a complete local simulation and traffic analysis environment:

| Tool / Script | Command | Purpose |
| :--- | :--- | :--- |
| **Wokwi VS Code Simulator** | `Ctrl+Shift+P` → `Wokwi: Start Simulator` | Emulates ESP32 firmware with live LEDs, virtual Wi-Fi gateway, and web UI at `http://localhost:8180`. |
| **Single-Board Layout** | `npm run sim:single` | Switches Wokwi wiring to a single ESP32 driving a 900-LED array. |
| **Distributed Multi-Node** | `npm run sim:distributed` | Switches Wokwi wiring to multi-node mesh (2D Matrix Master + ESP-NOW synchronized nodes). |
| **Real-Time Packet Sniffer** | `python simulation/monitor_packets.py` | Sniffs and logs ESP-NOW, DDP, E1.31, and UDP broadcast traffic in real time. |
| **PCAP Traffic Inspector** | `python simulation/parse_pcap.py` | Parses Wireshark PCAP captures (`simulation/wokwi.pcap`) from Wokwi simulation runs. |
| **Express Dev Mock Server** | `npm run sim` | Lightweight Node.js server with WebSocket simulation for rapid web UI prototyping. |
| **Live UI Watch Mode** | `npm run dev` | Auto-recompiles web UI assets into C++ headers on every HTML/JS/CSS save. |
| **Automated Test Suite** | `npm test` | Runs Node.js built-in test runner (`cdata-test.js`) validating minification and build integrity. |

### 🔧 Personal Default Configuration

Settings preconfigured in [wled00/my_config.h](file:///d:/MyCode/WLED-SetGT/wled00/my_config.h):

```c
#pragma once

// Wokwi Simulator Auto Wi-Fi Connect
#define CLIENT_SSID "Wokwi-GUEST"
#define CLIENT_PASS ""
```

- **PlatformIO Toolchain:** Configured for Tasmota ESP32 Platform 2026.05.50 (ESP-IDF V5.4 / Arduino Core 3.x).
- **Firmware Artifact Exports:** Build scripts automatically copy `firmware.bin` and `firmware.elf` into `build_output/release/` and `build_output/firmware/`.

---

## ⚡ What Makes WLED-SetGT Unique?

| Feature | Vanilla WLED | WLED-SetGT |
| :--- | :--- | :--- |
| **Automation Engine** | Requires external Home Assistant or complex cron JSON | **Native Edge-Triggered Automation Engine** with offline glassmorphic rule builder (`/automations`) |
| **AudioReactive DSP** | Stack-allocated buffer in FreeRTOS tasks (overflow risk on v5) | **Heap-offloaded DMA/ADC DSP** with smooth decay filtering & channel bounds protection |
| **I2C Management** | Potential pin collision between core and usermods | **Unified `HW_I2C` Device Manager** with on-demand I2C bus address scanning via `/json/info` |
| **2D Matrix Persistence** | Default matrix re-injection can override disabled states | **Preserved 2D State** across reboots (`!fromFS` guard) + trailing strip sparse ledmaps |
| **Hardware Simulation** | Manual setup required | **Preconfigured Wokwi Simulation Suite** with single-node & distributed multi-node layouts |
| **Bus Teardown Stability** | Fixed 100ms timeout | **Watchdog-safe 500ms draining** with `delay(1)` / `yield()` for safe DMA/RMT memory release |
| **WebSockets & Networking** | Fixed protocol defaults | **Dynamic WSS/HTTPS auto-negotiation** with custom port detection (e.g. Wokwi `:8180`) |

---

## 🚀 Key Modules Deep Dive

### 🎛️ Glassmorphic Automation Engine

Built with a sleek, dark acrylic design aesthetic matching WLED's visual identity, the native Automation Engine runs 100% locally on the ESP32:

- **Edge-Triggered Evaluation:** Triggers respond strictly to true state transitions (`powerChanged`, `presetChanged`), eliminating redundant loop execution.
- **Solar & Astronomical Timers:** Real-time solar position matching (Sunrise, Sunset, Dawn, Dusk) with configurable minute offsets and debounce filtering.
- **Day-of-Week Scheduling:** Interactive Sun–Sat filter pills for weekly recurring events.
- **Compact LittleFS Storage:** Scaled 6KB JSON storage (`doc(6144)`) with lightweight state broadcasts to prevent network bloat.
- **Safety Guards:** Recursive loop depth limiters prevent runaway automation cascades.

Access the automation interface in your browser at:

```text
http://<your-device-ip>/automations
```

### 🎵 ESP-IDF V5 AudioReactive Driver

Specially tuned for the updated ESP-IDF V5 continuous ADC and I2S APIs:

- **Dynamic Heap DSP Buffers:** Replaced static 1024-byte task stack buffers with heap-managed memory, fully eliminating stack overflow crashes in the 3592-word FreeRTOS FFT task.
- **ADC1 Bounds & GPIO Safety:** Strict bounds validation (`channel < 0 || channel > 7`) prevents invalid pin allocation and phantom GPIO leaks on unconfigured hardware.
- **Partial Frame Smoothing:** Graceful sample decay filtering eliminates acoustic impulse clicks during partial DMA buffers or network jitter.

### 🔌 Harmonized Device Manager

- **Core I2C Arbitration:** Completely harmonized with core WLED I2C (`i2c_sda`, `i2c_scl`) without conflicting `PinOwner` collisions.
- **Runtime I2C Address Scanner:** Diagnostics endpoint exposed via `/json/info` to instantly detect connected sensors and displays.
- **Non-Blocking Mutexes:** FreeRTOS mutexes safely allocated inside `setup()` to protect concurrent I2C bus transactions.

---

## 💻 Simulation with Wokwi

You can run and debug WLED-SetGT directly in VS Code using the [Wokwi Simulator Extension](https://marketplace.visualstudio.com/items?itemName=Wokwi.wokwi-vscode):

### Select Layout Mode

```bash
# Single ESP32 board driving 900 LEDs
npm run sim:single

# Distributed multi-node simulation (ESP-NOW & mesh)
npm run sim:distributed
```

### Launch Simulation in VS Code

1. Open the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Type and select `Wokwi: Start Simulator`.
3. The virtual ESP32 will boot and automatically associate with the simulated `Wokwi-GUEST` access point.

### Access Web UI

- **Main Dashboard:** `http://localhost:8180`
- **Automation Engine:** `http://localhost:8180/automations`

### Monitor Live Packet Traffic

Open a separate terminal window and run:

```bash
python simulation/monitor_packets.py
```

This utility captures and prints live UDP broadcast, ESP-NOW, and DDP sync packets between simulated nodes.

---

## 📂 Project Directory Structure

```text
WLED-SetGT/
├── wled00/                       # Core WLED firmware (C++)
│   ├── data/                     # Web UI source (HTML/CSS/JS with tab indentation)
│   │   ├── automations.htm       # Native Glassmorphic Automation UI
│   │   ├── index.htm / index.js  # Main WLED web application
│   │   └── common.js             # Shared networking & WebSocket client
│   ├── cfg.cpp                   # Configuration & persistence engine
│   ├── bus_manager.cpp           # Hardware bus DMA/RMT output management
│   ├── FX_fcn.cpp                # 1D/2D animation pipeline & sparse ledmaps
│   ├── my_config.h               # Personal configuration overrides (Wokwi-GUEST)
│   └── wled_server.cpp           # HTTP/WebSocket REST server & static routing
├── usermods/                     # Active & community usermods
│   ├── automation_engine/        # Native rule evaluation & LittleFS storage
│   ├── audioreactive/            # ESP-IDF V5 continuous ADC/I2S audio DSP
│   ├── device_manager/           # Harmonized I2C bus & device scanner
│   ├── wled_espnow/              # Low-latency peer-to-peer ESP-NOW mesh
│   └── Internal_Temperature_v2/  # On-chip MCU die temperature telemetry
├── simulation/                   # Wokwi simulation & packet analysis suite
│   ├── diagram.json              # Active Wokwi wiring and components
│   ├── diagram_single.json       # Single-node configuration
│   ├── wokwi_distributed.json    # Multi-node distributed mesh layout
│   ├── monitor_packets.py        # Real-time packet sniffer
│   ├── parse_pcap.py             # Wireshark PCAP capture analyzer
│   └── sim_server.js             # Mock Express & WebSocket dev server
├── tools/                        # Node.js build pipeline & test suite
│   ├── cdata.js                  # HTML/JS minification & PROGMEM C-header compiler
│   └── cdata-test.js             # Automated web compression test suite
├── platformio.ini                # Multi-target build configurations
└── wokwi.toml                    # Wokwi simulator configuration
```

---

## 🛠️ Quick Start & Build Instructions

### Prerequisites

- **Node.js** >= 20.0.0
- **Python** >= 3.10
- **PlatformIO CLI** or **VS Code with PlatformIO IDE Extension**

### Clone & Install Dependencies

```bash
git clone https://github.com/SepTGut/WLED-SetGT.git
cd WLED-SetGT
npm ci
```

### Build Web UI Assets

Before compiling firmware, always compile and compress web UI assets into C++ headers:

```bash
npm run build
```

> *Tip: Run `npm run dev` to enable watch mode, automatically rebuilding headers when editing files in `wled00/data/`.*

### Run Automated Tests

```bash
npm test
```

*Validates HTML/JS minification, PROGMEM header generation, and asset integrity (16/16 tests passing).*

### Compile ESP32 Firmware

Compile using PlatformIO for your target environment:

```bash
# Standard ESP32 (Recommended default)
pio run -e esp32dev

# ESP32-S3 (8MB Octal PSRAM)
pio run -e esp32s3dev_8MB_opi

# ESP32-C3
pio run -e esp32c3dev
```

Compiled binaries and ELF files are automatically exported to `build_output/release/`:

- `WLED_17.0.0-devV5_ESP32.bin`
- `WLED_17.0.0-devV5_ESP32.elf`

---

## 📊 Memory & Performance Blueprint

Verified benchmarks on ESP32 (`esp32dev`, ESP-IDF V5.4 / Arduino 3.x with all 4 active usermods):

| Metric | Utilized | Total Available | Utilization | Status |
| :--- | :--- | :--- | :--- | :--- |
| **RAM (DRAM)** | 90,944 bytes | 327,680 bytes | **27.8%** | 🟢 Extremely healthy (236KB free headroom) |
| **Flash Memory** | 1,315,439 bytes | 1,572,864 bytes | **83.6%** | 🟢 Stable across OTA partitions |
| **FFT Task Stack** | Offloaded to heap | Dynamic DRAM | **Zero Stack Contention** | 🟢 Eliminates v5 stack overflow risks |
| **Automation LittleFS** | Max 6,144 bytes | Filesystem | **< 0.5% partition** | 🟢 Rapid non-blocking serialization |

---

## 🌐 Supported Protocols & Integrations

- **Smart Home:** Home Assistant (auto-discovery), MQTT, Alexa Emulation, Philips Hue emulation.
- **Pro Lighting & Staging:** E1.31 (sACN), Art-Net, DDP (Distributed Display Protocol), TPM2.net.
- **Wireless Mesh:** ESP-NOW peer-to-peer synchronization (no external Wi-Fi router required).
- **Direct Interfaces:** Full JSON API (`/json`), HTTP request API, WebSockets live streaming (`/ws`), Infrared (NEC).
- **Ambilight & PC Capture:** Adalight, TPM2 serial protocol, Hyperion, and LedFx compatible.

---

## ⚙️ Compatible Hardware & LED Drivers

- **Microcontrollers:** ESP32, ESP32-S2, ESP32-S3, ESP32-C3, ESP8266.
- **Digital LED Strips:** WS2812B, WS2811, WS2815, SK6812 (RGBW), WS2805, TM1914, APA102, WS2801, LPD8806, GS8208.
- **Matrices & Panels:** HUB75 RGB panels (ESP32 I2S parallel DMA), flexible 2D WS2812B matrices (custom panel maps supported).
- **Analog:** Single-channel PWM, CCT adjustable white, and 4/5-channel RGB/RGBW MOSFET drivers.

---

## 🤝 Contributing & AI Agent Policy

Contributions and improvements are welcome! Please review:

- [CONTRIBUTING.md](CONTRIBUTING.md) for pull request conventions and development etiquette.
- [AGENTS.md](AGENTS.md) for coding agent guidelines, C++ style constraints, and verification protocols.
- `docs/` directory for in-depth architecture, security hardening, and web development guidelines.

---

## ⚠️ Photosensitivity Warning & Disclaimer

> [!CAUTION]
> **Photosensitive Epilepsy Warning:** A small percentage of individuals may experience epileptic seizures when exposed to certain light patterns or flashing lights. If you experience dizziness, altered vision, eye or muscle twitches, loss of awareness, disorientation, or convulsions, **immediately discontinue use**.

*As per the EUPL v1.2 license, this software is provided "AS IS", without warranties of any kind. No liability is assumed for any damage to persons or equipment.*

---

## 📜 License & Credits

- **Firmware License:** [EUPL v1.2](https://raw.githubusercontent.com/wled-dev/WLED/main/LICENSE)
- **Original Project:** Created by [Christian Schwinne (Aircoookie)](https://github.com/Aircoookie) and maintained by the [WLED Community](https://kno.wled.ge/about/contributors/).
- **WLED-SetGT Distribution:** Maintained by [SepTGut](https://github.com/SepTGut).
