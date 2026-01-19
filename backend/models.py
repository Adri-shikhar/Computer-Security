"""
Database Models for Authentication Security Lab
SQLAlchemy ORM models for User and LoginAttempt tracking
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    """
    User model storing authentication credentials
    
    Tracks:
    - Username (unique identifier)
    - Password hash (MD5 or Argon2)
    - Algorithm used (md5, sha1, bcrypt, argon2)
    - Salt value (NONE, EMBEDDED, or actual salt string)
    - Creation timestamp
    - Whether password was upgraded from legacy
    - Last successful login
    """
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(512), nullable=False)
    algorithm = db.Column(db.String(20), nullable=False)  # md5, sha1, bcrypt, argon2
    salt = db.Column(db.String(512))  # NONE, EMBEDDED, or salt value
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    upgraded = db.Column(db.Boolean, default=False)  # True if migrated from legacy
    
    # Relationships
    login_attempts = db.relationship('LoginAttempt', backref='user_ref', lazy=True, 
                                    foreign_keys='LoginAttempt.username',
                                    primaryjoin='User.username==LoginAttempt.username')
    
    def __repr__(self):
        return f'<User {self.username} ({self.algorithm})>'
    
    def to_dict(self):
        """Convert user to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'username': self.username,
            'algorithm': self.algorithm,
            'salt': self.salt,
            'hash': self.password_hash,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'upgraded': self.upgraded
        }


class LoginAttempt(db.Model):
    """
    Login attempt tracking for rate limiting and security monitoring
    
    Tracks:
    - Username attempted
    - Success/failure status
    - IP address of attempt
    - Timestamp
    """
    __tablename__ = 'login_attempts'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, index=True)
    success = db.Column(db.Boolean, nullable=False)
    ip_address = db.Column(db.String(45), nullable=True)  # IPv6 max length
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def __repr__(self):
        status = "SUCCESS" if self.success else "FAILED"
        return f'<LoginAttempt {self.username} {status} at {self.timestamp}>'
    
    def to_dict(self):
        """Convert login attempt to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'success': self.success,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat()
        }
