# Automation Engine Usermod for WLED

The **Automation Engine Usermod** introduces a flexible event-driven **Triggers -> Actions** rule system to WLED devices.

## Features

- **Triggers**:
  - **Time / Schedule**: Trigger at specific hours and minutes (HH:MM) with day-of-week filtering.
  - **Sunrise / Sunset**: Trigger relative to solar events (with offset in minutes).
  - **WLED State / Preset**: Trigger on Power ON/OFF or when switching to a specific Preset ID.
  - **MQTT Message**: Trigger when a message is received on a configured MQTT topic.

- **Actions**:
  - **Apply Preset**: Automatically load a preset ID.
  - **Power / Relay Toggle**: Turn master power ON/OFF or toggle relay.
  - **Execute API Command**: Run any native WLED JSON API command payload.

- **Storage & Management**:
  - Stored persistently in `/automations.json` on flash storage.
  - Managed via REST API `/json/automations` and custom Web UI page (`automations.htm`).

## Enabling the Usermod

Add the following to your build flags or `platformio_override.ini`:

```ini
build_flags =
  -D USERMOD_AUTOMATION_ENGINE
```
