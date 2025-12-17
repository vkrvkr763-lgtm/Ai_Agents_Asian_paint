import os
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
import pypdf

# Load Environment Variables
from dotenv import load_dotenv
load_dotenv()

# Initialize Embeddings (The "Translator" for text to numbers)
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

VECTOR_DB_PATH = "data/faiss_index"

def ingest_pdf(file_path: str):
    """
    Reads a PDF, chunks it, and saves it to the Vector DB.
    """
    # 1. Extract Text
    reader = pypdf.PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    
    # 2. Chunk Text (Split into smaller pieces)
    # Simple splitting by double newline for paragraphs
    chunks = text.split("\n\n")
    docs = [Document(page_content=chunk) for chunk in chunks if chunk.strip()]

    # 3. Create/Update Vector Store
    if os.path.exists(VECTOR_DB_PATH):
        vector_db = FAISS.load_local(VECTOR_DB_PATH, embeddings, allow_dangerous_deserialization=True)
        vector_db.add_documents(docs)
    else:
        vector_db = FAISS.from_documents(docs, embeddings)
    
    # 4. Save Locally
    vector_db.save_local(VECTOR_DB_PATH)
    return f"Ingested {len(docs)} chunks from {file_path}"

def retrieve_knowledge(query: str, k=3):
    """
    Searches the Vector DB for the most relevant chunks.
    """
    if not os.path.exists(VECTOR_DB_PATH):
        return "No knowledge base found. Please upload documents first."
        
    vector_db = FAISS.load_local(VECTOR_DB_PATH, embeddings, allow_dangerous_deserialization=True)
    results = vector_db.similarity_search(query, k=k)
    
    # Combine results into a single context string
    context = "\n\n".join([doc.page_content for doc in results])
    return context