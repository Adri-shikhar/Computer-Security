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
    print("⚠️ argon2-cffi not installed. Using SHA-256 with salt as fallback.")
    print("   Install with: pip install argon2-cffi")

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

def hash_password_argon2(password, salt=None):
    """Hash password using Argon2id algorithm with salt"""
    if salt is None:
        salt = generate_salt(16)
    
    if ARGON2_AVAILABLE:
        # Use Argon2id (recommended variant)
        salted_password = salt + password
        hash_result = ph.hash(salted_password)
        return hash_result, salt
    else:
        # Fallback: SHA-256 with salt (still better than plain MD5)
        salted_password = salt + password
        hash_result = hashlib.sha256(salted_password.encode()).hexdigest()
        return hash_result, salt

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
            salt = generate_salt(16)
            # Demo passwords: password1, password2, etc.
            password_hash, _ = hash_password_argon2(f"password{i+1}", salt)
            created_at = base_date + timedelta(hours=i * 3)
            demo_data.append((name, email, "Argon2id", salt, password_hash, 0, None, created_at.strftime("%Y-%m-%d %H:%M:%S")))
        
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

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files"""
    return send_from_directory('..', path)

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user with Multi-Hash authentication"""
    try:
        data = request.get_json()
        
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')
        hashes = data.get('hashes', {})
        security_score = data.get('securityScore', 0)
        
        # Validation
        if not name or not email or not password:
            return jsonify({
                'success': False,
                'message': 'All fields are required'
            }), 400
        
        # Generate salt and primary hash (Argon2)
        salt = generate_salt(16)
        password_hash, _ = hash_password_argon2(password, salt)
        
        # Get multi-hash values
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
        
        # Insert new user with multi-hash
        cursor.execute('''
            INSERT INTO users (
                name, email, algorithm, salt, password_hash,
                hash_md5, hash_sha1, hash_sha256, hash_sha512,
                security_score, breach_status, resalt_count
            )
            VALUES (?, ?, 'Multi-Hash', ?, ?, ?, ?, ?, ?, ?, ?, 0)
        ''', (name, email, salt, password_hash, hash_md5, hash_sha1, hash_sha256, hash_sha512, security_score, breach_status))
        
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
            'message': 'Registration successful with Multi-Hash Authentication!',
            'user': {
                'id': user_id,
                'name': name,
                'email': email,
                'algorithm': 'Multi-Hash',
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
