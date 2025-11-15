from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import shutil
import uuid
from datetime import datetime
from dotenv import load_dotenv

from ocr import summarize_pdf

load_dotenv()

app = FastAPI(title="OCR Receiver")

GROQ_API_KEY = os.getenv("GROQ_KEY")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/ocr")
async def upload_pdf(file: UploadFile = File(...)):
    """Receive a PDF, save it, summarize it, and return the summary."""
    if not file.filename.lower().endswith(".pdf") and file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    file_id = uuid.uuid4().hex
    safe_name = f"{file_id}.pdf"
    dest_path = os.path.join(UPLOAD_DIR, safe_name)

    try:
        # Save the PDF file
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract & summarize text
        summary = summarize_pdf(dest_path, GROQ_API_KEY)
        print(summary)

        # File metadata
        stat = os.stat(dest_path)

    finally:
        await file.close()

    return {
        "id": file_id,
        "filename": file.filename,
        "summary": summary,
        "stored_as": safe_name,
        "content_type": file.content_type,
        "size": stat.st_size,
        "path": dest_path,
        "uploaded_at": datetime.utcnow().isoformat() + "Z",
        "message": "Summary generated successfully",
    }


@app.get("/ocr/files")
def list_files():
    """List uploaded PDF files."""
    files = []
    for fname in os.listdir(UPLOAD_DIR):
        if fname.endswith(".pdf"):
            files.append({
                "stored_as": fname,
                "id": os.path.splitext(fname)[0]
            })
    return {"count": len(files), "files": files}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
