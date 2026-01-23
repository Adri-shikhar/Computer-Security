/**
 * Live Demo Simulation Service
 * Generates realistic mock data and simulates backend activity
 * Uses Faker.js for varied, randomized data generation
 */

// Initialize Faker (from CDN)
const { faker } = window;

// ==================== MOCK DATA GENERATOR ====================

class LiveDemoService {
    constructor() {
        this.mockUsers = [];
        this.activityLog = [];
        this.simulationActive = false;
        this.backgroundInterval = null;
        this.lastUpdate = null;
        this.stats = {
            totalRequests: 0,
            activeSessions: 0,
            securityEvents: 0,
            breaches: 0
        };
    }

    /**
     * Generate 30 unique, realistic user records with varied data
     */
    generateMockUsers(count = 30) {
        console.log(`🔄 Generating ${count} unique mock users...`);
        this.mockUsers = [];
        
        // Security score ranges for variety
        const scoreRanges = [
            { min: 80, max: 100, breach: 'SECURE', count: 0 },
            { min: 50, max: 79, breach: 'MODERATE', count: 0 },
            { min: 20, max: 49, breach: 'WEAK', count: 30 },
            { min: 0, max: 19, breach: 'BREACHED', count: 0 }
        ];

        const algorithms = ['Argon2id', 'SHA-256', 'SHA-512', 'bcrypt'];
        const emailDomains = ['example.com', 'demo.co', 'testmail.io', 'secure.net', 'company.org'];
        
        let userId = 1;
        
        scoreRanges.forEach(range => {
            for (let i = 0; i < range.count; i++) {
                const firstName = faker.person.firstName();
                const lastName = faker.person.lastName();
                const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${faker.helpers.arrayElement(emailDomains)}`;
                const securityScore = faker.number.int({ min: range.min, max: range.max });
                const algorithm = faker.helpers.arrayElement(algorithms);
                
                // Generate realistic password hash (simulated)
                const salt = this.generateSalt(16);
                const passwordHash = this.generateHash(algorithm);
                
                // Create timestamp with variety (last 30 days)
                const createdAt = faker.date.recent({ days: 30 });
                const hasResalt = faker.datatype.boolean(0.3); // 30% have been resalted
                
                const user = {
                    id: userId++,
                    name: `${firstName} ${lastName}`,
                    email: email,
                    algorithm: algorithm,
                    salt: salt,
                    passwordHash: passwordHash,
                    fullHash: passwordHash + this.generateHash('extended'),
                    securityScore: securityScore,
                    breachStatus: range.breach,
                    resaltCount: hasResalt ? faker.number.int({ min: 1, max: 5 }) : 0,
                    lastResalt: hasResalt ? faker.date.recent({ days: 7 }).toISOString() : null,
                    createdAt: createdAt.toISOString(),
                    lastLogin: faker.date.between({ from: createdAt, to: new Date() }).toISOString(),
                    ipAddress: faker.internet.ipv4(),
                    userAgent: faker.internet.userAgent(),
                    location: `${faker.location.city()}, ${faker.location.country()}`
                };
                
                this.mockUsers.push(user);
            }
        });

        // Sort by creation date (newest first)
        this.mockUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        this.lastUpdate = new Date();
        console.log(`✅ Generated ${this.mockUsers.length} mock users`);
        
        return this.mockUsers;
    }

    /**
     * Generate realistic salt (hex string)
     */
    generateSalt(length = 16) {
        const chars = '0123456789abcdef';
        let salt = '';
        for (let i = 0; i < length * 2; i++) {
            salt += chars[Math.floor(Math.random() * chars.length)];
        }
        return salt;
    }

    /**
     * Generate realistic hash based on algorithm
     */
    generateHash(algorithm) {
        const hashLengths = {
            'Argon2id': 97, // $argon2id$v=19$m=65536,t=2,p=1$...
            'SHA-256': 64,
            'SHA-512': 128,
            'bcrypt': 60,
            'extended': 128
        };
        
        const length = hashLengths[algorithm] || 64;
        const chars = '0123456789abcdef';
        let hash = '';
        
        if (algorithm === 'Argon2id') {
            // Argon2 format: $argon2id$v=19$m=65536,t=2,p=1$[salt]$[hash]
            const salt = this.generateSalt(12);
            const hashPart = this.generateSalt(22);
            return `$argon2id$v=19$m=65536,t=2,p=1$${salt}$${hashPart}`;
        } else if (algorithm === 'bcrypt') {
            // bcrypt format: $2b$10$[salt][hash]
            const bcryptHash = this.generateSalt(29);
            return `$2b$10$${bcryptHash}`;
        } else {
            for (let i = 0; i < length; i++) {
                hash += chars[Math.floor(Math.random() * chars.length)];
            }
            return hash;
        }
    }

    /**
     * Get current mock users (generates new if empty)
     */
    getMockUsers() {
        if (this.mockUsers.length === 0) {
            this.generateMockUsers(30);
        }
        return this.mockUsers;
    }

    /**
     * Simulate random backend activity
     */
    simulateActivity() {
        const activities = [
            { type: 'login', icon: '🔐', color: '#2563eb' },
            { type: 'registration', icon: '✨', color: '#059669' },
            { type: 'password_change', icon: '🔑', color: '#d97706' },
            { type: 'security_scan', icon: '🔍', color: '#0891b2' },
            { type: 'breach_check', icon: '🛡️', color: '#9333ea' },
            { type: 'resalt', icon: '🔄', color: '#ec4899' }
        ];

        const activity = faker.helpers.arrayElement(activities);
        const user = faker.helpers.arrayElement(this.mockUsers);
        
        const logEntry = {
            id: this.activityLog.length + 1,
            timestamp: new Date().toISOString(),
            type: activity.type,
            icon: activity.icon,
            color: activity.color,
            user: user.name,
            email: user.email,
            message: this.generateActivityMessage(activity.type, user),
            success: faker.datatype.boolean(0.85) // 85% success rate
        };

        this.activityLog.unshift(logEntry);
        
        // Keep only last 50 activities
        if (this.activityLog.length > 50) {
            this.activityLog = this.activityLog.slice(0, 50);
        }

        // Update stats
        this.stats.totalRequests++;
        this.stats.activeSessions = faker.number.int({ min: 15, max: 45 });
        this.stats.securityEvents = faker.number.int({ min: 0, max: 5 });
        
        // Dispatch custom event for UI updates
        window.dispatchEvent(new CustomEvent('liveDemoActivity', { 
            detail: logEntry 
        }));

        return logEntry;
    }

    /**
     * Generate realistic activity messages
     */
    generateActivityMessage(type, user) {
        const messages = {
            login: `User logged in from ${user.location}`,
            registration: `New account created with ${user.algorithm}`,
            password_change: `Password updated (Security Score: ${user.securityScore})`,
            security_scan: `Vulnerability scan completed - ${user.breachStatus}`,
            breach_check: `Password checked against ${faker.number.int({ min: 100, max: 500 })}M breached passwords`,
            resalt: `Password re-hashed with new salt (Count: ${user.resaltCount + 1})`
        };
        return messages[type] || 'System activity';
    }

    /**
     * Start background simulation
     */
    startSimulation() {
        if (this.simulationActive) {
            console.log('⚠️ Simulation already running');
            return;
        }

        console.log('🚀 Starting Live Demo simulation...');
        this.simulationActive = true;
        
        // Generate initial data
        if (this.mockUsers.length === 0) {
            this.generateMockUsers(30);
        }

        // Simulate activity every 2-5 seconds
        const simulateWithRandomDelay = () => {
            if (!this.simulationActive) return;
            
            this.simulateActivity();
            
            const delay = faker.number.int({ min: 2000, max: 5000 });
            setTimeout(simulateWithRandomDelay, delay);
        };

        simulateWithRandomDelay();

        // Dispatch simulation started event
        window.dispatchEvent(new CustomEvent('liveDemoStarted'));
        
        console.log('✅ Live Demo simulation active');
    }

    /**
     * Stop background simulation
     */
    stopSimulation() {
        console.log('🛑 Stopping Live Demo simulation...');
        this.simulationActive = false;
        
        if (this.backgroundInterval) {
            clearInterval(this.backgroundInterval);
            this.backgroundInterval = null;
        }

        // Dispatch simulation stopped event
        window.dispatchEvent(new CustomEvent('liveDemoStopped'));
        
        console.log('✅ Live Demo simulation stopped');
    }

    /**
     * Refresh data - generate new mock users
     */
    refreshData() {
        console.log('🔄 Refreshing mock data...');
        this.generateMockUsers(30);
        
        // Dispatch data refreshed event
        window.dispatchEvent(new CustomEvent('liveDemoDataRefreshed', {
            detail: { users: this.mockUsers }
        }));
        
        return this.mockUsers;
    }

    /**
     * Get simulation statistics
     */
    getStats() {
        return {
            ...this.stats,
            totalUsers: this.mockUsers.length,
            breachedUsers: this.mockUsers.filter(u => u.breachStatus === 'BREACHED').length,
            secureUsers: this.mockUsers.filter(u => u.breachStatus === 'SECURE').length,
            averageScore: Math.round(
                this.mockUsers.reduce((sum, u) => sum + u.securityScore, 0) / this.mockUsers.length
            ),
            isSimulationActive: this.simulationActive,
            lastUpdate: this.lastUpdate
        };
    }

    /**
     * Get recent activity log
     */
    getActivityLog(limit = 10) {
        return this.activityLog.slice(0, limit);
    }

    /**
     * Check if simulation is active
     */
    isActive() {
        return this.simulationActive;
    }
}

// ==================== GLOBAL INSTANCE ====================

// Create global instance
window.liveDemoService = new LiveDemoService();

// Auto-generate initial data when service loads
window.liveDemoService.generateMockUsers(30);

console.log('✅ Live Demo Service initialized with 30 mock users');
