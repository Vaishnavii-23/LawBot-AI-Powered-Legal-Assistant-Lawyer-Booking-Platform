import os
import json
from pathlib import Path

import faiss
from sentence_transformers import SentenceTransformer
from pypdf import PdfReader
from dotenv import load_dotenv

load_dotenv()

PDF_DIR = Path("data/pdfs")
INDEX_DIR = Path("data/index")
INDEX_DIR.mkdir(parents=True, exist_ok=True)

INDEX_PATH = INDEX_DIR / "faiss_index.bin"
META_PATH = INDEX_DIR / "chunks_metadata.json"

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 100
BATCH_SIZE = 32


def split_into_chunks(text: str, chunk_size: int, overlap: int):
    """
    Simple sliding-window chunking.
    """
    chunks = []
    start = 0
    n = len(text)

    while start < n:
        end = min(start + chunk_size, n)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == n:
            break
        start = end - overlap

    return chunks


def read_pdf_text(path: Path) -> str:
    reader = PdfReader(str(path))
    parts = []
    for page in reader.pages:
        try:
            parts.append(page.extract_text() or "")
        except Exception:
            continue
    return "\n".join(parts)


def build_index():
    print("Loading embedding model:", MODEL_NAME)
    hf_token = os.getenv("HF_TOKEN")
    if hf_token:
        model = SentenceTransformer(MODEL_NAME, use_auth_token=hf_token)
    else:
        model = SentenceTransformer(MODEL_NAME)

    index = None
    metadata = []

    total_chunks = 0

    pdf_files = sorted(PDF_DIR.glob("*.pdf"))
    if not pdf_files:
        print(f"No PDFs found in {PDF_DIR}.")
        return

    for pdf_path in pdf_files:
        print(f"Reading PDF: {pdf_path}")
        text = read_pdf_text(pdf_path)
        if not text.strip():
            print("  (no text found, skipping)")
            continue

        chunks = split_into_chunks(text, CHUNK_SIZE, CHUNK_OVERLAP)
        print(f"  -> {len(chunks)} chunks")

        # embed in small batches
        for i in range(0, len(chunks), BATCH_SIZE):
            batch_chunks = chunks[i : i + BATCH_SIZE]
            embeddings = model.encode(batch_chunks, show_progress_bar=False)

            # init FAISS index once we know dimension
            if index is None:
                dim = embeddings.shape[1]
                index = faiss.IndexFlatL2(dim)

            index.add(embeddings.astype("float32"))

            # add metadata for each chunk in the batch
            for j, chunk_text in enumerate(batch_chunks):
                metadata.append(
                    {
                        "global_id": total_chunks,
                        "pdf_path": str(pdf_path),
                        "chunk_id": i + j,
                        "text": chunk_text,
                    }
                )
                total_chunks += 1

        print(f"  >> total chunks so far: {total_chunks}")

    if index is None:
        print("No chunks embedded, index is empty.")
        return

    print(f"Final total chunks: {total_chunks}")
    print(f"Saving FAISS index to: {INDEX_PATH}")
    faiss.write_index(index, str(INDEX_PATH))

    print(f"Saving metadata to: {META_PATH}")
    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False)

    print("✅ Index build complete.")


if __name__ == "__main__":
    build_index()
