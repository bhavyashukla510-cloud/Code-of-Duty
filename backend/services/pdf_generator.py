from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib import colors
import io

def highlight_keywords(line: str, keywords: set) -> str:
    words = line.split()
    result = []
    for word in words:
        clean = word.strip(".,;:()[]").lower()
        if clean in keywords:
            result.append(f'<font color="#B8960C"><b>{word}</b></font>')
        else:
            result.append(word)
    return " ".join(result)

def generate_pdf(text: str, job_description: str = "") -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=30,
        bottomMargin=30
    )
    styles = getSampleStyleSheet()

    name_style = ParagraphStyle(
        name="Name",
        parent=styles["Normal"],
        fontSize=24,
        textColor=colors.white,
        fontName="Helvetica-Bold",
        spaceAfter=4
    )

    title_style = ParagraphStyle(
        name="Title",
        parent=styles["Normal"],
        fontSize=11,
        textColor=colors.HexColor("#CCCCCC"),
        fontName="Helvetica",
        spaceAfter=0
    )

    section_style = ParagraphStyle(
        name="Section",
        parent=styles["Normal"],
        fontSize=11,
        textColor=colors.HexColor("#1F4E79"),
        fontName="Helvetica-Bold",
        spaceBefore=10,
        spaceAfter=4
    )

    job_title_style = ParagraphStyle(
        name="JobTitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#555555"),
        fontName="Helvetica-Oblique",
        spaceAfter=2
    )

    normal_style = ParagraphStyle(
        name="NormalText",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        spaceAfter=3,
        textColor=colors.HexColor("#333333")
    )

    bullet_style = ParagraphStyle(
        name="Bullet",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        spaceAfter=3,
        leftIndent=12,
        textColor=colors.HexColor("#333333")
    )

    bold_style = ParagraphStyle(
        name="Bold",
        parent=styles["Normal"],
        fontSize=10,
        fontName="Helvetica-Bold",
        spaceAfter=2,
        textColor=colors.HexColor("#222222")
    )

    common_words = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at",
        "to", "for", "of", "with", "is", "are", "was", "were",
        "be", "been", "have", "has", "i", "we", "you", "they",
        "it", "this", "that", "from", "by", "as", "not", "will"
    }

    jd_keywords = set()
    if job_description:
        for word in job_description.lower().split():
            clean = word.strip(".,;:()[]")
            if clean and clean not in common_words and len(clean) > 2:
                jd_keywords.add(clean)

    content = []
    lines = text.split("\n")
    name = ""
    job_title = ""
    remaining_lines = []

    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
        if not name:
            name = line
        elif not job_title:
            job_title = line
        else:
            remaining_lines = lines[i:]
            break

    header_data = [[
        Paragraph(f"{name}<br/><font size=11 color='#CCCCCC'>{job_title}</font>", name_style)
    ]]

    header_table = Table(header_data, colWidths=[515])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#1F4E79")),
        ('PADDING', (0, 0), (-1, -1), 20),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    content.append(header_table)
    content.append(Spacer(1, 12))

    for line in remaining_lines:
        line = line.strip()

        if not line:
            content.append(Spacer(1, 6))
            continue

        if (
            line.isupper() or
            line.endswith(":") or
            line in ["SUMMARY", "SKILLS", "EXPERIENCE", "PROJECTS",
                     "EDUCATION", "PROFILE", "WORK EXPERIENCE",
                     "CONTACT", "LANGUAGES", "REFERENCE", "ACHIEVEMENTS",
                     "INTERNSHIP", "CERTIFICATIONS", "DECLARATION", "REFERENCES"]
        ):
            content.append(HRFlowable(
                width="100%",
                thickness=1,
                color=colors.HexColor("#1F4E79"),
                spaceAfter=4
            ))
            content.append(Paragraph(line, section_style))

        elif line.startswith("-") or line.startswith("•"):
            clean = line.replace("-", "").replace("•", "").strip()
            highlighted = highlight_keywords(clean, jd_keywords) if jd_keywords else clean
            content.append(Paragraph("• " + highlighted, bullet_style))

        elif any(char.isdigit() for char in line) and (
            "20" in line or "19" in line or "PRESENT" in line.upper()
        ):
            content.append(Paragraph(line, bold_style))

        elif line.startswith("GPA") or line.startswith("Phone") or line.startswith("Email"):
            content.append(Paragraph(line, normal_style))

        else:
            highlighted = highlight_keywords(line, jd_keywords) if jd_keywords else line
            content.append(Paragraph(highlighted, normal_style))

    doc.build(content)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf