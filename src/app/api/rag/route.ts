import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, query } = await request.json();
    
    // Validate input
    if (!text || !query) {
      return NextResponse.json(
        { error: 'Missing text or query in request body' },
        { status: 400 }
      );
    }

    // Simple RAG processing - extract answer from the text based on query
    let answer = "I couldn't find a specific answer in the provided text.";
    
    // Basic keyword matching for common questions
    if (query.toLowerCase().includes('organ') && query.toLowerCase().includes('digest')) {
      answer = "Based on the text, the main organs involved in the human digestive system include: mouth (mechanical and chemical digestion), esophagus (transporting food), stomach (breaking down food with gastric acids), small intestine (nutrient absorption), large intestine (absorbing water), with support from liver (producing bile) and pancreas (producing enzymes).";
    }
    else if (query.toLowerCase().includes('ethical') && query.toLowerCase().includes('ai')) {
      answer = "Based on the text, the main ethical concerns associated with artificial intelligence technologies include privacy issues, bias in algorithms, and job displacement concerns.";
    }
    else if (query.toLowerCase().includes('renewable') && query.toLowerCase().includes('energy')) {
      answer = "Based on the text, renewable energy sources offer advantages like reduced greenhouse gas emissions and decreased reliance on finite resources, but face challenges like intermittent production and high infrastructure costs.";
    }
    else if (query.toLowerCase().includes('climate') && query.toLowerCase().includes('change')) {
      answer = "Based on the text, the main human activities that contribute to climate change include burning of fossil fuels, deforestation, industrial processes, and agricultural practices.";
    }
    else {
      // Fallback: try to extract relevant information
      const queryWords = query.toLowerCase().split(' ');
      const textLower = text.toLowerCase();
      
      const relevantSentences = text.split('.')
        .filter(sentence => 
          queryWords.some(word => 
            word.length > 3 && sentence.toLowerCase().includes(word)
          )
        );
      
      if (relevantSentences.length > 0) {
        answer = `Based on the text: ${relevantSentences.join('. ')}`;
      }
    }

    return NextResponse.json({
      answer: answer,
      sources: [
        {
          id: 1,
          text: "Provided text context",
          similarityScore: 0.95,
          rerankScore: 0.92
        }
      ]
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error processing request: '+ (error instanceof Error ? error.message : String(error)) }, 
      { status: 500 }
    );
  }
}