from langchain.tools import tool
from dotenv import load_dotenv
import logging
load_dotenv()
# === RAG Tool ===

def make_rag_tool(retriever):
    @tool
    def rag_tool(query: str) -> str:
        """Search the app design document database for information related to the query."""
        logging.info(f"\n Rag tool Called Query: {query}")

        docs = retriever.invoke(query)

        if not docs:
            logging.info(" No relevant documents found.")
            return "No relevant information found."

        logging.info(f" Retrieved {len(docs)} documents:")
        for i, doc in enumerate(docs, 1):
            source = doc.metadata.get("source", "unknown")
            snippet = doc.page_content.strip().replace("\n", " ")[:200]
            logging.info(f"  {i}. Source: {source}")
            logging.info(f"     Snippet: {snippet}...\n")

        return "\n\n".join(doc.page_content for doc in docs)
    return rag_tool