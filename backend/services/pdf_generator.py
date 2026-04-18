from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib import colors
import io
import re


def highlight_keywords(line: str, keywords: set) -> str:
    """Highlight JD keywords in bold dark blue within the text."""
    if not keywords:
        return line
    words = line.split()
    result = []
    for word in words:
        clean = re.sub(r'[.,;:()\[\]]', '', word).lower()
        if clean in keywords:
            result.append(f'<font color="#1F4E79"><b>{word}</b></font>')
        else:
            result.append(word)
    return " ".join(result)


def generate_pdf(text: str, job_description: str = "") -> bytes:
    """
    Generate an ATS-friendly PDF matching a clean LaTeX-style resume template.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=36,
        bottomMargin=36
    )
    styles = getSampleStyleSheet()

    # ── Style Definitions ──
    name_style = ParagraphStyle(
        name="NameHeader",
        parent=styles["Normal"],
        fontSize=24,
        fontName="Helvetica-Bold",
        alignment=TA_CENTER,
        spaceAfter=2,
        textColor=colors.HexColor("#000000"),
    )

    contact_style = ParagraphStyle(
        name="ContactInfo",
        parent=styles["Normal"],
        fontSize=9.5,
        fontName="Helvetica",
        alignment=TA_CENTER,
        spaceAfter=2,
        textColor=colors.HexColor("#333333"),
        leading=12,
    )

    section_style = ParagraphStyle(
        name="SectionHeader",
        parent=styles["Normal"],
        fontSize=11,
        fontName="Helvetica-Bold",
        spaceBefore=6,
        spaceAfter=1,
        textColor=colors.HexColor("#000000"),
    )

    normal_style = ParagraphStyle(
        name="NormalText",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica",
        leading=12.5,
        spaceAfter=2,
        textColor=colors.HexColor("#111111"),
        alignment=TA_JUSTIFY,
    )

    bullet_style = ParagraphStyle(
        name="BulletPoint",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica",
        leading=12.5,
        spaceAfter=2,
        leftIndent=12,
        textColor=colors.HexColor("#111111"),
        alignment=TA_JUSTIFY,
    )

    sub_detail_style = ParagraphStyle(
        name="SubDetail",
        parent=styles["Normal"],
        fontSize=9,
        fontName="Helvetica-Oblique",
        leading=12,
        spaceAfter=1,
        textColor=colors.HexColor("#555555"),
    )

    bold_left_style = ParagraphStyle(
        name="BoldLeft",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica-Bold",
        leading=12.5,
        textColor=colors.HexColor("#000000"),
    )

    italic_right_style = ParagraphStyle(
        name="ItalicRight",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica-Oblique",
        leading=12.5,
        alignment=2,  # TA_RIGHT
        textColor=colors.HexColor("#333333"),
    )

    # ── JD keywords for highlighting ──
    stopwords = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at",
        "to", "for", "of", "with", "is", "are", "was", "were",
        "be", "been", "have", "has", "i", "we", "you", "they",
        "it", "this", "that", "from", "by", "as", "not", "will",
        "our", "your", "their", "about", "also", "other", "into",
        "can", "all", "more", "such", "than", "may", "should",
        "would", "could", "who", "what", "when", "where", "how",
    }

    jd_keywords = set()
    if job_description:
        for word in job_description.lower().split():
            clean = re.sub(r'[.,;:()\[\]]', '', word)
            if clean and clean not in stopwords and len(clean) > 2:
                jd_keywords.add(clean)

    # ── Parse lines ──
    content = []
    lines = text.split("\n")

    section_keywords = {
        "summary", "skills", "experience", "projects", "education",
        "profile", "work experience", "languages", "achievements",
        "internship", "certifications", "objective", "references",
        "certifications & achievements", "professional summary",
        "technical skills", "declaration",
    }

    # Phase 1: Find name and contact info
    name = ""
    contact_parts = []
    body_start = 0

    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            continue
        if not name:
            name = stripped
            body_start = i + 1
            continue
        lower = stripped.lower()
        is_contact = any(kw in lower for kw in ["@", "phone", "email", "linkedin", "github", "+91", "http", ".com", ".in"])
        is_address = bool(re.search(r'\d+.*,', stripped)) and len(stripped) < 80
        is_phone = bool(re.match(r'^\(?\+?\d[\d\s\-()]{6,}', stripped))

        if is_contact or is_address or is_phone:
            contact_parts.append(stripped)
            body_start = i + 1
        else:
            body_start = i
            break

    # Add name
    if name:
        content.append(Paragraph(name, name_style))

    # Add contact info (all on one/two lines)
    if contact_parts:
        contact_text = " &nbsp;|&nbsp; ".join(contact_parts)
        content.append(Paragraph(contact_text, contact_style))

    # Top divider
    content.append(HRFlowable(
        width="100%", thickness=1.5,
        color=colors.HexColor("#000000"),
        spaceAfter=6, spaceBefore=1
    ))

    # Phase 2: Process body
    remaining = lines[body_start:]

    for line in remaining:
        stripped = line.strip()

        if not stripped:
            content.append(Spacer(1, 3))
            continue

        stripped_lower = stripped.lower().rstrip(":")

        # Section Header
        if (
            stripped_lower in section_keywords or
            (stripped == stripped.upper() and len(stripped) > 2 and len(stripped) < 40 and re.search(r'[A-Z]', stripped))
        ):
            section_name = stripped.rstrip(":").upper()
            content.append(Spacer(1, 6))
            content.append(Paragraph(f"<b>{section_name}</b>", section_style))
            content.append(HRFlowable(
                width="100%", thickness=1,
                color=colors.HexColor("#000000"),
                spaceAfter=4, spaceBefore=0
            ))
            continue

        # Bullet Points
        if stripped.startswith("-") or stripped.startswith("•") or stripped.startswith("*"):
            clean = stripped.lstrip("-•* ").strip()
            highlighted = highlight_keywords(clean, jd_keywords)
            content.append(Paragraph(f"&bull; {highlighted}", bullet_style))
            continue

        # Experience/Project heading with dates (e.g., "Company | Role | Duration")
        if "|" in stripped and (
            re.search(r'\d{4}', stripped) or
            re.search(r'present|week|month', stripped, re.IGNORECASE)
        ):
            parts = stripped.split("|")
            if len(parts) >= 2:
                left_text = " | ".join(p.strip() for p in parts[:-1])
                right_text = parts[-1].strip()
                left_para = Paragraph(f"<b>{left_text}</b>", bold_left_style)
                right_para = Paragraph(f"<i>{right_text}</i>", italic_right_style)
                t = Table(
                    [[left_para, right_para]],
                    colWidths=[doc.width * 0.72, doc.width * 0.28]
                )
                t.setStyle(TableStyle([
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 0),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                    ('TOPPADDING', (0, 0), (-1, -1), 1),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
                ]))
                content.append(t)
            else:
                content.append(Paragraph(f"<b>{stripped}</b>", bold_left_style))
            continue

        # Skill/label lines (e.g., "Languages: Java, Python, SQL")
        if ":" in stripped and stripped.index(":") < 25 and not stripped.startswith("http"):
            colonIdx = stripped.index(":")
            label = stripped[:colonIdx].strip()
            value = stripped[colonIdx + 1:].strip()
            highlighted_value = highlight_keywords(value, jd_keywords)
            content.append(Paragraph(
                f"<b>{label}:</b> {highlighted_value}",
                normal_style
            ))
            continue

        # Regular text
        highlighted = highlight_keywords(stripped, jd_keywords)
        content.append(Paragraph(highlighted, normal_style))

    # Build PDF
    doc.build(content)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf