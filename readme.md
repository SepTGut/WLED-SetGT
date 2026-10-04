<p align="center">
  <img src="images/wled_logo_akemi.png" alt="WLED Logo" width="180">
  <br>
  <strong>Next-Generation Lighting Firmware with Native Automation Engine & Real-Time ESP-IDF V5 Audio DSP</strong>
  <br><br>
  <a href="https://github.com/SepTGut/WLED-SetGT/releases"><img src="https://img.shields.io/badge/version-17.0.0--devV5-blue?style=flat-square" alt="Version 17.0.0-devV5"></a>
  <a href="https://github.com/tasmota/platform-espressif32"><img src="https://img.shields.io/badge/platform-ESP--IDF%20V5%20%2F%20Arduino%203.x-emerald?style=flat-square" alt="ESP-IDF V5"></a>
  <a href="https://wokwi.com"><img src="https://img.shields.io/badge/simulation-Wokwi%20Ready-orange?style=flat-square" alt="Wokwi Simulation Ready"></a>
  <a href="#automated-testing--ci"><img src="https://img.shields.io/badge/tests-16%2F16%20passed-brightgreen?style=flat-square" alt="Tests 16/16 Passed"></a>
  <a href="https://raw.githubusercontent.com/SepTGut/WLED-SetGT/main/LICENSE"><img src="https://img.shields.io/badge/license-EUPL%201.2-blue?style=flat-square" alt="EUPL v1.2"></a>
  <a href="https://discord.gg/QAh7wJHrRM"><img src="https://img.shields.io/discord/473448917040758787.svg?colorB=5865F2&label=discord&style=flat-square" alt="Discord"></a>
  <a href="https://kno.wled.ge"><img src="https://img.shields.io/badge/docs-kno.wled.ge-blueviolet?style=flat-square" alt="Documentation"></a>
</p>

---

## 🌟 Overview

