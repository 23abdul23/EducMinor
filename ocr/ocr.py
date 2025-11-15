# pdf_agent.py
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage, SystemMessage
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
    Summarize given text using Groq LLM API through the ChatGroq LangChain wrapper.
    """
    chat = ChatGroq(
        api_key=api_key,
        model_name="llama-3.1-8b-instant",
        temperature=0.2,
    )

    messages = [
        SystemMessage(
            content=(
                "You are a helpful assistant that summarizes PDF text into a clear, concise overview."
            )
        ),
        HumanMessage(
            content=f"Summarize the following text clearly:\n\n{text}"
        ),
    ]

    response = chat.invoke(messages)
    if isinstance(response.content, str):
        return response.content

    # In some LangChain versions content can be a list of blocks
    try:
        return " ".join(
            block["text"] if isinstance(block, dict) else str(block)
            for block in response.content
        )
    except Exception:
        return str(response.content)


def summarize_pdf(pdf_path: str, api_key: str) -> str:
    """
    Main agent: extract text → summarize → return summary.
    """
    text = extract_pdf_text(pdf_path)

    if not text:
        return "No extractable text found in the PDF."

    return summarize_text_groq(text, api_key)
