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
import argparse

logger = logging.getLogger("my_app_logger")
load_dotenv()

class AppConfig(BaseSettings):
    pdf_dir: str = "rag_docs/pdfs"
    md_dir: str = "rag_docs/mds"
    information_chroma_path: str = "rag_store_information"
    questions_chroma_path: str = "rag_store_questions"
    story_pipeline_chroma_path: str = "rag_store_story_pipeline"
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
    new_docs = []
    new_docs.extend(load_pdfs())
    new_docs.extend(load_markdown())
    new_docs.extend(load_web())
    if new_docs:
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=config.chunk_size,
            chunk_overlap=config.chunk_overlap
        )
        split_new_docs = splitter.split_documents(new_docs)
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

def prepare_empty_vectorstore(embedding: HuggingFaceEmbeddings) -> Chroma:
    # Create an empty vectorstore in memory (no documents)
    return Chroma(embedding_function=embedding)

def prepare_vectorstore(
    embedding: HuggingFaceEmbeddings,
    config: AppConfig,
    add_new: bool = False,
    store_path: str = None
) -> Chroma:
    """
    Prepares a Chroma vectorstore:
    - If the store_path does not exist, loads all documents, splits them, and creates a new persistent vectorstore.
    - If the store_path exists, loads the existing vectorstore.
    - If add_new is True, loads new documents and adds them to the existing vectorstore.
    - Handles empty document lists gracefully.
    """
    # Create new vectorstore if path does not exist
    if not os.path.exists(store_path):
        docs = load_all_documents()
        if docs:
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=config.chunk_size,
                chunk_overlap=config.chunk_overlap
            )
            split_docs = splitter.split_documents(docs)
            vectorstore = Chroma.from_documents(
                split_docs,
                embedding,
                persist_directory=store_path
            )
            logger.info(f"Created new vectorstore at {store_path} with {len(split_docs)} chunks.")
        else:
            # Create an empty persistent vectorstore
            vectorstore = Chroma(
                persist_directory=store_path,
                embedding_function=embedding
            )
            logger.info(f"Created empty vectorstore at {store_path}.")
    else:
        # Load existing vectorstore
        vectorstore = Chroma(
            persist_directory=store_path,
            embedding_function=embedding
        )
        logger.info(f"Loaded existing vectorstore from {store_path}.")
        # Optionally add new documents
        if add_new:
            vectorstore = add_new_documents(vectorstore, embedding, config)
    return vectorstore

class VectorStoreManager:
    def __init__(self):
        self.stores = {}

    def add_store(self, name, vectorstore, file_path=None, embedding_model=None):
        self.stores[name] = {
            "vectorstore": vectorstore,
            "file_path": file_path,
            "embedding_model": embedding_model
        }

    def get_store(self, name):
        entry = self.stores.get(name)
        return entry["vectorstore"] if entry else None

    def get_retriever(self, name, **kwargs):
        store = self.get_store(name)
        if store:
            return store.as_retriever(**kwargs)
        return None

    def get_metadata(self, name):
        return self.stores.get(name)

manager = None  # Will be initialized by init_vectorstores()

def init_vectorstores(args=None):
    global manager
    manager = VectorStoreManager()
    # If args is None, parse them here
    if args is None:
        parser = argparse.ArgumentParser()
        parser.add_argument("--add-new", action="store_true")
        args, _ = parser.parse_known_args()

        # General story info vectorstore (persistent)
    embedding_story = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
    vectorstore_story = prepare_vectorstore(embedding_story, config, args.add_new, config.information_chroma_path)
    manager.add_store("rag_info", vectorstore_story, file_path=config.information_chroma_path, embedding_model="sentence-transformers/all-mpnet-base-v2")

    # Empty themes/epics/stories vectorstore (non-persistent, always empty)
    embedding_themes = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore_themes = prepare_empty_vectorstore(embedding_themes)
    manager.add_store("pipeline_parts", vectorstore_themes, file_path=None, embedding_model="sentence-transformers/all-MiniLM-L6-v2")

    return manager
