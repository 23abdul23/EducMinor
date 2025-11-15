# pdf_agent.py
from groq import Groq
from PyPDF2 import PdfReader


def extract_pdf_text(pdf_path: str) -> str:
    """
    Extract text from a PDF and return as a single string.
    """
    reader = PdfReader(pdf_path)
    text = ""

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"

    return text.strip()


def summarize_text_groq(text: str, api_key: str) -> str:
    """
    Summarize given text using Groq LLM API.
    """
    client = Groq(api_key=api_key)

    response = client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[
            {
                "role": "user",
                "content": f"Summarize the following text clearly:\n\n{text}"
            }
        ],
        temperature=0.2,
    )

    return response.choices[0].message["content"]


def summarize_pdf(pdf_path: str, api_key: str) -> str:
    """
    Main agent: extract text → summarize → return summary.
    """
    text = extract_pdf_text(pdf_path)

    if not text:
        return "No extractable text found in the PDF."

    return summarize_text_groq(text, api_key)
