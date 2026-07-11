import os
import shutil
from pathlib import Path
from fastapi import UploadFile

# Use a local directory for now. In production, this would be an S3 abstraction.
UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class StorageService:
    @staticmethod
    async def save_upload_file(upload_file: UploadFile, destination_filename: str) -> str:
        """
        Saves an uploaded file to local storage and returns the file path/URL.
        """
        file_path = UPLOAD_DIR / destination_filename
        
        # Read and write in chunks to avoid memory issues with large files
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(upload_file.file, buffer)
        finally:
            upload_file.file.close()
            
        return str(file_path)

    @staticmethod
    def get_file_path(filename: str) -> Path:
        return UPLOAD_DIR / filename
