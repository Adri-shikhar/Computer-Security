"""
PDF Generator for Authentication Security Lab Explanation
Creates a professional presentation-ready PDF document
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from datetime import datetime
import os

def create_pdf_explanation():
    """Generate comprehensive PDF explanation"""
    
    # Create output directory if it doesn't exist
    output_dir = "docs"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    filename = os.path.join(output_dir, "Authentication_Security_Lab_Explanation.pdf")
    doc = SimpleDocTemplate(filename, pagesize=letter,
                           rightMargin=72, leftMargin=72,
                           topMargin=72, bottomMargin=18)
    
    # Container for the 'Flowable' objects
    story = []
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=HexColor('#2C3E50')
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=12,
        spaceBefore=20,
        textColor=HexColor('#34495E'),
        borderWidth=0,
        borderPadding=0
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading3'],
        fontSize=14,
        spaceAfter=10,
        spaceBefore=15,
        textColor=HexColor('#E74C3C'),
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=12,
        alignment=TA_JUSTIFY,
        leftIndent=20
    )
    
    quote_style = ParagraphStyle(
        'Quote',
        parent=styles['Normal'],
        fontSize=12,
        spaceAfter=15,
        leftIndent=30,
        rightIndent=30,
        fontName='Helvetica-Oblique',
        textColor=HexColor('#2980B9'),
        borderWidth=1,
        borderColor=HexColor('#BDC3C7'),
        borderPadding=10
    )
    
    # Title page
    story.append(Spacer(1, 2*inch))
    story.append(Paragraph("🔐 Authentication Security Lab", title_style))
    story.append(Paragraph("Project Explanation Guide", subtitle_style))
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
    story.append(PageBreak())
    
    # Opening Statement
    story.append(Paragraph("🎤 Project Overview", heading_style))
    story.append(Paragraph(
        '"This project demonstrates why storing passwords securely is critical, and how modern systems can upgrade from weak to strong security without disrupting users."',
        quote_style
    ))
    
    # The Problem
    story.append(Paragraph("❗ The Problem (Security Crisis)", heading_style))
    story.append(Paragraph(
        "When websites store passwords, they don't store them as plain text. They convert them into a 'hash' - a scrambled version. But here's the problem: <b>old algorithms like MD5 are too fast</b>. An attacker with a modern graphics card can try 200 billion password guesses per second. That means a simple password like 'password123' can be cracked in microseconds.",
        body_style
    ))
    
    # Create comparison table
    problem_data = [
        ['Algorithm', 'Hash Rate (RTX 4090)', 'Time to crack "password123"'],
        ['MD5 (Broken)', '200 billion/sec', '0.002 seconds'],
        ['SHA-1 (Weak)', '100 billion/sec', '0.004 seconds'],
        ['Argon2 (Secure)', '1,000/sec', '56 hours']
    ]
    
    problem_table = Table(problem_data, colWidths=[2*inch, 2*inch, 2.5*inch])
    problem_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#34495E')),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), HexColor('#ECF0F1')),
        ('GRID', (0, 0), (-1, -1), 1, HexColor('#BDC3C7'))
    ]))
    story.append(problem_table)
    story.append(Spacer(1, 20))
    
    # The Solution
    story.append(Paragraph("✅ The Solution (Modern Security)", heading_style))
    story.append(Paragraph(
        "Modern algorithms like <b>Argon2</b> solve this by being intentionally slow. They require a lot of memory - 64 megabytes per attempt. This means even a powerful GPU can only try 1,000 guesses per second instead of 200 billion. Same password, same attacker, but now it takes years instead of seconds.",
        body_style
    ))
    
    # What Our System Does
    story.append(Paragraph("🔧 What Our System Does", heading_style))
    
    features = [
        ("Registration", "Users can create accounts. We let them choose MD5 (weak) or Argon2 (strong) to show the difference."),
        ("Breach Time Estimator", "When you type a password, it calculates how long an attacker would need to crack it using different algorithms. You see in real-time that Argon2 takes millions of times longer."),
        ("Transparent Migration", "This is the clever part. When an old MD5 user logs in, we verify their password, then immediately re-hash it with Argon2 behind the scenes. The user doesn't notice anything, but their account is now secure."),
        ("Rate Limiting", "We also protect against brute force attacks. After 5 failed login attempts, the account locks for 15 minutes.")
    ]
    
    for title, description in features:
        story.append(Paragraph(f"<b>{title}:</b> {description}", body_style))
    
    story.append(PageBreak())
    
    # Technical Flow
    story.append(Paragraph("⚙️ Technical Flow", heading_style))
    story.append(Paragraph("Here's how a login works:", body_style))
    
    flow_steps = [
        "User sends username and password",
        "We check if they're rate-limited (too many failed attempts)",
        "We find their account and check which algorithm they use",
        "If MD5: we hash the password with MD5 and compare",
        "If the password matches AND they're using MD5, we automatically upgrade them to Argon2",
        "Next time they login, they'll use the secure algorithm"
    ]
    
    for i, step in enumerate(flow_steps, 1):
        story.append(Paragraph(f"{i}. {step}", body_style))
    
    story.append(Paragraph(
        "This is how real companies like Facebook and Google migrated billions of users to better security.",
        body_style
    ))
    
    # Why Argon2 is Special
    story.append(Paragraph("🏆 Why Argon2 is Special", heading_style))
    story.append(Paragraph(
        "Argon2 won the Password Hashing Competition in 2015. It has three key properties:",
        body_style
    ))
    
    argon2_features = [
        ("Memory-hard", "Requires 64MB of RAM per hash, so GPUs can't parallelize"),
        ("Time-cost", "We make it run 3 iterations, slowing it down"),
        ("Built-in salt", "Every hash is unique, even for identical passwords")
    ]
    
    for feature, description in argon2_features:
        story.append(Paragraph(f"<b>{feature}:</b> {description}", body_style))
    
    story.append(Paragraph(
        "The result: a password that takes 1 second to crack with MD5 would take 200 million seconds with Argon2.",
        quote_style
    ))
    
    # Security Comparison Table
    story.append(Paragraph("📊 Security Comparison", heading_style))
    
    comparison_data = [
        ['Password', 'MD5 (Broken)', 'Argon2 (Secure)', 'Improvement Factor'],
        ['pass', 'Instant', '7.6 minutes', '∞'],
        ['password123', '0.002 seconds', '56 hours', '100 million×'],
        ['P@ssw0rd!', '38 seconds', '1,200 years', '1 billion×'],
        ['MySecureP@ss123!', '38 years', '7.6 billion years', '200 million×']
    ]
    
    comparison_table = Table(comparison_data, colWidths=[1.8*inch, 1.5*inch, 1.5*inch, 1.7*inch])
    comparison_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#E74C3C')),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), HexColor('#FADBD8')),
        ('GRID', (0, 0), (-1, -1), 1, HexColor('#BDC3C7')),
        ('FONTSIZE', (0, 1), (-1, -1), 9)
    ]))
    story.append(comparison_table)
    story.append(Spacer(1, 20))
    
    # Key Takeaway
    story.append(Paragraph("🎯 Key Takeaway", heading_style))
    story.append(Paragraph(
        '"The main lesson is: <b>never use MD5 or SHA-1 for passwords</b>. Always use Argon2, bcrypt, or scrypt. And if you have legacy users, implement transparent migration - it upgrades security without forcing password resets."',
        quote_style
    ))
    
    # Real-World Impact
    story.append(Paragraph("🌍 Real-World Impact", heading_style))
    story.append(Paragraph(
        "In 2012, LinkedIn was breached and 117 million passwords were stolen. They used unsalted SHA-1. Within days, most passwords were cracked. If they had used Argon2, those same passwords would still be safe today - it would take centuries to crack them.",
        body_style
    ))
    
    # Glossary
    story.append(PageBreak())
    story.append(Paragraph("📚 Quick Glossary", heading_style))
    
    glossary_data = [
        ['Term', 'Simple Explanation'],
        ['Hash', 'One-way scrambling of a password'],
        ['Salt', 'Random data added to make each hash unique'],
        ['MD5', 'Old, fast, broken algorithm (1992)'],
        ['Argon2', 'Modern, slow, secure algorithm (2015)'],
        ['Brute Force', 'Trying every possible password'],
        ['Rate Limiting', 'Blocking after too many failed attempts'],
        ['Migration', 'Upgrading old hashes to new algorithm']
    ]
    
    glossary_table = Table(glossary_data, colWidths=[2*inch, 4.5*inch])
    glossary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), HexColor('#2980B9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), HexColor('#EBF5FB')),
        ('GRID', (0, 0), (-1, -1), 1, HexColor('#BDC3C7')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')
    ]))
    story.append(glossary_table)
    
    # Footer
    story.append(Spacer(1, 1*inch))
    story.append(Paragraph("📄 End of Document", styles['Normal']))
    story.append(Paragraph("Good luck with your explanation! 🎓", quote_style))
    
    # Build PDF
    doc.build(story)
    return filename

if __name__ == "__main__":
    try:
        filename = create_pdf_explanation()
        print(f"✅ PDF generated successfully: {filename}")
        print(f"📍 Full path: {os.path.abspath(filename)}")
    except Exception as e:
        print(f"❌ Error generating PDF: {e}")
        print("💡 Make sure to install reportlab: pip install reportlab")