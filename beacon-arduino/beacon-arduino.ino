#define MAX_LEVEL 10
#define MIN_LEVEL 0
#define MAX_PIN 11
#define MIN_PIN 2

long currBars = 0;

void setup() {
  for(int i=MIN_PIN; i<=MAX_PIN; i++) {
    pinMode(i, OUTPUT);
  }
  
  // Open serial communications and wait for ports 1 & 2 to open
  Serial.begin(9600);
  while(!Serial) {
    Serial.println("USB disconnected!"); // wait for Serial1 port to connect
  }

  Serial.println("Serial Port Connected");
}

void loop() {
  // put your main code here, to run repeatedly
  if(Serial.available() > 0) {
    // Read the incoming byte
    long newBars = Serial.parseInt();

    // Do not accept invalid rewards balance
    if(newBars < MIN_LEVEL || newBars > MAX_LEVEL) {
      Serial.println("Invalid newBars");
      return;
    }

    if(newBars > currBars) {
      for(int i=currBars+MIN_PIN; i<=newBars+1; i++) {
        // turn on LEDs
        digitalWrite(i, HIGH);
        delay(500);
      }
    }
    else if(newBars < currBars) { 
      for(int i=currBars+1; i>newBars+1; i--) {
        // turn off LEDs
        digitalWrite(i, LOW);
        delay(500);
      }
    }
    else {
      return;
    }

    currBars = newBars;
    
    // Reached goal
    if(newBars==MAX_LEVEL) {
      Serial.println("CONGRATULATIONS MUTHAFUKA!");
      
      // blink 3 times in celebration
      for(int i=0; i<3; i++) {
        for(int j=MIN_PIN; j<=MAX_PIN; j++) {
          digitalWrite(j, LOW);
        }
        delay(750);
        for(int j=MIN_PIN; j<=MAX_PIN; j++) {
          digitalWrite(j, HIGH);
        }
        delay(750);
      }
    }

  }
 
}
