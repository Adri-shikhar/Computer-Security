"""
Setup Script for Authentication Security Lab
Initializes the database and creates sample data
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
from app import app, db, User, generate_md5_hash, generate_argon2_hash
import secrets


def create_sample_users():
    """Create sample users for demonstration"""
    
    with app.app_context():
        # Clear existing data
        User.query.delete()
        db.session.commit()
        
        print("🔄 Creating sample users...")
        
        # Sample users with different security levels
        users = [
            # BROKEN: MD5 without salt
            {
                'username': 'alice_legacy',
                'password': 'password123',
                'algorithm': 'md5',
                'salt': 'NONE'
            },
            # WEAK: MD5 with salt (still bad)
            {
                'username': 'bob_salted',
                'password': 'welcome2024',
                'algorithm': 'md5',
                'salt': secrets.token_hex(16)
            },
            # SECURE: Argon2id
            {
                'username': 'charlie_secure',
                'password': 'MySecureP@ss123!',
                'algorithm': 'argon2',
                'salt': 'EMBEDDED'
            },
            # For testing migration
            {
                'username': 'diana_migrate',
                'password': 'test1234',
                'algorithm': 'md5',
                'salt': 'NONE'
            }
        ]
        
        for user_data in users:
            username = user_data['username']
            password = user_data['password']
            algorithm = user_data['algorithm']
            salt = user_data['salt']
            
            # Generate appropriate hash
            if algorithm == 'md5':
                if salt == 'NONE':
                    hash_value = generate_md5_hash(password)
                else:
                    hash_value = generate_md5_hash(password, salt)
            elif algorithm == 'argon2':
                hash_value = generate_argon2_hash(password)
            
            user = User(
                username=username,
                password_hash=hash_value,
                algorithm=algorithm,
                salt=salt,
                upgraded=False
            )
            
            db.session.add(user)
            print(f"  ✅ Created: {username} ({algorithm})")
        
        db.session.commit()
        
        print(f"\n✅ Successfully created {len(users)} sample users")
        print("\nCredentials:")
        print("  alice_legacy / password123 (MD5, no salt)")
        print("  bob_salted / welcome2024 (MD5, salted)")
        print("  charlie_secure / MySecureP@ss123! (Argon2)")
        print("  diana_migrate / test1234 (MD5, will auto-upgrade)")


def show_database_info():
    """Display database information"""
    with app.app_context():
        total = User.query.count()
        md5 = User.query.filter_by(algorithm='md5').count()
        argon2 = User.query.filter_by(algorithm='argon2').count()
        
        print("\n" + "=" * 60)
        print("📊 DATABASE STATISTICS")
        print("=" * 60)
        print(f"Total Users:  {total}")
        print(f"MD5 Users:    {md5} (VULNERABLE)")
        print(f"Argon2 Users: {argon2} (SECURE)")
        print(f"Security Score: {round((argon2/total*100) if total > 0 else 0, 1)}%")
        print("=" * 60)


if __name__ == '__main__':
    print("=" * 60)
    print("🚀 AUTHENTICATION SECURITY LAB - SETUP")
    print("=" * 60)
    
    with app.app_context():
        # Create tables
        print("\n📦 Creating database tables...")
        db.create_all()
        print("✅ Tables created")
        
        # Create sample users
        create_sample_users()
        
        # Show stats
        show_database_info()
        
        print("\n✅ Setup complete!")
        print("\nNext steps:")
        print("  1. python app.py          # Start the Flask server")
        print("  2. python attack_toolkit.py  # Export hashes for testing")
        print("  3. Open http://localhost:5000  # Access the API")
