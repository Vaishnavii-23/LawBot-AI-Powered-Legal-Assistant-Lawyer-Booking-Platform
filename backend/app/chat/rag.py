# app/chat/rag.py

import os
import json
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import re

try:
    import faiss  # type: ignore[attr-defined]
    _faiss_import_error = None
except (ImportError, OSError) as exc:  # pragma: no cover - environment specific
    faiss = None  # type: ignore[assignment]
    _faiss_import_error = exc

try:
    from sentence_transformers import SentenceTransformer
    _sentence_transformer_error = None
except (ImportError, OSError) as exc:  # pragma: no cover - environment specific
    SentenceTransformer = None  # type: ignore[assignment]
    _sentence_transformer_error = exc
from dotenv import load_dotenv
import requests

# Load environment variables from .env
load_dotenv()

# Paths to FAISS index and metadata
INDEX_PATH = Path("data/index/faiss_index.bin")
META_PATH = Path("data/index/chunks_metadata.json")

# Embedding model
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Groq config
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# You can change this to any Groq-supported model (check Groq docs)
GROQ_MODEL = "llama-3.1-8b-instant"

# Very small stopword list for simple keyword scoring
STOPWORDS = {
    "the", "is", "are", "a", "an", "of", "and", "to", "in", "under",
    "for", "on", "with", "this", "that", "it", "as", "by", "or", "be",
    "from", "at", "about", "into", "than", "then", "so", "such",
}


def simple_keyword_score(text: str, query: str) -> int:
    """
    Very simple lexical relevance:
    - lowercases text + query
    - splits into tokens
    - counts how many important query words appear in the chunk
    """
    text_l = text.lower()
    q_tokens = [
        t for t in query.lower().replace(",", " ").replace(".", " ").split()
        if t and t not in STOPWORDS
    ]
    score = 0
    for tok in q_tokens:
        if tok in text_l:
            score += 1
    return score


