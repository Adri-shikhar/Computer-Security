"""
Advanced Authentication Security Lab - Flask Backend
Demonstrates evolution from weak (MD5) to strong (Argon2id) password security

Features:
- Multi-stage architecture (MD5 vs Argon2id)
- Transparent migration from legacy to modern hashing
- Rate limiting against brute force
- Performance benchmarking
- Hashcat export for penetration testing
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from models import db, User, LoginAttempt, PasswordHistory
from datetime import datetime, timedelta
import hashlib
import secrets
import time
import os
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# Get the directory where this file is located
basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'auth_security_lab.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = secrets.token_hex(32)

# CORS for frontend communication
CORS(app)

# Initialize database
db.init_app(app)

# Global Configuration: Switch between security stages
SECURITY_STAGE = os.getenv('SECURITY_STAGE', 'modern')  # 'broken' or 'modern'

# Pepper - Server-side secret (defense in depth)
HASH_PEPPER = os.getenv('HASH_PEPPER', 'default-pepper-CHANGE-IN-PRODUCTION-' + secrets.token_hex(16))

# Argon2 Configuration (Professional Settings)
ph = PasswordHasher(
    time_cost=3,        # Number of iterations
    memory_cost=65536,  # 64 MB memory usage (memory-hard)
    parallelism=2,      # Number of parallel threads
    hash_len=32,        # Length of hash output
    salt_len=16         # Length of random salt
)

# Rate limiting configuration
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION = timedelta(minutes=15)

# Password history settings
MAX_PASSWORD_HISTORY = 5  # Remember last 5 passwords
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION = timedelta(minutes=15)


def generate_md5_hash(password, salt=None):
    """
    Stage 1 (BROKEN): MD5 hashing with optional salt
    ⚠️ INSECURE - For educational purposes only
    """
    if salt:
        data = f"{password}{salt}".encode('utf-8')
    else:
        data = password.encode('utf-8')
    return hashlib.md5(data).hexdigest()


def generate_argon2_hash(password):
    """
    Stage 2 (MODERN): Argon2id hashing with automatic salting
    ✅ SECURE - Industry standard
    - Automatically generates unique random salt
    - Memory-hard (resists GPU attacks)
    - Configurable time/memory cost
    """
    return ph.hash(password)


def verify_argon2_hash(password, hash_string):
    """Verify password against Argon2 hash"""
    try:
        ph.verify(hash_string, password)
        return True
    except VerifyMismatchError:
        return False


def generate_pbkdf2_hash(password, salt=None, iterations=600000):
    """
    PBKDF2-SHA256 hashing (NIST approved, FIPS 140-2 compliant)
    ✅ SECURE - Still widely used (iOS, Android)
    """
    if salt is None:
        salt = secrets.token_hex(16)
    
    # Apply pepper
    peppered = password + HASH_PEPPER
    
    # PBKDF2 with SHA-256
    hash_bytes = hashlib.pbkdf2_hmac('sha256', peppered.encode('utf-8'), salt.encode('utf-8'), iterations)
    hash_hex = hash_bytes.hex()
    
    # Format: pbkdf2:sha256:iterations:salt:hash
    return f"pbkdf2:sha256:{iterations}:{salt}:{hash_hex}", salt


def verify_pbkdf2_hash(password, stored_hash):
    """Verify password against PBKDF2 hash"""
    try:
        parts = stored_hash.split(':')
        if len(parts) != 5 or parts[0] != 'pbkdf2':
            return False
        
        algorithm = parts[1]  # should be 'sha256'
        iterations = int(parts[2])
        salt = parts[3]
        stored_hash_hex = parts[4]
        
        # Apply pepper
        peppered = password + HASH_PEPPER
        
        # Recompute hash
        hash_bytes = hashlib.pbkdf2_hmac(algorithm, peppered.encode('utf-8'), salt.encode('utf-8'), iterations)
        computed_hash = hash_bytes.hex()
        
        # Constant-time comparison
        return secrets.compare_digest(computed_hash, stored_hash_hex)
    except Exception:
        return False


def apply_pepper(password):
    """Apply server-side pepper to password"""
    return password + HASH_PEPPER


def check_password_history(user_id, new_password, algorithm):
    """
    Check if password was used before (prevents reuse)
    Returns: (is_reused: bool, message: str)
    """
    user = User.query.get(user_id)
    if not user:
        return False, "User not found"
    
    # Check current password
    if verify_password(new_password, user.password_hash, user.algorithm):
        return True, "Cannot reuse current password"
    
    # Check password history
    history = PasswordHistory.query.filter_by(user_id=user_id).order_by(PasswordHistory.created_at.desc()).limit(MAX_PASSWORD_HISTORY).all()
    
    for entry in history:
        if verify_password(new_password, entry.password_hash, entry.algorithm):
            return True, f"Cannot reuse password from history (last {MAX_PASSWORD_HISTORY} passwords)"
    
    return False, "Password is acceptable"


def verify_password(password, hash_value, algorithm):
    """Universal password verification across all algorithms"""
    peppered = password + HASH_PEPPER if algorithm in ['argon2', 'pbkdf2'] else password
    
    if algorithm == 'md5':
        parts = hash_value.split(':', 1)
        if len(parts) == 2:
            salt, hash_part = parts
            return generate_md5_hash(password, salt) == hash_value
        else:
            return generate_md5_hash(password) == hash_value
    elif algorithm == 'argon2':
        return verify_argon2_hash(peppered, hash_value)
    elif algorithm == 'pbkdf2':
        return verify_pbkdf2_hash(password, hash_value)
    return False


def save_to_password_history(user_id, password_hash, algorithm):
    """Save current password to history before changing"""
    history_entry = PasswordHistory(
        user_id=user_id,
        password_hash=password_hash,
        algorithm=algorithm
    )
    db.session.add(history_entry)
    
    # Keep only last MAX_PASSWORD_HISTORY entries
    all_history = PasswordHistory.query.filter_by(user_id=user_id).order_by(PasswordHistory.created_at.desc()).all()
    if len(all_history) > MAX_PASSWORD_HISTORY:
        for old_entry in all_history[MAX_PASSWORD_HISTORY:]:
            db.session.delete(old_entry)
    
    db.session.commit()


def benchmark_hash_performance():
    """
    Measure hash generation performance
    Returns: dict with MD5 and Argon2 timing in milliseconds
    """
    test_password = "TestPassword123!"
    
    # Benchmark MD5
    start = time.time()
    for _ in range(100):
        generate_md5_hash(test_password)
    md5_time = (time.time() - start) / 100 * 1000  # Convert to ms
    
    # Benchmark Argon2
    start = time.time()
    for _ in range(10):  # Fewer iterations since it's slower
        generate_argon2_hash(test_password)
    argon2_time = (time.time() - start) / 10 * 1000  # Convert to ms
    
    return {
        'md5_ms': round(md5_time, 3),
        'argon2_ms': round(argon2_time, 3),
        'slowdown_factor': round(argon2_time / md5_time, 2) if md5_time > 0 else 0
    }


def check_rate_limit(username):
    """
    Check if user is rate limited due to failed login attempts
    Returns: (is_locked, remaining_attempts, lockout_until)
    """
    recent_attempts = LoginAttempt.query.filter_by(
        username=username,
        success=False
    ).filter(
        LoginAttempt.timestamp > datetime.utcnow() - LOCKOUT_DURATION
    ).count()
    
    if recent_attempts >= MAX_LOGIN_ATTEMPTS:
        last_attempt = LoginAttempt.query.filter_by(
            username=username
        ).order_by(LoginAttempt.timestamp.desc()).first()
        
        lockout_until = last_attempt.timestamp + LOCKOUT_DURATION
        return True, 0, lockout_until
    
    return False, MAX_LOGIN_ATTEMPTS - recent_attempts, None


def log_login_attempt(username, success, ip_address):
    """Record login attempt for rate limiting"""
    attempt = LoginAttempt(
        username=username,
        success=success,
        ip_address=ip_address,
        timestamp=datetime.utcnow()
    )
    db.session.add(attempt)
    db.session.commit()


@app.route('/api/register', methods=['POST'])
def register():
    """
    Register new user with current security stage configuration
    """
    start_time = time.time()
    data = request.json
    
    username = data.get('username', '').strip()
    password = data.get('password', '')
    algorithm = data.get('algorithm', 'argon2').lower()
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400
    
    # Check if user exists
    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': 'Username already exists'}), 400
    
    # Generate hash based on algorithm choice
    if algorithm == 'md5':
        if SECURITY_STAGE == 'broken':
            # Stage 1: No salt (INSECURE)
            hash_value = generate_md5_hash(password)
            salt = 'NONE'
        else:
            # Still weak, but with salt
            salt = secrets.token_hex(16)
            hash_value = generate_md5_hash(password, salt)
    elif algorithm == 'argon2':
        # Stage 2: Modern, secure hashing with pepper
        peppered = apply_pepper(password)
        hash_value = generate_argon2_hash(peppered)
        salt = 'EMBEDDED'  # Argon2 embeds salt in hash
    elif algorithm == 'pbkdf2':
        # PBKDF2-SHA256 with pepper (NIST approved)
        hash_value, salt = generate_pbkdf2_hash(password)
    else:
        return jsonify({'success': False, 'message': 'Invalid algorithm. Use: md5, argon2, pbkdf2'}), 400
    
    # Create user
    user = User(
        username=username,
        password_hash=hash_value,
        algorithm=algorithm,
        salt=salt,
        created_at=datetime.utcnow(),
        upgraded=False
    )
    
    db.session.add(user)
    db.session.commit()
    
    processing_time = round((time.time() - start_time) * 1000, 2)
    
    return jsonify({
        'success': True,
        'message': f'User registered with {algorithm.upper()}',
        'user': {
            'id': user.id,
            'username': user.username,
            'algorithm': user.algorithm,
            'processing_time_ms': processing_time
        }
    }), 201


@app.route('/api/login', methods=['POST'])
def login():
    """
    Authenticate user with transparent migration from MD5 to Argon2
    Includes rate limiting protection
    """
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '')
    ip_address = request.remote_addr
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400
    
    # Check rate limiting
    is_locked, remaining_attempts, lockout_until = check_rate_limit(username)
    if is_locked:
        return jsonify({
            'success': False,
            'message': f'Account locked due to too many failed attempts. Try again after {lockout_until.strftime("%H:%M:%S")}',
            'locked_until': lockout_until.isoformat(),
            'rate_limited': True
        }), 429
    
    # Find user
    user = User.query.filter_by(username=username).first()
    if not user:
        log_login_attempt(username, False, ip_address)
        return jsonify({
            'success': False,
            'message': 'Invalid credentials',
            'remaining_attempts': remaining_attempts - 1
        }), 401
    
    # Verify password based on algorithm
    is_valid = False
    migrated = False
    
    if user.algorithm == 'md5':
        # Verify MD5 hash
        if user.salt == 'NONE':
            expected_hash = generate_md5_hash(password)
        else:
            expected_hash = generate_md5_hash(password, user.salt)
        
        is_valid = (expected_hash == user.password_hash)
        
        # TRANSPARENT MIGRATION: Upgrade to Argon2 automatically
        if is_valid and SECURITY_STAGE == 'modern':
            new_hash = generate_argon2_hash(password)
            user.password_hash = new_hash
            user.algorithm = 'argon2'
            user.salt = 'EMBEDDED'
            user.upgraded = True
            user.last_login = datetime.utcnow()
            db.session.commit()
            migrated = True
    
    elif user.algorithm == 'argon2':
        is_valid = verify_argon2_hash(password, user.password_hash)
        if is_valid:
            user.last_login = datetime.utcnow()
            db.session.commit()
    
    # Log attempt
    log_login_attempt(username, is_valid, ip_address)
    
    if is_valid:
        # Clear failed attempts on successful login
        LoginAttempt.query.filter_by(username=username, success=False).delete()
        db.session.commit()
        
        response = {
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'algorithm': user.algorithm,
                'upgraded': user.upgraded
            }
        }
        
        if migrated:
            response['message'] = 'Login successful! Your password security has been automatically upgraded from MD5 to Argon2id.'
            response['migrated'] = True
        
        return jsonify(response), 200
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid credentials',
            'remaining_attempts': remaining_attempts - 1
        }), 401


@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users (for dashboard)"""
    users = User.query.all()
    return jsonify({
        'success': True,
        'users': [{
            'id': user.id,
            'username': user.username,
            'algorithm': user.algorithm,
            'salt': user.salt,
            'hash': user.password_hash,
            'upgraded': user.upgraded,
            'created_at': user.created_at.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None
        } for user in users]
    }), 200


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'User deleted'}), 200


