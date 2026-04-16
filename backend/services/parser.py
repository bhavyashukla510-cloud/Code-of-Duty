import io
from pdfminer.high_level import extract_text

def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_file = io.BytesIO(file_content)
        text = extract_text(pdf_file)
        cleaned_text = text.strip()
        return cleaned_text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""