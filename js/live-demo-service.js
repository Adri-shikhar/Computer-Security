/**
 * ============================================
 * LIVE-DEMO-SERVICE.JS - Demo Data Generator
 * ============================================
 * Purpose: Generate realistic mock data for demos
 * Contains: User generation, activity simulation
 */

// Live Demo Simulation Service
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

    // Generate mock users
    generateMockUsers(count = 30) {
        console.log(`🔄 Generating ${count} mock users...`);
        this.mockUsers = [];
        
        const scoreRanges = [
            { min: 80, max: 100, breach: 'SECURE', count: 0 },
            { min: 50, max: 79, breach: 'MODERATE', count: 0 },
            { min: 20, max: 49, breach: 'WEAK', count: 30 },
            { min: 0, max: 19, breach: 'BREACHED', count: 0 }
        ];

        const algorithms = ['Argon2id', 'SHA-256', 'SHA-512', 'bcrypt'];
        const emailDomains = ['example.com', 'demo.co', 'testmail.io'];
        
        let userId = 1;
        
        scoreRanges.forEach(range => {
            for (let i = 0; i < range.count; i++) {
                const firstName = this.randomName();
                const lastName = this.randomName();
                const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${this.randomItem(emailDomains)}`;
                const securityScore = this.randomInt(range.min, range.max);
                const algorithm = this.randomItem(algorithms);
                
                const salt = this.generateSalt(16);
                const passwordHash = this.generateHash(algorithm);
                const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
                const hasResalt = Math.random() < 0.3;
                
                this.mockUsers.push({
                    id: userId++,
                    name: `${firstName} ${lastName}`,
                    email: email,
                    algorithm: algorithm,
                    salt: salt,
                    passwordHash: passwordHash,
                    securityScore: securityScore,
                    breachStatus: range.breach,
                    resaltCount: hasResalt ? this.randomInt(1, 5) : 0,
                    lastResalt: hasResalt ? new Date().toISOString() : null,
                    createdAt: createdAt.toISOString()
                });
            }
        });

        this.mockUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        this.lastUpdate = new Date();
        console.log(`✅ Generated ${this.mockUsers.length} mock users`);
        
        return this.mockUsers;
    }

    // Helper functions
    randomName() {
        const names = ['John', 'Jane', 'Mike', 'Sarah', 'Tom', 'Emma', 'Alex', 'Lisa', 'Chris', 'Amy'];
        return names[Math.floor(Math.random() * names.length)];
    }
    
    randomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateSalt(length = 16) {
        const chars = '0123456789abcdef';
        let salt = '';
        for (let i = 0; i < length * 2; i++) {
            salt += chars[Math.floor(Math.random() * chars.length)];
        }
        return salt;
    }

    generateHash(algorithm) {
        const hashLengths = {
            'Argon2id': 97,
            'SHA-256': 64,
            'SHA-512': 128,
            'bcrypt': 60
        };
        
        const length = hashLengths[algorithm] || 64;
        const chars = '0123456789abcdef';
        let hash = '';
        
        if (algorithm === 'Argon2id') {
            const salt = this.generateSalt(12);
            const hashPart = this.generateSalt(22);
            return `$argon2id$v=19$m=65536,t=2,p=1$${salt}$${hashPart}`;
        } else if (algorithm === 'bcrypt') {
            return `$2b$10$${this.generateSalt(29)}`;
        } else {
            for (let i = 0; i < length; i++) {
                hash += chars[Math.floor(Math.random() * chars.length)];
            }
            return hash;
        }
    }

    getMockUsers() {
        if (this.mockUsers.length === 0) {
            this.generateMockUsers(30);
        }
        return this.mockUsers;
    }

    startSimulation() {
        if (this.simulationActive) return;
        console.log('🚀 Starting simulation...');
        this.simulationActive = true;
        
        if (this.mockUsers.length === 0) {
            this.generateMockUsers(30);
        }
        
        window.dispatchEvent(new CustomEvent('liveDemoStarted'));
    }

    stopSimulation() {
        console.log('🛑 Stopping simulation...');
        this.simulationActive = false;
        window.dispatchEvent(new CustomEvent('liveDemoStopped'));
    }

    refreshData() {
        this.generateMockUsers(30);
        window.dispatchEvent(new CustomEvent('liveDemoDataRefreshed', {
            detail: { users: this.mockUsers }
        }));
        return this.mockUsers;
    }

    getStats() {
        return {
            ...this.stats,
            totalUsers: this.mockUsers.length,
            isSimulationActive: this.simulationActive,
            lastUpdate: this.lastUpdate
        };
    }

    getActivityLog(limit = 20) {
        return this.activityLog.slice(0, limit);
    }
}

// Create global instance
window.liveDemoService = new LiveDemoService();

console.log('✅ live-demo-service.js loaded');
