
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader, WebBaseLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path
import logging
import os

logger = logging.getLogger("my_app_logger")
load_dotenv()
# === Configuration ===
class AppConfig(BaseSettings):
    pdf_dir: str = "rag_docs/pdfs"
    md_dir: str = "rag_docs/mds"
    chroma_path: str = "rag_store"
    urls: List[str] = [
        "https://m3.material.io/components/buttons/overview",
        "https://www.atlassian.com/agile/project-management/user-stories",
        "https://m3.material.io/components",
        "https://docs.flutter.dev/ui",
        "https://developer.apple.com/design/human-interface-guidelines/",
        "https://scrumguides.org/scrum-guide.html",
        "https://www.mountaingoatsoftware.com/agile/user-stories",
        "https://restfulapi.net/",
        "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design",
        "https://swagger.io/docs/specification/v3_0/basic-structure/",
        "https://developer.android.com/topic/architecture",
        "https://reactnative.dev/docs/navigation"
    ]
    chunk_size: int = 500
    chunk_overlap: int = 100
    search_k: int = 4

config = AppConfig()

# === Document Loading ===
def load_pdfs() -> List:
    pdfs = []
    for filename in Path(config.pdf_dir).glob("*.pdf"):
        try:
            loader = PyPDFLoader(str(filename))
            pdfs.extend(loader.load())
        except Exception as e:
            logger.error(f"Failed to load PDF {filename}: {e}")
    return pdfs

def load_markdown() -> List:
    try:
        return DirectoryLoader(config.md_dir, glob="**/*.md").load()
    except Exception as e:
        logger.error(f"Failed to load Markdown: {e}")
        return []

def load_web() -> List:
    docs = []
    for url in config.urls:
        try:
            loader = WebBaseLoader(url)
            docs.extend(loader.load())
        except Exception as e:
            logger.error(f"Failed to load {url}: {e}")
    return docs

def add_new_documents(vectorstore: Chroma, embedding: HuggingFaceEmbeddings, config: AppConfig) -> Chroma:
    """
    Loads new documents (PDFs, Markdown, and web pages) and adds them to the existing Chroma vectorstore.
    """
    # Load all documents (PDF, Markdown, Web)
    new_docs = []
    new_docs.extend(load_pdfs())
    new_docs.extend(load_markdown())
    new_docs.extend(load_web())
    
    if new_docs:
        # Split documents into chunks
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=config.chunk_size,
            chunk_overlap=config.chunk_overlap
        )
        split_new_docs = splitter.split_documents(new_docs)
        # Add new documents to the existing vectorstore
        vectorstore.add_documents(split_new_docs)
        vectorstore.persist()
        logger.info(f"Added {len(split_new_docs)} new document chunks to the vectorstore.")
    else:
        logger.info("No new documents found to add.")
    return vectorstore


def load_all_documents() -> List:
    docs = []
    docs.extend(load_pdfs())
    docs.extend(load_markdown())
    docs.extend(load_web())
    return docs

def prepare_vectorstore(embedding: HuggingFaceEmbeddings, config: AppConfig, add_new: bool = False) -> Chroma:
    if not os.path.exists(config.chroma_path):
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=config.chunk_size,
            chunk_overlap=config.chunk_overlap
        )
        docs = splitter.split_documents(load_all_documents())
        vectorstore = Chroma.from_documents(
            docs,
            embedding,
            persist_directory=config.chroma_path
        )
        vectorstore.persist()
        logger.info("Created new vectorstore and added all documents.")
    else:
        vectorstore = Chroma(
            persist_directory=config.chroma_path,
            embedding_function=embedding
        )
        logger.info("Loaded existing vectorstore.")
        if add_new:
            vectorstore = add_new_documents(vectorstore, embedding, config)
    return vectorstore