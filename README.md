# Mini RAG Application

A Retrieval-Augmented Generation (RAG) system that answers questions based on provided text content.

## Architecture
- Frontend: Next.js + TypeScript + Tailwind CSS
- Vector DB: Pinecone (cloud-hosted)
- Embeddings: TensorFlow.js Universal Sentence Encoder
- Reranker: Cohere Rerank
- LLM: Groq (Llama 3.1)

## Features
- Text input and question answering
- Semantic search with vector embeddings
- Relevance reranking
- Source citations with scores
- Clean, responsive UI

## Setup
1. Clone repository
2. `npm install`
3. Set environment variables
4. `npm run dev`
