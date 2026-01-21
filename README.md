# Advanced Malware Protection Suite

**Enterprise-Grade Security Tools for Modern Threat Detection**

## 🛡️ Overview

This is a **CEH Educational Platform** featuring 3 advanced malware protection techniques used by enterprise EDR (Endpoint Detection & Response) solutions like CrowdStrike Falcon, SentinelOne, and Microsoft Defender ATP.

## 🎯 Features

### 1. 🦅 Crypto-Canary Ransomware Shield
**Bait File Defense System**

- Deploys hidden "canary" files across critical directories
- Instantly terminates ransomware processes attempting to encrypt bait files
- Protects real data before encryption can occur
- **CEH Principle P2**: Speed vs False Positives trade-off

**Configuration:**
- Low: 10 canary files
- Medium: 25 canary files (recommended)
- High: 50 canary files

**Real-time Monitoring:**
- Process monitoring with <100ms response time
- Automatic threat termination
- Activity logging with timestamps

---

### 2. 🧠 Fileless Malware Hunter
**Memory-Based Threat Detection**

- Monitors RAM usage patterns and PowerShell execution logs
- Detects malicious scripts running in memory (no disk footprint)
- Defends against Advanced Persistent Threats (APTs)
- **CEH Principle P3**: Heuristic Analysis & Behavioral Detection

**Detection Methods:**
- RAM allocation anomaly detection
- PowerShell script analysis (Invoke-Mimikatz, Cobalt Strike, etc.)
- Memory injection pattern recognition
- Reflective DLL loading detection

**Configuration:**
- RAM Threshold: 50MB / 100MB / 200MB
- Log Depth: Basic / Detailed / Forensic

---

### 3. 🔌 USB Condom - Device Protection
**USB Threat Prevention System**

- Forces "Read-Only" mode on all new USB devices
- Requires scanning before granting full access
- Prevents BadUSB, Stuxnet-style attacks, and autorun malware
- **CEH Principle P2**: Usability vs Security balance

**Protection Modes:**
- **Blocked**: No access until scanned
- **Read-Only**: Safe viewing only (recommended)
- **Prompt**: User decision required

**Scan Depths:**
- Quick: Surface scan (30 seconds)
- Standard: Full scan (2 minutes)
- Deep: Forensic analysis (5 minutes)

---

## 📚 CEH Learning Objectives

### Principle 2 (P2): Security Trade-offs
- **Speed vs Accuracy**: Ransomware shield must kill threats in <100ms without false positives
- **Usability vs Security**: USB protection delays access for verification
- Real-time response requirements in production environments

### Principle 3 (P3): Heuristic Analysis
- Behavioral pattern analysis beyond signature matching
- Memory-based threat detection without file scanning
- Machine learning anomaly detection
- Zero-day threat identification

---

## 🚀 Quick Start

### Installation
1. Clone or download this repository
2. Open `index.html` in a modern web browser (Chrome, Firefox, Edge)
3. No backend required - fully client-side simulation

### Usage
1. **Crypto-Canary Shield**
   - Select sensitivity level
   - Click "Activate Shield"
   - Monitor real-time threat detection logs

2. **Fileless Hunter**
   - Configure RAM threshold and log depth
   - Click "Start Hunter"
   - Watch memory analysis results

3. **USB Condom**
   - Set default mode and scan depth
   - Click "Enable USB Protection"
   - Use "Simulate USB Insert" to test detection

---

## 🎓 Educational Value

This platform demonstrates:
- ✅ Modern EDR techniques used by Fortune 500 companies
- ✅ Behavioral analysis vs traditional signature scanning
- ✅ Security engineering trade-offs (speed, accuracy, usability)
- ✅ Advanced persistent threat (APT) defense mechanisms
- ✅ Zero-day exploit mitigation strategies

**Real-World Applications:**
- Enterprise endpoint protection
- Incident response workflows
- Security operations center (SOC) monitoring
- Penetration testing and red team exercises

---

## 📁 Project Structure

```
Computer-Security/
├── index.html                  # Main application (all 3 features)
├── README.md                   # This file
├── shared/
│   ├── css/
│   │   ├── style.css          # Black theme styling
│   │   └── nav-styles.css     # Navigation styles
│   └── js/
│       └── api-client.js      # Utility functions
└── features/
    └── antivirus/
        └── antivirus.html     # Alternative standalone page
```

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Framework**: Bootstrap 5.3
- **Icons**: Font Awesome 6.4
- **Theme**: Custom dark theme with black backgrounds
- **Deployment**: Static HTML (no server required)

---

## 🎨 Theme

**Black Professional Theme:**
- Background: Pure black (#000000)
- Cards: Dark (#0a0a0a, #0f0f0f)
- Accents: Purple (#6366f1), Cyan (#22d3ee)
- Text: Light gray (#f8fafc, #cbd5e1)

---

## 🔒 Security Features

All simulations are **client-side only** for educational purposes:
- No actual system modification
- No real malware detection
- No file system access
- Safe for demonstration and learning

---

## 📖 References

**Techniques Demonstrated:**
- Canary tokens (ransomware detection)
- Behavioral analysis (fileless malware)
- Device control policies (USB protection)
- Heuristic threat detection
- Memory forensics

**Industry Standards:**
- MITRE ATT&CK Framework
- NIST Cybersecurity Framework
- CEH (Certified Ethical Hacker) curriculum
- SANS security best practices

---

## 👥 Use Cases

- **Students**: Learn enterprise security techniques
- **Educators**: Demonstrate advanced malware protection
- **Security Professionals**: Explain EDR concepts to stakeholders
- **Researchers**: Study security trade-off principles

---

## 📝 License

Educational use only. Not for production deployment.

---

## 🤝 Contributing

This is an educational project. Feedback and improvements welcome!

---

## ⚡ Performance

- Lightweight: <200KB total size
- Fast: Loads in <1 second
- Responsive: Works on mobile and desktop
- No dependencies: Self-contained HTML/CSS/JS

---

## 🎯 Future Enhancements (Conceptual)

- Network traffic analysis simulation
- Process tree visualization
- Threat intelligence feed integration
- Machine learning model demonstrations
- Sandbox execution environment

---

**Built for learning. Designed for understanding. Engineered for education.**

© 2026 Security Operations Center - Advanced Malware Protection Suite
