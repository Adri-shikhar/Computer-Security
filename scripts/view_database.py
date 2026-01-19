import sqlite3
import os

# Get the correct database path
db_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'instance', 'auth_security_lab.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("\n" + "="*60)
print("📊 DATABASE CONTENTS")
print("="*60)

cursor.execute('SELECT username, algorithm, upgraded, created_at FROM users')
users = cursor.fetchall()

print(f"\n{'Username':<20} {'Algorithm':<15} {'Upgraded':<10} {'Created'}")
print("-"*70)

for user in users:
    upgraded_mark = "✓ YES" if user[2] else "-"
    print(f"{user[0]:<20} {user[1].upper():<15} {upgraded_mark:<10} {user[3][:19]}")

cursor.execute('SELECT COUNT(*) FROM users')
total = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM users WHERE algorithm = "md5"')
md5_count = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM users WHERE algorithm = "argon2"')
argon2_count = cursor.fetchone()[0]

print("\n" + "="*60)
print("📈 STATISTICS")
print("="*60)
print(f"Total Users:     {total}")
print(f"MD5 Users:       {md5_count} (VULNERABLE)")
print(f"Argon2 Users:    {argon2_count} (SECURE)")
print(f"Security Score:  {round(argon2_count/total*100 if total > 0 else 0, 1)}%")
print("="*60)

conn.close()
