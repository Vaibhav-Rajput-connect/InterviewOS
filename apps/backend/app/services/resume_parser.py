import os
import fitz  # PyMuPDF
from fastapi import HTTPException, status
from pathlib import Path

class ResumeParser:
    """
    Handles extracting raw text securely from a given PDF or DOCX file path.
    Currently optimized for PDFs using PyMuPDF (fitz).
    """

    @staticmethod
    def extract_text(file_path: str) -> str:
        """
        Extracts all text from a PDF file.
        Throws a 400 Bad Request if the file is invalid or unreadable.
        """
        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Resume file not found at path: {file_path}"
            )
            
        ext = Path(file_path).suffix.lower()
        
        if ext == '.pdf':
            return ResumeParser._extract_from_pdf(file_path)
        elif ext == '.docx':
            # Stub for DOCX, could use python-docx later
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="DOCX extraction is not implemented yet. Please upload a PDF."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format: {ext}"
            )

    @staticmethod
    def _extract_from_pdf(file_path: str) -> str:
        extracted_text = []
        try:
            doc = fitz.open(file_path)
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                # 'text' extracts the text naturally
                text = page.get_text("text")
                if text:
                    extracted_text.append(text)
                    
            doc.close()
            
            full_text = "\n".join(extracted_text)
            full_text = ResumeParser.clean_text(full_text)
            
            if not full_text:
                raise ValueError("No text could be extracted. The PDF might be scanned or empty.")
                
            # Optionally format with sections
            sections = ResumeParser.detect_sections(full_text)
            if sections:
                formatted_text = ""
                for sec, content in sections.items():
                    formatted_text += f"\n--- {sec.upper()} ---\n{content}\n"
                return formatted_text.strip()
                
            return full_text
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse PDF: {str(e)}"
            )

    @staticmethod
    def clean_text(text: str) -> str:
        """
        Normalizes unicode, cleans up whitespace and removes excessive newlines.
        """
        import unicodedata
        import re
        
        # Normalize unicode characters
        text = unicodedata.normalize("NFKC", text)
        
        # Replace non-breaking spaces
        text = text.replace('\xa0', ' ')
        
        # Replace multiple spaces with a single space
        text = re.sub(r'[ \t]+', ' ', text)
        
        # Replace 3 or more newlines with exactly 2 newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        return text.strip()

    @staticmethod
    def detect_sections(text: str) -> dict:
        """
        Heuristic-based section detection.
        Looks for common resume headers.
        """
        import re
        
        headers = [
            "EDUCATION", "EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE",
            "SKILLS", "TECHNICAL SKILLS", "PROJECTS", "PERSONAL PROJECTS",
            "SUMMARY", "OBJECTIVE", "CERTIFICATIONS", "PUBLICATIONS"
        ]
        
        # Build a regex that matches these headers exactly on a line, optionally with a colon
        # Make it case-insensitive but we'll normalize matches
        header_pattern = re.compile(
            r'^(?P<header>' + '|'.join(headers) + r')\s*:?\s*$',
            re.IGNORECASE | re.MULTILINE
        )
        
        sections = {}
        matches = list(header_pattern.finditer(text))
        
        if not matches:
            return {} # Fallback to no sections
            
        # First chunk is usually the summary/header info before the first explicit section
        if matches[0].start() > 0:
            sections['HEADER'] = text[0:matches[0].start()].strip()
            
        for i, match in enumerate(matches):
            header_name = match.group('header').upper()
            start_idx = match.end()
            
            if i + 1 < len(matches):
                end_idx = matches[i+1].start()
            else:
                end_idx = len(text)
                
            content = text[start_idx:end_idx].strip()
            if content:
                sections[header_name] = content
                
        return sections
