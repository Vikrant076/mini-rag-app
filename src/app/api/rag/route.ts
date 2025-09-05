import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import Groq from 'groq-sdk';
import { CohereClient } from 'cohere-ai';

// Initialize clients
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const { text, query } = await request.json();

    if (!text || !query) {
      return NextResponse.json({ error: 'Text and query are required' }, { status: 400 });
    }

    // Get Pinecone index
    const indexName = process.env.PINECONE_INDEX_NAME!;
    const index = pinecone.Index(indexName);

    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      modelName: 'text-embedding-3-small'
    });

    // Step 1: Chunk the text
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
    });
    
    const chunks = await textSplitter.splitText(text);
    
    // Step 2: Create embeddings and upsert to Pinecone
    const vectors = await Promise.all(
      chunks.map(async (chunk, i) => {
        const embedding = await embeddings.embedQuery(chunk);
        return {
          id: `chunk-${i}-${Date.now()}`,
          values: embedding,
          metadata: {
            text: chunk,
            chunkNumber: i + 1,
            totalChunks: chunks.length
          }
        };
      })
    );

    // Upsert to Pinecone
    await index.upsert(vectors);

    // Step 3: Retrieve relevant chunks
    const queryEmbedding = await embeddings.embedQuery(query);
    const retrievalResults = await index.query({
      vector: queryEmbedding,
      topK: 8,
      includeMetadata: true,
    });

    const retrievedChunks = retrievalResults.matches
      .filter(match => match.score && match.score > 0.2)
      .map(match => ({
        text: match.metadata?.text as string,
        score: match.score,
        id: match.id
      }));

    if (retrievedChunks.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find relevant information to answer your question based on the provided text.",
        sources: []
      });
    }

    // Step 4: Rerank with Cohere
    const rerankResponse = await cohere.rerank({
      model: 'rerank-english-v3.0',
      query: query,
      documents: retrievedChunks.map(chunk => ({ text: chunk.text })),
      topN: 3,
    });

    const rerankedChunks = rerankResponse.results.map(result => ({
      ...retrievedChunks[result.index],
      rerankScore: result.relevanceScore
    }));

    // Step 5: Generate answer with Groq
    const context = rerankedChunks.map((chunk, index) => `[${index + 1}] ${chunk.text}`).join('\n\n');
    
    const systemPrompt = `Answer based ONLY on this context. Cite sources with [1], [2], etc.

Context:
${context}

Answer:`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
    });

    const answer = completion.choices[0]?.message?.content || 'No answer generated.';

    // Step 6: Return response
    return NextResponse.json({
      answer,
      sources: rerankedChunks.map((chunk, index) => ({
        id: index + 1,
        text: chunk.text.length > 200 ? chunk.text.substring(0, 200) + '...' : chunk.text,
        similarityScore: chunk.score || 0,
        rerankScore: chunk.rerankScore || 0
      }))
    });

  } catch (error) {
    console.error('RAG API error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' }, 
      { status: 500 }
    );
  }
}"// Build fix" 
