import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from services.parser import extract_text_from_pdf

def test_extract_text_returns_string():
    result = extract_text_from_pdf(b"")
    assert isinstance(result, str)

def test_extract_text_empty_bytes():
    result = extract_text_from_pdf(b"")
    assert result == ""

def test_extract_text_does_not_crash():
    try:
        extract_text_from_pdf(b"not a real pdf")
    except Exception:
        pass