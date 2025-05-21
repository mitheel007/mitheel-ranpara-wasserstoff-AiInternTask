import chromadb
import os
import json
import uuid
import numpy as np
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer

# Initialize the embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize ChromaDB client
client = chromadb.Client()

# Create a collection for our documents
collection = client.create_collection(name="documents")

def embed_text(text: str) -> List[float]:
    """Generate embeddings for a text string"""
    return model.encode(text).tolist()

def add_document(doc_id: str, content: str, metadata: Dict[str, Any]) -> str:
    """Add a document to the vector database"""
    # Generate embeddings for the document
    embeddings = embed_text(content)
    
    # Add document to the collection
    collection.add(
        ids=[doc_id],
        embeddings=[embeddings],
        metadatas=[metadata],
        documents=[content]
    )
    
    return doc_id

def search_documents(query: str, n_results: int = 5) -> List[Dict[str, Any]]:
    """Search for documents similar to the query"""
    # Generate embeddings for the query
    query_embedding = embed_text(query)
    
    # Search the collection
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )
    
    # Format results
    formatted_results = []
    for i in range(len(results['ids'][0])):
        formatted_results.append({
            'id': results['ids'][0][i],
            'document': results['documents'][0][i],
            'metadata': results['metadatas'][0][i],
            'distance': results['distances'][0][i] if 'distances' in results else None
        })
    
    return formatted_results

def chunk_document(content: str, metadata: Dict[str, Any], chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split a document into chunks for better semantic search"""
    chunks = []
    chunk_ids = []
    
    # Simple chunking by character count
    for i in range(0, len(content), chunk_size - overlap):
        chunk = content[i:i + chunk_size]
        if len(chunk) < 100:  # Skip very small chunks
            continue
            
        chunk_id = f"{metadata['id']}_chunk_{len(chunks)}"
        chunk_metadata = {**metadata, 'chunk_id': chunk_id, 'chunk_index': len(chunks)}
        
        # Add the chunk to the vector database
        add_document(chunk_id, chunk, chunk_metadata)
        
        chunks.append(chunk)
        chunk_ids.append(chunk_id)
    
    return chunk_ids

def process_document(content: str, filename: str, doc_id: Optional[str] = None) -> str:
    """Process a document and add it to the vector database"""
    if doc_id is None:
        doc_id = str(uuid.uuid4())
        
    metadata = {
        'id': doc_id,
        'filename': filename,
        'length': len(content)
    }
    
    # For longer documents, chunk them
    if len(content) > 1000:
        chunk_ids = chunk_document(content, metadata)
        metadata['chunk_ids'] = chunk_ids
    else:
        add_document(doc_id, content, metadata)
    
    return doc_id

def get_document_by_id(doc_id: str) -> Dict[str, Any]:
    """Retrieve a document by its ID"""
    results = collection.get(ids=[doc_id])
    
    if not results['ids']:
        return None
        
    return {
        'id': results['ids'][0],
        'document': results['documents'][0],
        'metadata': results['metadatas'][0]
    }

# Command-line interface for testing
if __name__ == "__main__":
    import sys
    
    command = sys.argv[1] if len(sys.argv) > 1 else None
    
    if command == "add":
        # Example: python vector_db.py add "document content" "filename.txt"
        content = sys.argv[2]
        filename = sys.argv[3]
        doc_id = process_document(content, filename)
        print(json.dumps({"success": True, "doc_id": doc_id}))
        
    elif command == "search":
        # Example: python vector_db.py search "query string" 5
        query = sys.argv[2]
        n_results = int(sys.argv[3]) if len(sys.argv) > 3 else 5
        results = search_documents(query, n_results)
        print(json.dumps({"success": True, "results": results}))
        
    elif command == "get":
        # Example: python vector_db.py get "doc_id"
        doc_id = sys.argv[2]
        document = get_document_by_id(doc_id)
        print(json.dumps({"success": True, "document": document}))
        
    else:
        print(json.dumps({"success": False, "error": "Invalid command"}))
