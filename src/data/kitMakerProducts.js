export const kitMakerProducts = Array.from({ length: 5 }, (_, index) => ({
  id: `esp32-${index + 1}`,
  name: 'ESP32 Udviklingsboard',
  fullName: 'ESP32 DEV KIT DOIT Udviklingsboard',
  subtitle: 'CH340C',
  category: 'Microcontrollers',
  price: 70,
  link: 'https://ebits.dk',
  details: [
    'Dual-core 32-bit Xtensa LX6 processor',
    'Integrated 2.4 GHz WiFi and Bluetooth (BLE + Classic)',
    'USB Type-C interface',
    'Programmable onboard LED on GPIO2 (D2)',
    'Supports UART, SPI, I2C, PWM, ADC, and DAC',
    'Low-power operation',
    'Suitable for IoT and embedded applications',
  ],
}))
