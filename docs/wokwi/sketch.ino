// ============================================================
//  Smart Office — One Room Simulation
//  Wokwi ESP32 project  |  docs/wokwi/sketch.ino
// ============================================================
//  Devices simulated (matching backend constants):
//    Fan 1   → GPIO 14  (blue LED)      60 W
//    Fan 2   → GPIO 27  (blue LED)      60 W
//    Light 1 → GPIO 26  (yellow LED)    15 W
//    Light 2 → GPIO 25  (yellow LED)    15 W
//    Light 3 → GPIO 33  (yellow LED)    15 W
//
//  Sensors:
//    ACS712 current sensor → potentiometer on GPIO 34
//
//  Controls:
//    Manual toggle (Fan 1) → push button on GPIO 0
// ============================================================

#define FAN1_PIN    14
#define FAN2_PIN    27
#define LIGHT1_PIN  26
#define LIGHT2_PIN  25
#define LIGHT3_PIN  33
#define SENSOR_PIN  34
#define BTN_PIN      0

const char* NAMES[] = { "Fan 1  ", "Fan 2  ", "Light 1", "Light 2", "Light 3" };
const int   PINS[]  = { FAN1_PIN, FAN2_PIN, LIGHT1_PIN, LIGHT2_PIN, LIGHT3_PIN };
const int   WATTS[] = { 60, 60, 15, 15, 15 };
const int   N       = 5;

bool  devState[5]     = { false, false, false, false, false };
bool  lastBtn         = HIGH;
ulong lastAutoToggle  = 0;
ulong lastStatusPrint = 0;

// ─────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(200);

  for (int i = 0; i < N; i++) {
    pinMode(PINS[i], OUTPUT);
    digitalWrite(PINS[i], LOW);
  }
  pinMode(BTN_PIN, INPUT_PULLUP);

  Serial.println(F("╔══════════════════════════════════╗"));
  Serial.println(F("║  Smart Office — Room Simulator   ║"));
  Serial.println(F("╚══════════════════════════════════╝"));
  Serial.println(F("GPIO map: Fan1=14 Fan2=27 L1=26 L2=25 L3=33"));
  Serial.println(F("Turn the potentiometer to change simulated current."));
  Serial.println(F("Press green button (GPIO 0) to manually toggle Fan 1."));
  Serial.println();
  printStatus();
}

// ─────────────────────────────────────────────
void loop() {
  handleButton();

  // Auto-simulate random toggle every 8 seconds (mimics backend DeviceSimulator)
  if (millis() - lastAutoToggle > 8000UL) {
    lastAutoToggle = millis();
    int idx = random(0, N);
    toggleDevice(idx);
    Serial.print(F("[AUTO]  Simulated toggle → "));
    Serial.println(NAMES[idx]);
    printStatus();
  }

  // Print power reading every 3 seconds
  if (millis() - lastStatusPrint > 3000UL) {
    lastStatusPrint = millis();
    readCurrentSensor();
  }
}

// ─────────────────────────────────────────────
void handleButton() {
  bool btn = digitalRead(BTN_PIN);
  if (lastBtn == HIGH && btn == LOW) {   // falling edge = press
    toggleDevice(0);                     // toggle Fan 1
    Serial.println(F("[BTN]   Manual toggle → Fan 1"));
    printStatus();
    delay(50);                           // debounce
  }
  lastBtn = btn;
}

// ─────────────────────────────────────────────
void toggleDevice(int idx) {
  devState[idx] = !devState[idx];
  digitalWrite(PINS[idx], devState[idx] ? HIGH : LOW);
}

// ─────────────────────────────────────────────
void readCurrentSensor() {
  // Potentiometer (0-3.3 V) simulates ACS712-5A output
  // ACS712-5A: 0 A = 1.65 V, sensitivity = 66 mV/A
  int   raw     = analogRead(SENSOR_PIN);       // 0 – 4095
  float voltage = raw * (3.3f / 4095.0f);
  float current = (voltage - 1.65f) / 0.066f;  // amperes
  float power   = fabsf(current) * 230.0f;      // watts (230 V mains)

  Serial.print(F("[ACS712] raw="));
  Serial.print(raw);
  Serial.print(F("  V="));
  Serial.print(voltage, 3);
  Serial.print(F("  I="));
  Serial.print(current, 3);
  Serial.print(F(" A  P≈"));
  Serial.print(power, 1);
  Serial.println(F(" W  (Fan 1 circuit)"));
}

// ─────────────────────────────────────────────
void printStatus() {
  int total = 0;
  Serial.println(F("┌─────────────────────────────┐"));
  for (int i = 0; i < N; i++) {
    int w = devState[i] ? WATTS[i] : 0;
    total += w;
    Serial.print(F("│  "));
    Serial.print(NAMES[i]);
    Serial.print(F("  "));
    Serial.print(devState[i] ? F("ON ") : F("OFF"));
    Serial.print(F("  ("));
    Serial.print(w);
    Serial.println(F(" W)           │"));
  }
  Serial.println(F("├─────────────────────────────┤"));
  Serial.print(F("│  Total       "));
  Serial.print(total);
  Serial.print(F(" W / 165 W max"));
  if (total >= 140) Serial.print(F("  ⚠"));   // ~85% threshold
  Serial.println(F(" │"));
  Serial.println(F("└─────────────────────────────┘"));
  Serial.println();
}
