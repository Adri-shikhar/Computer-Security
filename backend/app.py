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
from models import db, User, LoginAttempt
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
        # Stage 2: Modern, secure hashing
        hash_value = generate_argon2_hash(password)
        salt = 'EMBEDDED'  # Argon2 embeds salt in hash
    else:
        return jsonify({'success': False, 'message': 'Invalid algorithm'}), 400
    
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


# Initialize database tables
with app.app_context():
    db.create_all()
    print("✅ Database initialized")
    print(f"🔒 Security Stage: {SECURITY_STAGE}")
    print(f"🚀 Server starting on http://localhost:5000")


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