**WLED-SetGT** is an advanced, high-performance distribution of [WLED](https://github.com/wled/WLED) engineered for modern ESP32 hardware using the **ESP-IDF V5.x** framework. It combines the legendary LED control capabilities of WLED with an offline **Glassmorphic Automation Engine**, ultra-low-jitter **AudioReactive DSP**, harmonized **I2C Device Management**, and a pre-configured **Wokwi simulation suite** for zero-hardware local development.

Whether driving individual addressable LED strips, expansive 2D matrix arrays, or synchronized multi-node fixtures, WLED-SetGT delivers rock-solid stability and modern tooling.

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

## 🚀 Key Modules & Architecture

### 1. 🎛️ Glassmorphic Automation Engine (`/automations`)
Built with a sleek, dark acrylic design aesthetic matching WLED's visual identity, the native Automation Engine runs 100% locally on the ESP32:
* **Edge-Triggered Evaluation:** Triggers respond strictly to true state transitions (`powerChanged`, `presetChanged`), eliminating redundant loop execution.
* **Solar & Astronomical Timers:** Real-time solar position matching (Sunrise, Sunset, Dawn, Dusk) with configurable minute offsets and debounce filtering.
* **Day-of-Week Scheduling:** Interactive Sun–Sat filter pills for weekly recurring events.
* **Compact LittleFS Storage:** Scaled 6KB JSON storage (`doc(6144)`) with lightweight state broadcasts to prevent network bloat.
* **Safety Guards:** Recursive loop depth limiters prevent runaway automation cascades.

Access the automation interface in your browser at:
```text
http://<your-device-ip>/automations
```

### 2. 🎵 ESP-IDF V5 AudioReactive Driver
Specially tuned for the updated ESP-IDF V5 continuous ADC and I2S APIs:
* **Dynamic Heap DSP Buffers:** Replaced static 1024-byte task stack buffers with heap-managed memory, fully eliminating stack overflow crashes in the 3592-word FreeRTOS FFT task.
* **ADC1 Bounds & GPIO Safety:** Strict bounds validation (`channel < 0 || channel > 7`) prevents invalid pin allocation and phantom GPIO leaks on unconfigured hardware.
* **Partial Frame Smoothing:** Graceful sample decay filtering eliminates acoustic impulse clicks during partial DMA buffers or network jitter.

### 3. 🔌 Harmonized Device Manager (`device_manager`)
* **Core I2C Arbitration:** Completely harmonized with core WLED I2C (`i2c_sda`, `i2c_scl`) without conflicting `PinOwner` collisions.
* **Runtime I2C Address Scanner:** Diagnostics endpoint exposed via `/json/info` to instantly detect connected sensors and displays.
* **Non-Blocking Mutexes:** FreeRTOS mutexes safely allocated inside `setup()` to protect concurrent I2C bus transactions.

### 4. 🧪 Full Wokwi Simulation Suite
Test firmware logic, effects, and network communications locally without touching physical hardware:
* **Pre-wired Diagrams:** Single-board (`diagram_single.json`) and distributed multi-node mesh (`wokwi_distributed.json`).
* **Virtual Wi-Fi Gateway:** Direct network forwarding from `http://localhost:8180` to target port `80`.
* **Traffic Inspection:** Included Python utilities (`simulation/monitor_packets.py` & `simulation/parse_pcap.py`) for real-time ESP-NOW and DDP packet analysis.

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
│   └── wled_server.cpp           # HTTP/WebSocket REST server & static routing
├── usermods/                     # Active & community usermods
│   ├── automation_engine/        # Native rule evaluation & LittleFS storage
│   ├── audioreactive/            # ESP-IDF V5 continuous ADC/I2S audio DSP
│   ├── device_manager/           # Harmonized I2C bus & device scanner
│   ├── wled_espnow/              # Low-latency peer-to-peer ESP-NOW mesh
│   └── Internal_Temperature_v2/  # On-chip MCU die temperature telemetry
├── simulation/                   # Wokwi simulation & packet analysis suite
│   ├── diagram.json              # Active Wokwi wiring and components
│   ├── monitor_packets.py        # Real-time packet sniffer
│   └── parse_pcap.py             # Wireshark PCAP capture analyzer
├── tools/                        # Node.js build pipeline & test suite
│   ├── cdata.js                  # HTML/JS minification & PROGMEM C-header compiler
│   └── cdata-test.js             # Automated web compression test suite
├── platformio.ini                # Multi-target build configurations
└── wokwi.toml                    # Wokwi simulator configuration
```

---

## 🛠️ Quick Start & Build Instructions

### Prerequisites
* **Node.js** >= 20.0.0
* **Python** >= 3.10
* **PlatformIO CLI** or **VS Code with PlatformIO IDE Extension**

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/SepTGut/WLED-SetGT.git
cd WLED-SetGT
npm ci
```

### 2. Build the Web UI Assets
Before compiling firmware, always compile and compress web UI assets into C++ headers:
```bash
npm run build
```
> *Tip: Run `npm run dev` to enable watch mode, automatically rebuilding headers when editing files in `wled00/data/`.*

### 3. Run Automated Tests
```bash
npm test
```
*Validates HTML/JS minification, PROGMEM header generation, and asset integrity (16/16 tests passing).*

### 4. Compile ESP32 Firmware
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
* `WLED_17.0.0-devV5_ESP32.bin`
* `WLED_17.0.0-devV5_ESP32.elf`

---

## 💻 Simulation with Wokwi

You can run and debug WLED-SetGT directly in VS Code using the [Wokwi Simulator Extension](https://marketplace.visualstudio.com/items?itemName=Wokwi.wokwi-vscode):

1. **Select Layout Mode:**
   ```bash
   # Single ESP32 board simulation
   npm run sim:single

   # Distributed multi-node simulation (ESP-NOW & mesh)
   npm run sim:distributed
   ```
2. **Launch Simulation:**
   * Open the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
   * Select `Wokwi: Start Simulator`.
3. **Access Web UI:**
   * Open `http://localhost:8180` in your web browser.
   * Access Automations at `http://localhost:8180/automations`.
4. **Monitor Network Traffic:**
   ```bash
   python simulation/monitor_packets.py
   ```

---

## 🌐 Supported Protocols & Integrations

* **Smart Home:** Home Assistant (auto-discovery), MQTT, Alexa Emulation, Philips Hue emulation.
* **Pro Lighting & Staging:** E1.31 (sACN), Art-Net, DDP (Distributed Display Protocol), TPM2.net.
* **Wireless Mesh:** ESP-NOW peer-to-peer synchronization (no external Wi-Fi router required).
* **Direct Interfaces:** Full JSON API (`/json`), HTTP request API, WebSockets live streaming (`/ws`), Infrared (NEC).
* **Ambilight & PC Capture:** Adalight, TPM2 serial protocol, Hyperion, and LedFx compatible.

---

## ⚙️ Compatible Hardware & LED Drivers

* **Microcontrollers:** ESP32, ESP32-S2, ESP32-S3, ESP32-C3, ESP8266.
* **Digital LED Strips:** WS2812B, WS2811, WS2815, SK6812 (RGBW), WS2805, TM1914, APA102, WS2801, LPD8806, GS8208.
* **Matrices & Panels:** HUB75 RGB panels (ESP32 I2S parallel DMA), flexible 2D WS2812B matrices (custom panel maps supported).
* **Analog:** Single-channel PWM, CCT adjustable white, and 4/5-channel RGB/RGBW MOSFET drivers.

---

## 🤝 Contributing & AI Agent Policy

Contributions and improvements are welcome! Please review:
* [CONTRIBUTING.md](CONTRIBUTING.md) for pull request conventions and development etiquette.
* [AGENTS.md](AGENTS.md) for coding agent guidelines, C++ style constraints, and verification protocols.
* `docs/` directory for in-depth architecture, security hardening, and web development guidelines.

---

## ⚠️ Photosensitivity Warning & Disclaimer

> [!CAUTION]
> **Photosensitive Epilepsy Warning:** A small percentage of individuals may experience epileptic seizures when exposed to certain light patterns or flashing lights. If you experience dizziness, altered vision, eye or muscle twitches, loss of awareness, disorientation, or convulsions, **immediately discontinue use**.

*As per the EUPL v1.2 license, this software is provided "AS IS", without warranties of any kind. No liability is assumed for any damage to persons or equipment.*

---

## 📜 License & Credits

* **Firmware License:** [EUPL v1.2](https://raw.githubusercontent.com/wled-dev/WLED/main/LICENSE)
* **Original Project:** Created by [Christian Schwinne (Aircoookie)](https://github.com/Aircoookie) and maintained by the [WLED Community](https://kno.wled.ge/about/contributors/).
* **WLED-SetGT Distribution:** Maintained by [SepTGut](https://github.com/SepTGut).
