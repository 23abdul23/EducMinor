#!/usr/bin/env python3
"""
PDF OCR + Groq summarization agent

Usage (CLI):
  python agent.py /absolute/path/to/file.pdf

Environment variables:
  GROQ_API_URL     Full Groq inference endpoint (e.g. https://api.groq.cloud/v1/models/your-model/completions)
  GROQ_API_KEY     Your Groq API key
  POPPLER_PATH     (optional, Windows) path to poppler bin for pdf2image

Notes:
  - Requires Tesseract installed and on PATH (or set TESSERACT_CMD environment var used by pytesseract).
  - pdf2image requires poppler. On Windows, set POPPLER_PATH to the directory that contains poppler's "pdftoppm".
  - This script uses requests to call the Groq API; supply a valid GROQ_API_URL and GROQ_API_KEY.
"""
import os
import sys
import math
import json
import textwrap
from typing import List

try:
    from pdf2image import convert_from_path
    from PIL import Image
    import pytesseract
    import requests
except Exception as e:
    print("Missing dependency at runtime:", e)
    print("Install required packages: see ocr/requirements.txt")
    raise


def pdf_to_text(pdf_path: str, poppler_path: str = None, dpi: int = 300) -> str:
    """Convert PDF to text by rendering pages and applying Tesseract OCR."""
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(pdf_path)

    convert_kwargs = {"dpi": dpi}
    if poppler_path:
        convert_kwargs["poppler_path"] = poppler_path

    images = convert_from_path(pdf_path, **convert_kwargs)

    texts: List[str] = []
    for i, img in enumerate(images):
        # Convert image to RGB if needed
        if img.mode != "RGB":
            img = img.convert("RGB")
        page_text = pytesseract.image_to_string(img)
        texts.append(page_text)

    full_text = "\n\n".join(texts)
    return full_text


def chunk_text(text: str, max_chars: int = 15000) -> List[str]:
    """Chunk text roughly by splitting on paragraph boundaries to stay under max_chars."""
    if len(text) <= max_chars:
        return [text]

    paragraphs = [p for p in text.split("\n\n") if p.strip()]
    chunks: List[str] = []
    current = []
    curr_len = 0
    for p in paragraphs:
        if curr_len + len(p) + 2 > max_chars and current:
            chunks.append("\n\n".join(current))
            current = [p]
            curr_len = len(p)
        else:
            current.append(p)
            curr_len += len(p) + 2
    if current:
        chunks.append("\n\n".join(current))
    return chunks


def summarize_with_groq(prompt: str, api_url: str, api_key: str, timeout: int = 60) -> str:
    """Call Groq API to summarize the prompt. Expects a JSON response containing text in common fields.

    The exact request shape may vary depending on your Groq model/endpoint. This function sends a
    generic payload and attempts to extract a sensible text result from the response.
    """
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {"input": prompt}

    resp = requests.post(api_url, headers=headers, json=payload, timeout=timeout)
    resp.raise_for_status()
    data = resp.json()

    # Try common fields returned by LLM endpoints
    if isinstance(data, dict):
        # check for `output` field
        if "output" in data and isinstance(data["output"], str):
            return data["output"].strip()
        # check choices
        if "choices" in data and isinstance(data["choices"], list) and data["choices"]:
            c = data["choices"][0]
            if isinstance(c, dict):
                for key in ("text", "message", "output"):
                    if key in c and isinstance(c[key], str):
                        return c[key].strip()
            elif isinstance(c, str):
                return c.strip()
        # check top-level `result` or `summary`
        for key in ("result", "summary", "text"):
            if key in data and isinstance(data[key], str):
                return data[key].strip()

    # Fallback: return the raw JSON
    return json.dumps(data, indent=2)


def summarize_text_via_groq(full_text: str, api_url: str, api_key: str) -> str:
    # If text is too large, chunk and summarize iteratively
    chunks = chunk_text(full_text, max_chars=15000)
    summaries = []
    for i, chunk in enumerate(chunks, start=1):
        prompt = (
            f"You are a helpful assistant. Summarize the following extracted text from a PDF. ````\n"
            f"Chunk {i}/{len(chunks)}\n\n{chunk}\n"  # keep it explicit for the model
            "````\n\nProvide a concise summary (2-4 sentences) and then 5 bullet points with the most important facts."
        )
        print(f"Calling Groq for chunk {i}/{len(chunks)} (approx {len(chunk)} chars)")
        out = summarize_with_groq(prompt, api_url, api_key)
        summaries.append(out)

    if len(summaries) == 1:
        return summaries[0]

    # Combine chunk summaries into a final summary
    combined_prompt = (
        "You are a helpful assistant. Combine and condense the following chunk summaries into a single concise summary:\n\n"
        + "\n\n---SUMMARY PARTS---\n\n"
        + "\n\n".join(summaries)
        + "\n\nProvide a short final summary (3-5 sentences) and 7 bullet points with the key takeaways."
    )

    return summarize_with_groq(combined_prompt, api_url, api_key)


def process_pdf_and_summarize(pdf_path: str) -> dict:
    poppler_path = os.environ.get("POPPLER_PATH")
    groq_api_url = os.environ.get("GROQ_API_URL")
    groq_api_key = os.environ.get("GROQ_API_KEY")

    if not groq_api_url or not groq_api_key:
        raise RuntimeError("GROQ_API_URL and GROQ_API_KEY must be set in the environment")

    print("Performing OCR on:", pdf_path)
    extracted = pdf_to_text(pdf_path, poppler_path=poppler_path)
    extracted = extracted.strip()

    if not extracted:
        return {"summary": "", "error": "No text extracted from PDF."}

    # Optionally truncate very large leading/trailing whitespace
    print(f"Extracted approx {len(extracted)} characters of text")

    summary = summarize_text_via_groq(extracted, groq_api_url, groq_api_key)

    return {"summary": summary, "extracted_chars": len(extracted)}


def main(argv):
    if len(argv) < 2:
        print("Usage: python agent.py /path/to/file.pdf")
        return 2

    pdf = argv[1]
    res = process_pdf_and_summarize(pdf)
    print(json.dumps(res, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
