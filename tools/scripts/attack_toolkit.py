"""
Attack Toolkit for Security Testing
Helper scripts for penetration testing and hash cracking

EDUCATIONAL USE ONLY - For security research and testing
"""

import sqlite3
import sys
import os

# Add backend to path for database access
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))


def export_hashes_for_hashcat():
    """
    Export database hashes to hashcat-compatible format
    
    Output Formats:
    - MD5 (mode 0): username:hash
    - MD5 + Salt (mode 20): hash:salt
    - Argon2 (mode 19100): hash_string
    """
    print("=" * 60)
    print("🔓 HASH EXPORT TOOL FOR HASHCAT")
    print("=" * 60)
    
    # Connect to database
    try:
        db_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'instance', 'auth_security_lab.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT username, password_hash, algorithm, salt FROM users")
        users = cursor.fetchall()
        
        if not users:
            print("❌ No users found in database")
            return
        
        # Separate by algorithm
        md5_nosalt = []
        md5_salted = []
        argon2_hashes = []
        
        for username, hash_value, algorithm, salt in users:
            if algorithm == 'md5':
                if salt == 'NONE':
                    md5_nosalt.append(f"{username}:{hash_value}")
                else:
                    md5_salted.append(f"{hash_value}:{salt}")
            elif algorithm == 'argon2':
                argon2_hashes.append(hash_value)
        
        # Write to files
        if md5_nosalt:
            with open('md5_nosalt.txt', 'w') as f:
                f.write('\n'.join(md5_nosalt))
            print(f"\n✅ Exported {len(md5_nosalt)} MD5 (no salt) hashes to: md5_nosalt.txt")
            print("\n📋 HASHCAT COMMAND:")
            print("   hashcat -m 0 md5_nosalt.txt wordlist.txt")
            print("   hashcat -m 0 md5_nosalt.txt -a 3 ?a?a?a?a?a?a?a?a  (brute force)")
        
        if md5_salted:
            with open('md5_salted.txt', 'w') as f:
                f.write('\n'.join(md5_salted))
            print(f"\n✅ Exported {len(md5_salted)} MD5 (salted) hashes to: md5_salted.txt")
            print("\n📋 HASHCAT COMMAND:")
            print("   hashcat -m 20 md5_salted.txt wordlist.txt")
        
        if argon2_hashes:
            with open('argon2_hashes.txt', 'w') as f:
                f.write('\n'.join(argon2_hashes))
            print(f"\n✅ Exported {len(argon2_hashes)} Argon2 hashes to: argon2_hashes.txt")
            print("\n📋 HASHCAT COMMAND:")
            print("   hashcat -m 19100 argon2_hashes.txt wordlist.txt")
            print("\n⚠️  WARNING: Argon2 cracking is EXTREMELY slow (memory-hard)")
            print("   Expected speed: ~1-10 H/s (hashes per second)")
            print("   Compare to MD5: ~20,000,000,000 H/s on RTX 4090")
        
        conn.close()
        
        print("\n" + "=" * 60)
        print("📖 HASHCAT MODE REFERENCE:")
        print("   -m 0     = MD5")
        print("   -m 20    = MD5(salt.pass)")
        print("   -m 100   = SHA1")
        print("   -m 3200  = BCrypt")
        print("   -m 19100 = Argon2id")
        print("=" * 60)
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)


def generate_sample_wordlist():
    """Generate a sample wordlist for testing"""
    common_passwords = [
        "password", "123456", "password123", "admin", "letmein",
        "welcome", "monkey", "dragon", "master", "sunshine",
        "princess", "qwerty", "starwars", "cheese", "computer",
        "Password1", "Admin123", "Welcome1", "Test1234", "User123"
    ]
    
    with open('wordlist.txt', 'w') as f:
        f.write('\n'.join(common_passwords))
    
    print(f"✅ Generated wordlist.txt with {len(common_passwords)} common passwords")


def show_crack_statistics():
    """Show expected crack times based on algorithm"""
    print("\n" + "=" * 60)
    print("⏱️  ESTIMATED CRACK TIMES (RTX 4090 GPU)")
    print("=" * 60)
    
    stats = [
        ("MD5 (no salt)", "200,000 MH/s", "8-char: ~30 seconds", "CRITICAL RISK"),
        ("MD5 (salted)", "200,000 MH/s", "8-char: ~30 seconds", "CRITICAL RISK"),
        ("SHA-1", "100,000 MH/s", "8-char: ~1 minute", "HIGH RISK"),
        ("BCrypt (cost 10)", "100 kH/s", "8-char: ~2 years", "MEDIUM RISK"),
        ("Argon2id (our config)", "~5 H/s", "8-char: 100+ years", "LOW RISK"),
    ]
    
    for algo, speed, crack_time, risk in stats:
        print(f"\n{algo}:")
        print(f"  Speed:      {speed}")
        print(f"  Crack Time: {crack_time}")
        print(f"  Risk Level: {risk}")
    
    print("\n" + "=" * 60)


def show_attack_strategies():
    """Show common attack strategies"""
    print("\n" + "=" * 60)
    print("🎯 COMMON ATTACK STRATEGIES")
    print("=" * 60)
    
    print("\n1. DICTIONARY ATTACK")
    print("   Use wordlist of common passwords")
    print("   Command: hashcat -m 0 hashes.txt rockyou.txt")
    
    print("\n2. BRUTE FORCE")
    print("   Try all possible combinations")
    print("   Command: hashcat -m 0 hashes.txt -a 3 ?a?a?a?a?a?a")
    
    print("\n3. RULE-BASED ATTACK")
    print("   Apply rules to wordlist (append digits, capitalize, etc.)")
    print("   Command: hashcat -m 0 hashes.txt wordlist.txt -r rules/best64.rule")
    
    print("\n4. HYBRID ATTACK")
    print("   Combine wordlist with brute force")
    print("   Command: hashcat -m 0 hashes.txt -a 6 wordlist.txt ?d?d?d")
    
    print("\n5. RAINBOW TABLE ATTACK (MD5 no salt only)")
    print("   Pre-computed hash tables")
    print("   Online tools: CrackStation, HashKiller")
    
    print("\n" + "=" * 60)


def main():
    """Main attack toolkit menu"""
    print("\n" + "=" * 60)
    print("🔓 AUTHENTICATION SECURITY LAB - ATTACK TOOLKIT")
    print("   For Educational and Security Research Only")
    print("=" * 60)
    
    print("\nOptions:")
    print("  1. Export hashes for Hashcat")
    print("  2. Generate sample wordlist")
    print("  3. Show crack time statistics")
    print("  4. Show attack strategies")
    print("  5. Export all & show commands")
    
    choice = input("\nSelect option (1-5): ").strip()
    
    if choice == '1':
        export_hashes_for_hashcat()
    elif choice == '2':
        generate_sample_wordlist()
    elif choice == '3':
        show_crack_statistics()
    elif choice == '4':
        show_attack_strategies()
    elif choice == '5':
        export_hashes_for_hashcat()
        generate_sample_wordlist()
        show_crack_statistics()
        show_attack_strategies()
    else:
        print("❌ Invalid option")


if __name__ == '__main__':
    main()
