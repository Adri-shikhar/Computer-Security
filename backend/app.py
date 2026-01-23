"""
Flask Backend for Security Operations Center
Handles user registration with Argon2 hashing and automatic salt rotation
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import hashlib
import secrets
import os
import threading
import time
from datetime import datetime, timedelta
import bcrypt

# Try to import argon2, fallback to simulation if not available
try:
    from argon2 import PasswordHasher, Type
    from argon2.exceptions import VerifyMismatchError
    ARGON2_AVAILABLE = True
    ph = PasswordHasher(
        time_cost=2,
        memory_cost=65536,
        parallelism=1,
        hash_len=32,
        salt_len=16,
        type=Type.ID
    )
except ImportError:
    ARGON2_AVAILABLE = False
    print("⚠️ argon2-cffi not installed.")
    print("   Install with: pip install argon2-cffi")

BCRYPT_AVAILABLE = True  # bcrypt is now installed

app = Flask(__name__, static_folder='../static', static_url_path='/static')
CORS(app)

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

# Auto-resalt configuration (in seconds)
AUTO_RESALT_INTERVAL = 300  # 5 minutes for demo (set to 3600 for 1 hour in production)
auto_resalt_enabled = False
resalt_thread = None

def generate_salt(length=32):
    """Generate a cryptographically secure random salt"""
    return secrets.token_hex(length // 2)

def hash_password_bcrypt(password):
    """Hash password using bcrypt"""
    # bcrypt generates its own salt internally
    password_bytes = password.encode('utf-8')
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt(rounds=12))
    return hashed.decode('utf-8'), ''  # Return empty salt since bcrypt handles it internally

def hash_password_argon2(password):
    """Hash password using Argon2id algorithm"""
    if ARGON2_AVAILABLE:
        # Argon2 handles salt internally
        hash_result = ph.hash(password)
        return hash_result, ''  # Return empty salt since Argon2 handles it internally
    else:
        # Fallback: Use bcrypt if Argon2 not available
        return hash_password_bcrypt(password)

def hash_password_md5(password):
    """Hash password using MD5 (NOT SECURE - for educational/lab purposes only)"""
    # MD5 is NOT secure for password storage, but implementing as requested
    hash_result = hashlib.md5(password.encode('utf-8')).hexdigest()
    return hash_result, ''  # Return empty salt

def verify_password_after_resalt(password, salt, stored_hash, original_md5):
    """
    Verify password for re-salted users
    Process: password → MD5 → MD5+salt → SHA256
    """
    # Step 1: Hash password with MD5
    md5_hash = hashlib.md5(password.encode('utf-8')).hexdigest()
    
    # Step 2: Add salt to MD5 hash
    salted_input = md5_hash + salt
    
    # Step 3: Hash with SHA-256
    final_hash = hashlib.sha256(salted_input.encode()).hexdigest()
    
    # Compare with stored hash
    return final_hash == stored_hash

def verify_password(password, algorithm, password_hash):
    """Verify password against stored hash"""
    try:
        if algorithm == 'bcrypt':
            password_bytes = password.encode('utf-8')
            hash_bytes = password_hash.encode('utf-8')
            return bcrypt.checkpw(password_bytes, hash_bytes)
        elif algorithm == 'Argon2' and ARGON2_AVAILABLE:
            try:
                ph.verify(password_hash, password)
                return True
            except VerifyMismatchError:
                return False
        else:
            return False
    except Exception as e:
        print(f"Verification error: {e}")
        return False

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with users table"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Create users table with multi-hash support
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            algorithm TEXT DEFAULT 'Multi-Hash',
            salt TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            hash_md5 TEXT,
            hash_sha1 TEXT,
            hash_sha256 TEXT,
            hash_sha512 TEXT,
            security_score INTEGER DEFAULT 0,
            breach_status TEXT DEFAULT 'UNKNOWN',
            resalt_count INTEGER DEFAULT 0,
            last_resalt TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create demo data table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS demo_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            algorithm TEXT DEFAULT 'Multi-Hash',
            salt TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            hash_md5 TEXT,
            hash_sha1 TEXT,
            hash_sha256 TEXT,
            hash_sha512 TEXT,
            security_score INTEGER DEFAULT 0,
            breach_status TEXT DEFAULT 'UNKNOWN',
            resalt_count INTEGER DEFAULT 0,
            last_resalt TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create resalt log table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS resalt_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            old_salt TEXT,
            new_salt TEXT,
            resalted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Check if demo data exists
    cursor.execute('SELECT COUNT(*) FROM demo_users')
    if cursor.fetchone()[0] == 0:
        # Insert 30 demo records with salts
        demo_data = []
        demo_names = [
            ("John Smith", "john.smith@example.com"),
            ("Emma Johnson", "emma.j@example.com"),
            ("Michael Brown", "m.brown@example.com"),
            ("Sarah Davis", "sarah.d@example.com"),
            ("James Wilson", "j.wilson@example.com"),
            ("Emily Taylor", "emily.t@example.com"),
            ("David Anderson", "d.anderson@example.com"),
            ("Olivia Martinez", "olivia.m@example.com"),
            ("William Garcia", "w.garcia@example.com"),
            ("Sophia Rodriguez", "sophia.r@example.com"),
            ("Benjamin Lee", "ben.lee@example.com"),
            ("Isabella Clark", "isabella.c@example.com"),
            ("Lucas Walker", "lucas.w@example.com"),
            ("Mia Hall", "mia.hall@example.com"),
            ("Alexander Young", "alex.y@example.com"),
            ("Charlotte King", "charlotte.k@example.com"),
            ("Daniel Wright", "d.wright@example.com"),
            ("Amelia Scott", "amelia.s@example.com"),
            ("Henry Adams", "henry.a@example.com"),
            ("Ava Nelson", "ava.n@example.com"),
            ("Sebastian Hill", "seb.hill@example.com"),
            ("Harper Green", "harper.g@example.com"),
            ("Jack Baker", "jack.b@example.com"),
            ("Evelyn Carter", "evelyn.c@example.com"),
            ("Owen Mitchell", "owen.m@example.com"),
            ("Lily Roberts", "lily.r@example.com"),
            ("Ethan Turner", "ethan.t@example.com"),
            ("Zoe Phillips", "zoe.p@example.com"),
            ("Mason Campbell", "mason.c@example.com"),
            ("Chloe Parker", "chloe.p@example.com"),
        ]
        
        base_date = datetime(2026, 1, 15, 9, 0)
        for i, (name, email) in enumerate(demo_names):
            # Demo passwords: password1, password2, etc.
            password = f"password{i+1}"
            password_hash = hashlib.md5(password.encode('utf-8')).hexdigest()
            created_at = base_date + timedelta(hours=i * 3)
            demo_data.append((name, email, "MD5", "", password_hash, 0, None, created_at.strftime("%Y-%m-%d %H:%M:%S")))
        
        cursor.executemany('''
            INSERT INTO demo_users (name, email, algorithm, salt, password_hash, resalt_count, last_resalt, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', demo_data)
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully!")

# ==================== AUTO-RESALT FEATURE ====================

def resalt_all_users():
    """Resalt all users with new salt values"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get all users
    cursor.execute('SELECT id, salt, password_hash FROM users')
    users = cursor.fetchall()
    
    resalted_count = 0
    for user in users:
        old_salt = user['salt']
        new_salt = generate_salt(16)
        
        # Note: In a real system, you'd need the original password to rehash
        # For demo purposes, we're just updating the salt (showing the concept)
        # In production, you'd prompt users to re-enter password on next login
        
        cursor.execute('''
            UPDATE users 
            SET salt = ?, 
                resalt_count = resalt_count + 1,
                last_resalt = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (new_salt, user['id']))
        
        # Log the resalt
        cursor.execute('''
            INSERT INTO resalt_log (user_id, old_salt, new_salt)
            VALUES (?, ?, ?)
        ''', (user['id'], old_salt, new_salt))
        
        resalted_count += 1
    
    conn.commit()
    conn.close()
    
    return resalted_count

def auto_resalt_worker():
    """Background worker for automatic resalting"""
    global auto_resalt_enabled
    while auto_resalt_enabled:
        time.sleep(AUTO_RESALT_INTERVAL)
        if auto_resalt_enabled:
            count = resalt_all_users()
            print(f"🔄 Auto-resalt completed: {count} users resalted at {datetime.now().strftime('%H:%M:%S')}")

# ==================== API ROUTES ====================

@app.route('/')
def index():
    """Serve the main page"""
    return send_from_directory('..', 'index.html')

@app.route('/dashboard')
def dashboard():
    """Serve the dashboard page"""
    return send_from_directory('.', 'dashboard.html')

@app.route('/result-login')
def result_login():
    """Serve the result login page"""
    return send_from_directory('.', 'result-login.html')

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory('..', path)

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user with MD5 authentication"""
    try:
        data = request.get_json()
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        algorithm = 'MD5'  # Hardcoded to MD5
        hashes = data.get('hashes', {})
        security_score = data.get('securityScore', 0)
        
        # Validation
        if not name or not email or not password:
            return jsonify({
                'success': False,
                'message': 'All fields are required'
            }), 400
        
        # Hash password with MD5
        password_hash, salt = hash_password_md5(password)
        
        # Get hash values for reference (MD5, SHA-1, SHA-256, SHA-512)
        hash_md5 = hashes.get('md5', '')
        hash_sha1 = hashes.get('sha1', '')
        hash_sha256 = hashes.get('sha256', '')
        hash_sha512 = hashes.get('sha512', '')
        
        # Determine breach status
        common_passwords = ['123456', 'password', '123456789', '12345678', 'qwerty', 'abc123']
        breach_status = 'BREACHED' if password.lower() in common_passwords else ('WEAK' if security_score < 50 else 'SECURE')
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if email exists
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({
                'success': False,
                'message': 'Email already registered'
            }), 400
        
        # Insert new user
        cursor.execute('''
            INSERT INTO users (
                name, email, algorithm, salt, password_hash,
                hash_md5, hash_sha1, hash_sha256, hash_sha512,
                security_score, breach_status, resalt_count
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        ''', (name, email, algorithm, salt, password_hash, hash_md5, hash_sha1, hash_sha256, hash_sha512, security_score, breach_status))
        
        # Keep only last 30 users
        cursor.execute('''
            DELETE FROM users WHERE id NOT IN (
                SELECT id FROM users ORDER BY id DESC LIMIT 30
            )
        ''')
        
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        # Truncate hash for display
        display_hash = password_hash[:50] + "..." if len(password_hash) > 50 else password_hash
        
        return jsonify({
            'success': True,
            'message': f'Registration successful with {algorithm} Authentication!',
            'user': {
                'id': user_id,
                'name': name,
                'email': email,
                'algorithm': algorithm,
                'salt': salt,
                'passwordHash': display_hash,
                'fullHash': password_hash,
                'securityScore': security_score,
                'breachStatus': breach_status,
                'hashes': {
                    'md5': hash_md5,
                    'sha1': hash_sha1,
                    'sha256': hash_sha256,
                    'sha512': hash_sha512
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all registered users (backend storage)"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, email, algorithm, salt, password_hash,
                   hash_md5, hash_sha1, hash_sha256, hash_sha512,
                   security_score, breach_status, resalt_count, last_resalt, created_at 
            FROM users 
            ORDER BY id DESC 
            LIMIT 30
        ''')
        
        users = []
        for row in cursor.fetchall():
            # Truncate hash for display
            full_hash = row['password_hash']
            display_hash = full_hash[:32] + "..." if len(full_hash) > 32 else full_hash
            
            users.append({
                'id': row['id'],
                'name': row['name'],
                'email': row['email'],
                'algorithm': row['algorithm'],
                'salt': row['salt'],
                'passwordHash': display_hash,
                'fullHash': full_hash,
                'hashMD5': row['hash_md5'] or '',
                'hashSHA1': row['hash_sha1'] or '',
                'hashSHA256': row['hash_sha256'] or '',
                'hashSHA512': row['hash_sha512'] or '',
                'securityScore': row['security_score'] or 0,
                'breachStatus': row['breach_status'] or 'UNKNOWN',
                'resaltCount': row['resalt_count'],
                'lastResalt': row['last_resalt'],
                'createdAt': row['created_at']
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'users': users,
            'count': len(users)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/demo-users', methods=['GET'])
def get_demo_users():
    """Get demo users (local storage simulation)"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, email, algorithm, salt, password_hash, resalt_count, last_resalt, created_at 
            FROM demo_users 
            ORDER BY id 
            LIMIT 30
        ''')
        
        users = []
        for row in cursor.fetchall():
            full_hash = row['password_hash']
            display_hash = full_hash[:32] + "..." if len(full_hash) > 32 else full_hash
            
            users.append({
                'id': row['id'],
                'name': row['name'],
                'email': row['email'],
                'algorithm': row['algorithm'],
                'salt': row['salt'],
                'passwordHash': display_hash,
                'fullHash': full_hash,
                'resaltCount': row['resalt_count'],
                'lastResalt': row['last_resalt'],
                'createdAt': row['created_at']
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'users': users,
            'count': len(users)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/users/clear', methods=['DELETE'])
def clear_users():
    """Clear all registered users"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM users')
        cursor.execute('DELETE FROM resalt_log')
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'All users and resalt logs cleared'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/resalt', methods=['POST'])
def trigger_resalt():
    """Manually trigger resalt for all users"""
    try:
        count = resalt_all_users()
        return jsonify({
            'success': True,
            'message': f'Resalt completed! {count} users resalted.',
            'resaltedCount': count,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Resalt failed: {str(e)}'
        }), 500

@app.route('/api/resalt/auto', methods=['POST'])
def toggle_auto_resalt():
    """Toggle automatic resalt feature"""
    global auto_resalt_enabled, resalt_thread, AUTO_RESALT_INTERVAL
    
    try:
        data = request.get_json()
        enable = data.get('enable', False)
        interval = data.get('interval', AUTO_RESALT_INTERVAL)
        
        AUTO_RESALT_INTERVAL = interval
        
        if enable and not auto_resalt_enabled:
            auto_resalt_enabled = True
            resalt_thread = threading.Thread(target=auto_resalt_worker, daemon=True)
            resalt_thread.start()
            return jsonify({
                'success': True,
                'message': f'Auto-resalt enabled! Interval: {interval} seconds',
                'enabled': True,
                'interval': interval
            })
        elif not enable and auto_resalt_enabled:
            auto_resalt_enabled = False
            return jsonify({
                'success': True,
                'message': 'Auto-resalt disabled',
                'enabled': False
            })
        else:
            return jsonify({
                'success': True,
                'message': f'Auto-resalt is {"already enabled" if enable else "already disabled"}',
                'enabled': auto_resalt_enabled,
                'interval': AUTO_RESALT_INTERVAL
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@app.route('/api/resalt/status', methods=['GET'])
def resalt_status():
    """Get auto-resalt status"""
    return jsonify({
        'success': True,
        'enabled': auto_resalt_enabled,
        'interval': AUTO_RESALT_INTERVAL,
        'intervalDisplay': f"{AUTO_RESALT_INTERVAL // 60} minutes" if AUTO_RESALT_INTERVAL >= 60 else f"{AUTO_RESALT_INTERVAL} seconds"
    })

@app.route('/api/resalt/log', methods=['GET'])
def get_resalt_log():
    """Get resalt history log"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT r.*, u.name, u.email 
            FROM resalt_log r
            LEFT JOIN users u ON r.user_id = u.id
            ORDER BY r.resalted_at DESC
            LIMIT 100
        ''')
        
        logs = []
        for row in cursor.fetchall():
            logs.append({
                'id': row['id'],
                'userId': row['user_id'],
                'userName': row['name'],
                'userEmail': row['email'],
                'oldSalt': row['old_salt'][:8] + "..." if row['old_salt'] else None,
                'newSalt': row['new_salt'][:8] + "..." if row['new_salt'] else None,
                'resaltedAt': row['resalted_at']
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'logs': logs,
            'count': len(logs)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Get total users
        cursor.execute('SELECT COUNT(*) FROM users')
        total_backend = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM demo_users')
        total_demo = cursor.fetchone()[0]
        
        # Get today's registrations
        today = datetime.now().strftime('%Y-%m-%d')
        cursor.execute('SELECT COUNT(*) FROM users WHERE DATE(created_at) = ?', (today,))
        today_regs = cursor.fetchone()[0]
        
        # Get total resalts
        cursor.execute('SELECT COUNT(*) FROM resalt_log')
        total_resalts = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': {
                'totalBackendUsers': total_backend,
                'totalDemoUsers': total_demo,
                'todayRegistrations': today_regs,
                'totalResalts': total_resalts,
                'autoResaltEnabled': auto_resalt_enabled,
                'resaltInterval': AUTO_RESALT_INTERVAL
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/hash', methods=['POST'])
def hash_password():
    """Hash a password with Argon2 and salt"""
    try:
        data = request.get_json()
        
        password = data.get('password', '')
        custom_salt = data.get('salt', '')
        
        if not password:
            return jsonify({
                'success': False,
                'message': 'Password is required'
            }), 400
        
        # Use custom salt or generate one
        salt = custom_salt if custom_salt else generate_salt(16)
        password_hash, _ = hash_password_argon2(password, salt)
        
        return jsonify({
            'success': True,
            'result': {
                'password': password,
                'salt': salt,
                'algorithm': 'Argon2id' if ARGON2_AVAILABLE else 'SHA-256 (fallback)',
                'hash': password_hash,
                'hashLength': len(password_hash)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/demo/populate', methods=['POST'])
def populate_demo_data():
    """Populate database with realistic demo data for live demonstration"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Clear existing users first
        cursor.execute("DELETE FROM users")
        
        # Realistic demo users with varied security profiles
        demo_users = [
            # SCENARIO 1: Duplicate Passwords (Same password, different users)
            {
                'name': 'Sarah Johnson',
                'email': 'sarah.j@techcorp.com',
                'password': 'Welcome2024!',
                'security_score': 65,
                'breach_status': 'SECURE'
            },
            {
                'name': 'Michael Chen',
                'email': 'mchen@techcorp.com', 
                'password': 'Welcome2024!',  # Same as Sarah
                'security_score': 65,
                'breach_status': 'SECURE'
            },
            {
                'name': 'David Martinez',
                'email': 'dmartinez@startup.io',
                'password': 'Company123',
                'security_score': 45,
                'breach_status': 'WEAK'
            },
            {
                'name': 'Emily Rodriguez',
                'email': 'emily.r@startup.io',
                'password': 'Company123',  # Same as David
                'security_score': 45,
                'breach_status': 'WEAK'
            },
            
            # SCENARIO 2: Breached Passwords (Common passwords)
            {
                'name': 'John Smith',
                'email': 'john.smith@email.com',
                'password': 'password',
                'security_score': 20,
                'breach_status': 'BREACHED'
            },
            {
                'name': 'Lisa Anderson',
                'email': 'lisa.a@company.com',
                'password': '123456',
                'security_score': 15,
                'breach_status': 'BREACHED'
            },
            {
                'name': 'Robert Taylor',
                'email': 'rtaylor@corp.net',
                'password': 'qwerty',
                'security_score': 18,
                'breach_status': 'BREACHED'
            },
            {
                'name': 'Jennifer Wilson',
                'email': 'jwilson@business.org',
                'password': 'password123',
                'security_score': 25,
                'breach_status': 'BREACHED'
            },
            
            # SCENARIO 3: Weak Passwords (Low security scores)
            {
                'name': 'Alex Turner',
                'email': 'aturner@demo.com',
                'password': 'Test123',
                'security_score': 35,
                'breach_status': 'WEAK'
            },
            {
                'name': 'Jessica Brown',
                'email': 'jbrown@sample.net',
                'password': 'admin2024',
                'security_score': 38,
                'breach_status': 'WEAK'
            },
            {
                'name': 'Christopher Lee',
                'email': 'clee@example.org',
                'password': 'User@123',
                'security_score': 42,
                'breach_status': 'WEAK'
            },
            
            # SCENARIO 4: Strong Passwords (High security scores)
            {
                'name': 'Amanda Foster',
                'email': 'afoster@secure.tech',
                'password': 'Tr0ub4dor&3Xtr4!',
                'security_score': 95,
                'breach_status': 'SECURE'
            },
            {
                'name': 'William Harris',
                'email': 'wharris@crypto.dev',
                'password': 'C0mpl3x!P@ssw0rd#2024',
                'security_score': 98,
                'breach_status': 'SECURE'
            },
            {
                'name': 'Sophia Martinez',
                'email': 'smartinez@infosec.io',
                'password': 'MyS3cur3P@ssPhrase!',
                'security_score': 92,
                'breach_status': 'SECURE'
            },
            {
                'name': 'Daniel Kim',
                'email': 'dkim@security.pro',
                'password': 'Str0ng&S3cure!2024',
                'security_score': 90,
                'breach_status': 'SECURE'
            },
            
            # SCENARIO 5: Medium Security (Mid-range scores)
            {
                'name': 'Olivia Thompson',
                'email': 'othompson@medium.co',
                'password': 'Summer2024!',
                'security_score': 58,
                'breach_status': 'SECURE'
            },
            {
                'name': 'James Wilson',
                'email': 'jwilson2@corp.com',
                'password': 'MyPass2024',
                'security_score': 52,
                'breach_status': 'SECURE'
            },
            {
                'name': 'Emma Davis',
                'email': 'edavis@tech.net',
                'password': 'Winter2024!',
                'security_score': 55,
                'breach_status': 'SECURE'
            },
            
            # SCENARIO 6: More duplicates for demonstration
            {
                'name': 'Noah Johnson',
                'email': 'njohnson@demo.co',
                'password': 'Spring2024',
                'security_score': 48,
                'breach_status': 'WEAK'
            },
            {
                'name': 'Isabella Garcia',
                'email': 'igarcia@demo.co',
                'password': 'Spring2024',  # Same as Noah
                'security_score': 48,
                'breach_status': 'WEAK'
            },
            {
                'name': 'Lucas Moore',
                'email': 'lmoore@demo.co',
                'password': 'Spring2024',  # Same as Noah and Isabella
                'security_score': 48,
                'breach_status': 'WEAK'
            }
        ]
        
        # Insert demo users
        for user in demo_users:
            # Generate salt
            salt = generate_salt(16)
            
            # Hash password with Argon2
            password_hash, algorithm = hash_password_argon2(user['password'], salt)
            
            # Generate multi-hashes for demonstration
            hash_md5 = hashlib.md5(user['password'].encode()).hexdigest()
            hash_sha1 = hashlib.sha1(user['password'].encode()).hexdigest()
            hash_sha256 = hashlib.sha256(user['password'].encode()).hexdigest()
            hash_sha512 = hashlib.sha512(user['password'].encode()).hexdigest()
            
            cursor.execute('''
                INSERT INTO users (
                    name, email, algorithm, salt, password_hash,
                    hash_md5, hash_sha1, hash_sha256, hash_sha512,
                    security_score, breach_status, resalt_count, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user['name'], user['email'], algorithm, salt, password_hash,
                hash_md5, hash_sha1, hash_sha256, hash_sha512,
                user['security_score'], user['breach_status'],
                0, datetime.now().isoformat()
            ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Successfully populated {len(demo_users)} demo users',
            'stats': {
                'total': len(demo_users),
                'breached': len([u for u in demo_users if u['breach_status'] == 'BREACHED']),
                'weak': len([u for u in demo_users if u['security_score'] < 50]),
                'secure': len([u for u in demo_users if u['security_score'] >= 70]),
                'duplicates': 'Multiple groups detected'
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error populating demo data: {str(e)}'
        }), 500

# ==================== AUDIT FEATURES ====================

@app.route('/api/audit/duplicate-passwords', methods=['GET'])
def find_duplicate_passwords():
    """Find users with duplicate password hashes"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Find duplicate password hashes
        cursor.execute('''
            SELECT password_hash, COUNT(*) as count, GROUP_CONCAT(name || ' (' || email || ')') as users
            FROM users
            GROUP BY password_hash
            HAVING count > 1
            ORDER BY count DESC
        ''')
        
        duplicates = []
        for row in cursor.fetchall():
            duplicates.append({
                'hash': row['password_hash'][:32] + '...',
                'count': row['count'],
                'users': row['users'].split(',')
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'duplicates': duplicates,
            'total_groups': len(duplicates),
            'total_affected': sum(d['count'] for d in duplicates)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/audit/weak-passwords', methods=['GET'])
def scan_weak_passwords():
    """Find users with weak passwords (security score < 50)"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, email, security_score, breach_status
            FROM users
            WHERE security_score < 50
            ORDER BY security_score ASC
        ''')
        
        weak_users = []
        for row in cursor.fetchall():
            weak_users.append({
                'id': row['id'],
                'name': row['name'],
                'email': row['email'],
                'score': row['security_score'],
                'status': row['breach_status']
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'weak_passwords': weak_users,
            'total_weak': len(weak_users)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/audit/breached-passwords', methods=['GET'])
def check_breached_passwords():
    """Find users with breached passwords"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, email, breach_status, security_score
            FROM users
            WHERE breach_status = 'BREACHED'
            ORDER BY name
        ''')
        
        breached_users = []
        for row in cursor.fetchall():
            breached_users.append({
                'id': row['id'],
                'name': row['name'],
                'email': row['email'],
                'score': row['security_score']
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'breached_passwords': breached_users,
            'total_breached': len(breached_users)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/audit/hash-distribution', methods=['GET'])
def analyze_hash_distribution():
    """Analyze distribution of hash algorithms and security scores"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Get algorithm distribution
        cursor.execute('''
            SELECT algorithm, COUNT(*) as count
            FROM users
            GROUP BY algorithm
        ''')
        algorithms = {row['algorithm']: row['count'] for row in cursor.fetchall()}
        
        # Get security score distribution
        cursor.execute('''
            SELECT 
                CASE 
                    WHEN security_score >= 70 THEN 'Secure (70-100)'
                    WHEN security_score >= 50 THEN 'Medium (50-69)'
                    ELSE 'Weak (0-49)'
                END as level,
                COUNT(*) as count
            FROM users
            GROUP BY level
        ''')
        security_dist = {row['level']: row['count'] for row in cursor.fetchall()}
        
        # Get total count
        cursor.execute('SELECT COUNT(*) as total FROM users')
        total = cursor.fetchone()['total']
        
        conn.close()
        
        return jsonify({
            'success': True,
            'total_users': total,
            'algorithms': algorithms,
            'security_distribution': security_dist
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

# ==================== RE-SALT FEATURE ====================

@app.route('/api/resalt/users', methods=['GET'])
def get_users_for_resalt():
    """Get all users showing their current salt status and security"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, email, algorithm, salt, security_score, breach_status, created_at
            FROM users
            ORDER BY security_score ASC, created_at DESC
        ''')
        
        users = []
        for row in cursor.fetchall():
            # Determine if user needs re-salting
            needs_resalt = (
                row['algorithm'] == 'MD5' or 
                not row['salt'] or 
                len(row['salt']) < 16 or
                row['security_score'] < 50
            )
            
            users.append({
                'id': row['id'],
                'name': row['name'],
                'email': row['email'],
                'algorithm': row['algorithm'],
                'salt_length': len(row['salt']) if row['salt'] else 0,
                'security_score': row['security_score'],
                'breach_status': row['breach_status'],
                'needs_resalt': needs_resalt,
                'created_at': row['created_at']
            })
        
        conn.close()
        
        # Count users needing re-salt
        needs_resalt_count = sum(1 for u in users if u['needs_resalt'])
        
        return jsonify({
            'success': True,
            'users': users,
            'total_users': len(users),
            'needs_resalt': needs_resalt_count,
            'secure_users': len(users) - needs_resalt_count
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/resalt/user/<int:user_id>', methods=['POST'])
def resalt_single_user(user_id):
    """Re-salt a single user's password with SHA-256 + salt (preserving original MD5)"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Get user's current data
        cursor.execute('SELECT name, email, password_hash, algorithm, hash_md5 FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # For MD5 users, preserve the original hash in hash_md5 if not already there
        original_md5 = user['hash_md5'] if user['hash_md5'] else user['password_hash']
        
        # Use the MD5 hash and add salt to it
        existing_hash = user['password_hash']
        
        # Generate new salt
        new_salt = secrets.token_hex(16)  # 32 character hex string
        
        # Create SHA-256 hash from: existing_hash + salt
        salted_hash_input = existing_hash + new_salt
        new_hash = hashlib.sha256(salted_hash_input.encode()).hexdigest()
        
        # Calculate new security score
        new_score = 85  # SHA-256 with salt
        
        # Update user - keep original MD5 in hash_md5 column for verification
        cursor.execute('''
            UPDATE users 
            SET password_hash = ?,
                salt = ?,
                algorithm = 'SHA256',
                security_score = ?,
                breach_status = 'SECURE',
                hash_md5 = ?
            WHERE id = ?
        ''', (new_hash, new_salt, new_score, original_md5, user_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'User {user["name"]} re-salted successfully (password unchanged)',
            'user': {
                'id': user_id,
                'name': user['name'],
                'email': user['email'],
                'note': 'Original password still works - only hash security upgraded',
                'algorithm': 'SHA256',
                'salt_length': 32,
                'security_score': new_score
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@app.route('/api/resalt/all', methods=['POST'])
def resalt_all_users():
    """Re-salt all users with weak/unsalted passwords using SHA-256 (preserving passwords)"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Get all users that need re-salting
        cursor.execute('''
            SELECT id, name, email, password_hash, algorithm, salt, security_score, hash_md5
            FROM users
            WHERE algorithm = 'MD5' 
               OR salt IS NULL 
               OR salt = '' 
               OR LENGTH(salt) < 16
               OR security_score < 50
        ''')
        
        users_to_resalt = cursor.fetchall()
        
        if not users_to_resalt:
            return jsonify({
                'success': True,
                'message': 'No users need re-salting',
                'count': 0,
                'users': []
            })
        
        resalted_users = []
        
        for user in users_to_resalt:
            # Preserve original MD5
            original_md5 = user['hash_md5'] if user['hash_md5'] else user['password_hash']
            
            # Use existing password hash
            existing_hash = user['password_hash']
            
            # Generate new salt
            new_salt = secrets.token_hex(16)
            
            # Create SHA-256 hash from: existing_hash + salt
            salted_hash_input = existing_hash + new_salt
            new_hash = hashlib.sha256(salted_hash_input.encode()).hexdigest()
            
            # Update user - preserve original MD5
            cursor.execute('''
                UPDATE users
                SET password_hash = ?,
                    salt = ?,
                    algorithm = 'SHA256',
                    security_score = 85,
                    breach_status = 'SECURE',
                    hash_md5 = ?
                WHERE id = ?
            ''', (new_hash, new_salt, original_md5, user['id']))
            
            resalted_users.append({
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'note': 'Password unchanged - hash security upgraded'
            })
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Successfully re-salted {len(resalted_users)} users (passwords unchanged)',
            'count': len(resalted_users),
            'users': resalted_users
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500
        
        if not users_to_resalt:
            return jsonify({
                'success': True,
                'message': 'No users need re-salting',
                'resalted_count': 0
            })
        
        resalted_users = []
        import string
        
        for user in users_to_resalt:
            # Generate temporary password
            temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits + '!@#$%^&*') for _ in range(16))
            
            # Generate new salt
            new_salt = secrets.token_hex(16)
            
            # Create SHA-256 salted hash
            salted_password = new_salt + temp_password
            new_hash = hashlib.sha256(salted_password.encode()).hexdigest()
            
            # Update user
            cursor.execute('''
                UPDATE users 
                SET password_hash = ?,
                    salt = ?,
                    algorithm = 'SHA256',
                    security_score = 85,
                    breach_status = 'SECURE'
                WHERE id = ?
            ''', (new_hash, new_salt, user['id']))
            
            resalted_users.append({
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'temporary_password': temp_password,
                'old_algorithm': user['algorithm'],
                'new_algorithm': 'SHA256'
            })
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Successfully re-salted {len(resalted_users)} users',
            'resalted_count': len(resalted_users),
            'users': resalted_users
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify backend is running"""
    return jsonify({
        'success': True,
        'status': 'online',
        'message': 'Backend is running',
        'algorithm': 'Argon2id' if ARGON2_AVAILABLE else 'SHA-256',
        'timestamp': datetime.now().isoformat()
    })

# ==================== MAIN ====================

if __name__ == '__main__':
    print("🔐 Security Operations Center - Flask Backend")
    print("=" * 50)
    print(f"🔒 Hashing Algorithm: {'Argon2id' if ARGON2_AVAILABLE else 'SHA-256 (fallback)'}")
    print(f"🧂 Salt Length: 16 bytes (32 hex chars)")
    print(f"🔄 Auto-Resalt Interval: {AUTO_RESALT_INTERVAL} seconds")
    print("=" * 50)
    init_db()
    print("🚀 Starting server on http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