@app.route('/api/clear-all', methods=['POST'])
def clear_all():
    """Clear all users and login attempts"""
    User.query.delete()
    LoginAttempt.query.delete()
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'All data cleared'}), 200


@app.route('/api/benchmark', methods=['GET'])
def benchmark():
    """
    Benchmark hash performance (MD5 vs Argon2)
    Shows Security vs Performance trade-off
    """
    results = benchmark_hash_performance()
    
    return jsonify({
        'success': True,
        'benchmark': results,
        'analysis': {
            'md5_analysis': f'MD5 is extremely fast ({results["md5_ms"]}ms) but insecure',
            'argon2_analysis': f'Argon2 is {results["slowdown_factor"]}x slower ({results["argon2_ms"]}ms) but highly secure',
            'recommendation': 'The performance trade-off is acceptable for security-critical applications'
        }
    }), 200


@app.route('/api/export/hashcat', methods=['GET'])
def export_hashcat():
    """
    Export database for Hashcat attack testing
    Format: username:hash (for MD5)
    """
    users = User.query.all()
    
    output_lines = []
    output_lines.append("# Authentication Security Lab - Hash Export")
    output_lines.append("# Format: username:hash")
    output_lines.append("# MD5 hashes can be cracked with: hashcat -m 0 hashes.txt wordlist.txt")
    output_lines.append("# Argon2 hashes are in format: hashcat -m 19100 hashes.txt wordlist.txt")
    output_lines.append("")
    
    for user in users:
        if user.algorithm == 'md5':
            output_lines.append(f"{user.username}:{user.password_hash}")
        elif user.algorithm == 'argon2':
            output_lines.append(f"# {user.username}:{user.password_hash[:50]}... (Argon2 - very difficult to crack)")
    
    # Save to file
    export_path = 'hashes.txt'
    with open(export_path, 'w') as f:
        f.write('\n'.join(output_lines))
    
    return send_file(export_path, as_attachment=True, download_name='hashes.txt')


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get statistics for dashboard"""
    total_users = User.query.count()
    md5_users = User.query.filter_by(algorithm='md5').count()
    argon2_users = User.query.filter_by(algorithm='argon2').count()
    upgraded_users = User.query.filter_by(upgraded=True).count()
    
    return jsonify({
        'success': True,
        'stats': {
            'total_users': total_users,
            'md5_users': md5_users,
            'argon2_users': argon2_users,
            'upgraded_users': upgraded_users,
            'security_score': round((argon2_users / total_users * 100) if total_users > 0 else 0, 1)
        }
    }), 200


@app.route('/api/config', methods=['GET'])
def get_config():
    """Get current security stage configuration"""
    return jsonify({
        'success': True,
        'config': {
            'security_stage': SECURITY_STAGE,
            'argon2_settings': {
                'time_cost': 3,
                'memory_cost': 65536,
                'parallelism': 2,
                'hash_len': 32,
                'salt_len': 16
            },
            'rate_limiting': {
                'max_attempts': MAX_LOGIN_ATTEMPTS,
                'lockout_minutes': LOCKOUT_DURATION.total_seconds() / 60
            }
        }
    }), 200


@app.route('/api/config/stage', methods=['POST'])
def set_security_stage():
    """Switch between security stages"""
    global SECURITY_STAGE
    data = request.json
    stage = data.get('stage', 'modern')
    
    if stage not in ['broken', 'modern']:
        return jsonify({'success': False, 'message': 'Invalid stage'}), 400
    
    SECURITY_STAGE = stage
    return jsonify({
        'success': True,
        'message': f'Security stage set to {stage}',
        'stage': SECURITY_STAGE
    }), 200


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'status': 'healthy',
        'database': 'connected',
        'security_stage': SECURITY_STAGE
    }), 200


@app.route('/api/analyze-hash', methods=['POST'])
def analyze_hash():
    """Analyze and identify hash format"""
    data = request.json
    hash_value = data.get('hash', '').strip()
    
    if not hash_value:
        return jsonify({'success': False, 'message': 'Hash required'}), 400
    
    analysis = {
        'hash': hash_value,
        'length': len(hash_value),
        'identified_algorithm': None,
        'details': {}
    }
    
    # MD5: 32 hex characters
    if len(hash_value) == 32 and all(c in '0123456789abcdefABCDEF' for c in hash_value):
        analysis['identified_algorithm'] = 'MD5'
        analysis['details'] = {
            'format': 'Hex',
            'output_size': '128 bits',
            'security': '⚠️ BROKEN - Do not use',
            'collision_resistant': 'No',
            'preimage_resistant': 'Partially (weakened)'
        }
    
    # SHA-1: 40 hex characters
    elif len(hash_value) == 40 and all(c in '0123456789abcdefABCDEF' for c in hash_value):
        analysis['identified_algorithm'] = 'SHA-1'
        analysis['details'] = {
            'format': 'Hex',
            'output_size': '160 bits',
            'security': '⚠️ DEPRECATED - Not for passwords',
            'collision_resistant': 'No (since 2017)',
            'preimage_resistant': 'Yes (for now)'
        }
    
    # BCrypt: starts with $2a$, $2b$, or $2y$
    elif hash_value.startswith(('$2a$', '$2b$', '$2y$')):
        parts = hash_value.split('$')
        if len(parts) >= 4:
            version = parts[1]
            cost = parts[2]
            analysis['identified_algorithm'] = 'BCrypt'
            analysis['details'] = {
                'format': 'Modular Crypt Format',
                'version': version,
                'cost_factor': cost,
                'iterations': f'2^{cost} = {2**int(cost):,}',
                'security': '✅ SECURE (if cost ≥ 10)',
                'salt_embedded': 'Yes',
                'recommended_cost': '10-12'
            }
    
    # Argon2: starts with $argon2
    elif hash_value.startswith('$argon2'):
        parts = hash_value.split('$')
        if len(parts) >= 5:
            variant = parts[1]  # argon2i, argon2d, or argon2id
            version = parts[2]
            params = dict(item.split('=') for item in parts[3].split(','))
            
            analysis['identified_algorithm'] = 'Argon2'
            analysis['details'] = {
                'format': 'PHC String Format',
                'variant': variant.upper(),
                'version': version,
                'memory_cost': f"{params.get('m', 'N/A')} KB",
                'time_cost': f"{params.get('t', 'N/A')} iterations",
                'parallelism': f"{params.get('p', 'N/A')} threads",
                'security': '✅ MOST SECURE - State of the art',
                'salt_embedded': 'Yes',
                'gpu_resistant': 'Yes (memory-hard)'
            }
    
    # PBKDF2: custom format pbkdf2:algorithm:iterations:salt:hash
    elif hash_value.startswith('pbkdf2:'):
        parts = hash_value.split(':')
        if len(parts) == 5:
            algorithm = parts[1]
            iterations = parts[2]
            analysis['identified_algorithm'] = 'PBKDF2'
            analysis['details'] = {
                'format': 'Custom Format',
                'hash_function': algorithm.upper(),
                'iterations': f'{iterations:,}',
                'security': '✅ SECURE (if iterations ≥ 600,000)',
                'salt_embedded': 'Yes',
                'nist_approved': 'Yes (FIPS 140-2)',
                'recommended_iterations': '600,000+'
            }
    
    else:
        analysis['identified_algorithm'] = 'Unknown'
        analysis['details'] = {
            'message': 'Could not identify hash format',
            'suggestions': [
                'MD5: 32 hex characters',
                'SHA-1: 40 hex characters',
                'BCrypt: Starts with $2a$, $2b$, $2y$',
                'Argon2: Starts with $argon2',
                'PBKDF2: Starts with pbkdf2:'
            ]
        }
    
    return jsonify({
        'success': True,
        'analysis': analysis
    }), 200


@app.route('/api/compare-hashes', methods=['POST'])
def compare_hashes():
    """Generate and compare same password across all algorithms"""
    data = request.json
    password = data.get('password', '')
    
    if not password:
        return jsonify({'success': False, 'message': 'Password required'}), 400
    
    comparison = {}
    
    # MD5
    start = time.time()
    md5_hash = generate_md5_hash(password)
    comparison['md5'] = {
        'hash': md5_hash,
        'length': len(md5_hash),
        'time_ms': round((time.time() - start) * 1000, 3),
        'salt': 'None',
        'security': '⚠️ BROKEN'
    }
    
    # Argon2
    start = time.time()
    peppered = apply_pepper(password)
    argon2_hash = generate_argon2_hash(peppered)
    comparison['argon2'] = {
        'hash': argon2_hash,
        'length': len(argon2_hash),
        'time_ms': round((time.time() - start) * 1000, 3),
        'salt': 'Embedded',
        'security': '✅ MOST SECURE'
    }
    
    # PBKDF2
    start = time.time()
    pbkdf2_hash, pbkdf2_salt = generate_pbkdf2_hash(password)
    comparison['pbkdf2'] = {
        'hash': pbkdf2_hash,
        'length': len(pbkdf2_hash),
        'time_ms': round((time.time() - start) * 1000, 3),
        'salt': pbkdf2_salt,
        'security': '✅ SECURE'
    }
    
    return jsonify({
        'success': True,
        'password': password,
        'comparison': comparison
    }), 200


@app.route('/api/crack-simulation', methods=['POST'])
def crack_simulation():
    """Simulate hash cracking with wordlist"""
    data = request.json
    target_hash = data.get('hash', '')
    algorithm = data.get('algorithm', 'md5')
    wordlist = data.get('wordlist', ['password', '123456', 'admin', 'welcome'])
    
    if not target_hash:
        return jsonify({'success': False, 'message': 'Hash required'}), 400
    
    start_time = time.time()
    attempts = 0
    found = False
    cracked_password = None
    
    for word in wordlist:
        attempts += 1
        
        # Generate hash based on algorithm
        if algorithm == 'md5':
            test_hash = generate_md5_hash(word)
        elif algorithm == 'argon2':
            peppered = apply_pepper(word)
            test_hash = generate_argon2_hash(peppered)
        elif algorithm == 'pbkdf2':
            test_hash, _ = generate_pbkdf2_hash(word)
        else:
            continue
        
        if test_hash == target_hash:
            found = True
            cracked_password = word
            break
    
    elapsed_time = time.time() - start_time
    
    return jsonify({
        'success': True,
        'found': found,
        'cracked_password': cracked_password,
        'attempts': attempts,
        'time_seconds': round(elapsed_time, 3),
        'rate_per_second': round(attempts / elapsed_time if elapsed_time > 0 else 0, 2)
    }), 200


# Initialize database tables
with app.app_context():
    db.create_all()
    print("✅ Database initialized")
    print(f"🔒 Security Stage: {SECURITY_STAGE}")
    print(f"🔐 Pepper Enabled: {HASH_PEPPER[:20]}...")
    print(f"📜 Password History: Last {MAX_PASSWORD_HISTORY} passwords")
    print(f"🚀 Server starting on http://localhost:5000")


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