class RAGChatbot:
    """
    RAG chatbot that:
    - loads FAISS index + metadata built from PDFs
    - embeds user query
    - retrieves top-k similar chunks
    - re-ranks using simple keyword matching
    - calls Groq LLM with those chunks as context
    """

    def __init__(self):
        if SentenceTransformer is None:
            raise RuntimeError(
                "SentenceTransformer (and PyTorch backend) is unavailable: "
                f"{_sentence_transformer_error}. Install a supported torch build or disable chat features."
            )
        if faiss is None:
            raise RuntimeError(
                "FAISS library is unavailable: "
                f"{_faiss_import_error}. Install faiss-cpu/faiss-gpu or rebuild the search index."
            )
        # Load embedding model
        hf_token = os.getenv("HF_TOKEN")
        if hf_token:
            # use_auth_token is deprecated warning but still works; safe to ignore
            self.embedder = SentenceTransformer(MODEL_NAME, use_auth_token=hf_token)
        else:
            self.embedder = SentenceTransformer(MODEL_NAME)

        # Load FAISS index
        if not INDEX_PATH.exists():
            raise RuntimeError(f"FAISS index not found at {INDEX_PATH}. Run build_index.py first.")

        if not META_PATH.exists():
            raise RuntimeError(f"Metadata file not found at {META_PATH}. Run build_index.py first.")

        self.index = faiss.read_index(str(INDEX_PATH))

        # Load metadata (list of dicts: {global_id, pdf_path, chunk_id, text})
        with open(META_PATH, "r", encoding="utf-8") as f:
            self.metadata: List[Dict] = json.load(f)

    def _search(self, query: str, top_k: int = 8) -> List[Dict]:
        """
        Embed query, search FAISS index, then re-rank results by:
        - FAISS similarity (via order)
        - plus keyword overlap score
        """
        q_emb = self.embedder.encode([query])  # shape (1, dim)
        D, I = self.index.search(q_emb.astype("float32"), top_k)

        candidates: List[Dict] = []
        for rank, idx in enumerate(I[0]):
            if idx < 0:
                continue
            if idx >= len(self.metadata):
                continue
            meta = self.metadata[idx].copy()
            # basic lexical score
            kw_score = simple_keyword_score(meta.get("text", ""), query)
            # lower FAISS distance means closer -> convert to rough similarity
            # sim ≈ 1 / (1 + distance)
            faiss_dist = float(D[0][rank])
            sim = 1.0 / (1.0 + faiss_dist)
            meta["_kw_score"] = kw_score
            meta["_faiss_sim"] = sim
            candidates.append(meta)

        # Re-rank: first by keyword score, then by FAISS similarity
        candidates.sort(key=lambda m: (m["_kw_score"], m["_faiss_sim"]), reverse=True)

        # If you want to be stricter, you could do:
        # non_zero = [c for c in candidates if c["_kw_score"] > 0]
        # if non_zero:
        #     return non_zero

        return candidates

    def _call_groq(self, question: str, context_chunks: List[Dict]) -> str:
        """
        Calls Groq chat-completions API using the retrieved context chunks.
        Injects:
        - structured instructions (how LawBot should behave)
        - legal context from PDFs
        - the user's question
        """
        if not GROQ_API_KEY:
            return "Groq API key is missing. Please set GROQ_API_KEY in your .env file."

        # Build compact context text from chunks
        if context_chunks:
            context_text = ""
            for m in context_chunks:
                context_text += (
                    f"\n[From {m['pdf_path'].split(os.sep)[-1]}, chunk {m['chunk_id']}]\n"
                    f"{m['text']}\n"
                )
        else:
            context_text = "\n(No relevant legal context was retrieved from the documents.)\n"

        # Big instruction block for behavior + structure
        guidelines = f"""
You are **LawBot**, an AI assistant specialised in **Indian law**, integrated inside a lawyer discovery and booking platform.

Your job:
- Explain legal concepts clearly and accurately.
- Use the **retrieved legal documents and database context** as your primary source of truth.
- Help users understand their rights, typical procedures, and which type of lawyer they may need.
- Suggest only those lawyers and categories that are actually available in the platform’s data.

You are NOT a human lawyer. You provide **information and guidance**, not a formal legal opinion.

----------------------------------------------------
🎯 CORE BEHAVIOUR

1. **Be accurate, not over-confident**
   - Prefer saying “I’m not sure” or “This is not clearly covered in the provided documents” over guessing.
   - If a detail (like exact punishment, section number, limitation period, fee, exact format, etc.) is **not present in the retrieved context**, do NOT invent it.
   - When you speak generically based on common knowledge (not directly from documents), clearly mark it as **general information**.

2. **Use the provided context (RAG) FIRST**
   - Treat the retrieved PDFs / chunks as your main reference.
   - Quote or summarise what is actually in the documents.
   - If multiple documents disagree, say that the position may vary and advise the user to consult a lawyer.
   - If no relevant information appears in context, say so clearly and then give only broad, high-level guidance without pretending it came from the documents.

3. **Avoid wrong or unsafe suggestions**
   - Do NOT promise outcomes or say things like “you will definitely win / lose”.
   - Do NOT suggest illegal, deceptive, or revengeful actions.
   - Do NOT tell the user to skip lawyers or courts for serious issues.
   - If the user is in immediate danger or facing violence, suggest they contact local police or emergency services, and also talk to a lawyer.

4. **About legal actions**
   - You may outline typical legal options (e.g. filing a complaint, FIR, case, notice) **in general terms**.
   - Make it clear that **exact steps should be confirmed with a qualified lawyer in their area**.
   - Use language like: “You may consider…”, “Usually, people in this situation might…”, “Please confirm this with a lawyer before acting.”

----------------------------------------------------
🧠 ANSWER STRUCTURE (FOR EVERY REPLY)

For each user question, follow this structure (but you can use detailed content inside each part):

1. **Explanation**
   - Give a clear, detailed explanation of the issue under Indian law.
   - Use simple, understandable language, but do NOT oversimplify the substance.
   - Where helpful, mention relevant Acts / sections **only if they appear in the context** (or are very standard and you’re confident).

2. **User’s likely rights / legal position**
   - Based on the context and general Indian legal principles, explain what rights a person usually has in such a situation.
   - If the answer strongly depends on specific facts or state/jurisdiction, say that explicitly.

3. **Possible next steps (safe, lawful)**
   - Suggest 3–6 reasonable next steps the user may consider.
   - Examples: documenting evidence, talking to the other party calmly, consulting a lawyer, filing a complaint after legal advice, etc.
   - Always phrase them as suggestions, not commands.
   - Emphasise that serious legal actions should be discussed with a lawyer first.

4. **Suitable type of lawyer**
   - State which **single most relevant category** of lawyer is usually suitable (Family, Criminal, Property / Rent, Labour / Employment, Cyber, Motor Vehicle, Women’s Rights, Mental Health, or Other).
   - If the platform passes you a list of suggested lawyers, you may refer to them in general terms (e.g. “The platform has suggested some Family Law specialists for you.”) but do not invent lawyers or locations that are not in the data.

5. **Platform reminder (short)**
   - One short sentence reminding the user they can use this website to find and contact a lawyer:
     - e.g. “On this platform, you can view lawyer profiles by city and specialisation and request a consultation.”

6. **Short disclaimer (mandatory)**
   - One line only, such as:
     - “This is general legal information, not a formal legal opinion. Please consult a qualified lawyer for advice on your specific case.”

7. **Detected Legal Category (mandatory)**
   - At the very end, add:
     - **Detected Legal Category: <ONE of: Family Law / Criminal Law / Property / Rent Law / Labour / Employment Law / Cyber Law / Motor Vehicle Law / Women’s Rights / Mental Health Law / Other>**

----------------------------------------------------
📚 CONTEXT HANDLING RULES

- Use the **RAG context** (retrieved legal chunks from PDFs / DB) to support your answer.
- If you refer to something that clearly comes from the documents, you may paraphrase it in simple language rather than copying long legal text.
- If the context is insufficient or unrelated, say something like:
  - “The documents I have access to do not clearly cover this exact situation. I’ll share general information based on Indian legal principles, but you should confirm this with a lawyer.”
- Never fabricate document names, section numbers, or case law that are not in the context.

----------------------------------------------------
💬 TONE & STYLE

- Professional but approachable.
- Respectful, neutral, non-judgmental.
- Use short paragraphs and bullet points where helpful.
- Avoid long, dense legal paragraphs without explanation.
- Do not threaten or scare the user; focus on clarity and options.

----------------------------------------------------
NOW RESPOND

Using the above rules and the legal context provided to you, answer the user’s next question in the required structure, with as much accurate detail as the context supports.
"""

        # Final message sent to the model – includes guidelines, context, and question
        user_message = (
            guidelines
            + "\n\n--------------------\n\n"
            + "📚 LEGAL CONTEXT FROM DOCUMENTS (Indian laws & official guides):\n"
            + context_text
            + "\n\n💬 USER QUESTION:\n"
            + question
        )

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        data = {
            "model": GROQ_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are LawBot, a careful Indian legal assistant. "
                        "You must rely primarily on the provided legal context and follow all safety rules."
                    ),
                },
                {
                    "role": "user",
                    "content": user_message,
                },
            ],
            "temperature": 0.15,
            "max_tokens": 900,
        }

        url = "https://api.groq.com/openai/v1/chat/completions"

        try:
            resp = requests.post(url, headers=headers, json=data, timeout=60)
            resp.raise_for_status()
            j = resp.json()
            return j["choices"][0]["message"]["content"]
        except Exception as e:
            return f"Error calling Groq API: {e}"

    def _extract_detected_category(self, answer: str) -> str:
        """Pull the detected legal category from the assistant answer if present."""
        pattern = re.compile(r"Detected Legal Category:\s*([A-Za-z /'&-]+)", re.IGNORECASE)
        match = pattern.search(answer)
        if not match:
            return "Other"

        raw_category = match.group(1).strip().strip("*_")
        normalised = raw_category.casefold()
        allowed = {
            "family law": "Family Law",
            "criminal law": "Criminal Law",
            "property / rent law": "Property / Rent Law",
            "property law": "Property / Rent Law",
            "labour / employment law": "Labour / Employment Law",
            "employment law": "Labour / Employment Law",
            "cyber law": "Cyber Law",
            "motor vehicle law": "Motor Vehicle Law",
            "women's rights": "Women's Rights",
            "mental health law": "Mental Health Law",
            "other": "Other",
        }
        return allowed.get(normalised, raw_category.strip() or "Other")

    def answer(self, question: str, top_k: int = 8) -> Tuple[str, List[Dict], str]:
        """
        Main RAG flow:
        - retrieve chunks
        - call Groq
        - return (answer, chunks, detected_category)
        """
        chunks = self._search(question, top_k=top_k)
        answer = self._call_groq(question, chunks)
        detected_category = self._extract_detected_category(answer)
        return answer, chunks, detected_category


# Singleton-ish global instance for FastAPI dependency
rag_bot: Optional[RAGChatbot] = None


def get_rag_bot() -> RAGChatbot:
    global rag_bot
    if rag_bot is None:
        rag_bot = RAGChatbot()
    return rag_bot
