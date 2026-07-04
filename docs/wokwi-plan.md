# Wokwi Simulation Plan — Smart Office (One Room)

> Simulates one representative room: **2 fans + 3 lights** on an ESP32,
> with current sensing and manual override — matching the real hardware concept.

---

## 1. Open Wokwi

1. Go to [wokwi.com](https://wokwi.com)
2. Click **"New Project"**
3. Select **"ESP32"**

---

## 2. Components to Add

Click **"+"** in Wokwi and search for each component:

| # | Component | Qty | Notes |
|---|-----------|-----|-------|
| 1 | **ESP32 DevKit V1** | 1 | Already there by default |
| 2 | **Relay Module (SPDT)** | 5 | One per device (2 fans + 3 lights) |
| 3 | **LED** (Red) | 3 | Represent 3 lights |
| 4 | **LED** (Blue or Green) | 2 | Represent 2 fans |
| 5 | **Resistor 220Ω** | 5 | One per LED |
| 6 | **ACS712 Current Sensor** | 1 | Senses power on one circuit leg |
| 7 | **Push Button** | 1 | Manual device toggle |
| 8 | **Resistor 10kΩ** | 1 | Pull-up for button |

---

## 3. Pin Mapping Table

| ESP32 GPIO | Connected To | Purpose |
|------------|-------------|---------|
| **GPIO 14** | Relay 1 IN | Fan 1 control |
| **GPIO 27** | Relay 2 IN | Fan 2 control |
| **GPIO 26** | Relay 3 IN | Light 1 control |
| **GPIO 25** | Relay 4 IN | Light 2 control |
| **GPIO 33** | Relay 5 IN | Light 3 control |
| **GPIO 34** | ACS712 OUT | Analog current reading (ADC input) |
| **GPIO 0**  | Push Button | Manual toggle (Fan 1) |
| **3.3V**    | Relay VCC, ACS712 VCC, Button pull-up | Power rail |
| **GND**     | All GND pins | Common ground |

---

## 4. Wiring Connections

### Relay modules (×5, same pattern for each)

```
ESP32 GPIO XX  ──→  Relay IN
ESP32 3.3V     ──→  Relay VCC
ESP32 GND      ──→  Relay GND
Relay COM      ──→  3.3V (supply rail)
Relay NO       ──→  LED Anode  (+)
LED Cathode    ──→  220Ω resistor  ──→  GND
```

> Relays are **active LOW** — GPIO LOW = relay closes = LED ON.

### ACS712 current sensor

```
3.3V   ──→  ACS712 VCC
GND    ──→  ACS712 GND
GPIO34 ──→  ACS712 OUT   (analog voltage output)
```

Place ACS712 between the 3.3V supply and one of the relay COM pins (Fan 1)
to measure its current draw.

### Push button (manual toggle)

```
GPIO0  ──→  Button Pin 1
GND    ──→  Button Pin 2
(10kΩ pull-up between GPIO0 and 3.3V)
```

---

## 5. Complete ESP32 Sketch (`sketch.ino`)

Paste this into the Wokwi code editor:

```cpp
// Smart Office — One Room Simulation
// Devices: Fan1(14), Fan2(27), Light1(26), Light2(25), Light3(33)
// Current sensor: GPIO34 | Manual button: GPIO0

const int RELAY_PINS[]  = {14, 27, 26, 25, 33};
const int DEVICE_COUNT  = 5;
const int BUTTON_PIN    = 0;
const int CURRENT_PIN   = 34;

// Labels matching the backend names
const char* DEVICE_NAMES[] = {
  "Fan 1", "Fan 2", "Light 1", "Light 2", "Light 3"
};

// Simulated wattage per device (matches backend constants)
const int DEVICE_WATTS[] = {60, 60, 15, 15, 15};

bool deviceState[DEVICE_COUNT] = {false, false, false, false, false};
bool lastButtonState = HIGH;

void setup() {
  Serial.begin(115200);
  Serial.println("=== Smart Office Room Simulator ===");

  for (int i = 0; i < DEVICE_COUNT; i++) {
    pinMode(RELAY_PINS[i], OUTPUT);
    digitalWrite(RELAY_PINS[i], HIGH); // relays off initially (active LOW)
  }

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  printStatus();
}

void loop() {
  handleButtonPress();
  readCurrentSensor();
  simulateAutoToggle();
  delay(1000);
}

// Toggle Fan 1 on button press
void handleButtonPress() {
  bool currentButtonState = digitalRead(BUTTON_PIN);
  if (lastButtonState == HIGH && currentButtonState == LOW) {
    toggleDevice(0); // Fan 1
    Serial.println("[BUTTON] Manual toggle — Fan 1");
  }
  lastButtonState = currentButtonState;
}

// Read ACS712 and estimate power on Fan 1 circuit
void readCurrentSensor() {
  int raw = analogRead(CURRENT_PIN);
  float voltage   = raw * (3.3f / 4095.0f);
  float current   = (voltage - 1.65f) / 0.066f; // ACS712-5A: 66 mV/A
  float power     = fabsf(current) * 230.0f;     // Assume 230 V mains

  Serial.print("[ACS712] Raw=");
  Serial.print(raw);
  Serial.print("  Current=");
  Serial.print(current, 3);
  Serial.print(" A  Power≈");
  Serial.print(power, 1);
  Serial.println(" W");
}

// Randomly auto-toggle one device every ~10 s to mimic the backend simulator
void simulateAutoToggle() {
  static unsigned long lastToggle = 0;
  if (millis() - lastToggle > 10000) {
    lastToggle = millis();
    int idx = random(0, DEVICE_COUNT);
    toggleDevice(idx);
    Serial.print("[AUTO] Toggled ");
    Serial.println(DEVICE_NAMES[idx]);
  }
}

void toggleDevice(int idx) {
  deviceState[idx] = !deviceState[idx];
  // Active LOW: LOW = relay closed = LED ON
  digitalWrite(RELAY_PINS[idx], deviceState[idx] ? LOW : HIGH);
  printStatus();
}

void printStatus() {
  Serial.println("--- Room Status ---");
  int totalWatts = 0;
  for (int i = 0; i < DEVICE_COUNT; i++) {
    int watts = deviceState[i] ? DEVICE_WATTS[i] : 0;
    totalWatts += watts;
    Serial.print("  ");
    Serial.print(DEVICE_NAMES[i]);
    Serial.print(": ");
    Serial.print(deviceState[i] ? "ON " : "OFF");
    Serial.print("  (");
    Serial.print(watts);
    Serial.println(" W)");
  }
  Serial.print("  Total draw: ");
  Serial.print(totalWatts);
  Serial.println(" W");
  Serial.println("-------------------");
}
```

---

## 6. What to Demonstrate in the Video

| Action | How to do it in Wokwi | What the evaluator sees |
|--------|----------------------|-------------------------|
| Turn devices ON/OFF | Click relay coil or press button | LEDs light up / go dark |
| Current reading | Watch Serial Monitor | ACS712 prints current + wattage |
| Auto-simulation | Wait 10 s | Devices toggle automatically like the backend simulator |
| Full room ON alert | Toggle all 5 devices ON | Serial prints 165 W total — matches backend max per room |
| Manual override | Press the push button | Fan 1 toggles instantly |

---

## 7. Screenshot Checklist

Take these screenshots for the `docs/diagrams/` folder:

- [ ] Full circuit view (all components wired) → `wokwi-schematic.png`
- [ ] Serial Monitor showing `ON/OFF` status + wattage
- [ ] Serial Monitor showing ACS712 current reading
- [ ] Share link from Wokwi (top-right **Share** button) → paste into README

---

## 8. Save the Share Link

After building:

1. Click **Share** (top right in Wokwi)
2. Copy the URL (e.g. `https://wokwi.com/projects/468603867658047489`)
3. Add it to the README under the **Diagrams** section:

```md
- [Wokwi Simulation](https://wokwi.com/projects/468603867658047489) — ESP32 circuit for one room (2 fans + 3 lights + ACS712 current sensor)
```

---

## 9. Electrical Reasoning (for evaluators)

| Design choice | Reason |
|---|---|
| **Relay modules** instead of direct GPIO switching | Lights and fans run on mains voltage (230 V AC); GPIO can only safely drive 3.3 V — relays isolate the two circuits |
| **Active LOW relays** | Standard relay module logic: IN=LOW closes the NO contact; avoids accidental activation on boot |
| **ACS712 current sensor** | Non-invasive Hall-effect sensor; reads AC/DC current without breaking the circuit; analog output is ADC-compatible with ESP32 |
| **10 kΩ pull-up on button** | Prevents floating GPIO; ensures stable HIGH reading when button is not pressed |
| **220 Ω LED resistors** | Limits current to ~10 mA at 3.3 V, within ESP32 safe output range |
