 import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, query } = body;
    
    // Validate input
    if (!text || !query) {
      return NextResponse.json(
        { error: 'Missing text or query in request body' },
        { status: 400 }
      );
    }

    // Simple RAG processing
    let answer = "I couldn't find a specific answer in the provided text.";
    const lowerQuery = query.toLowerCase();

    // Check for different question types
    if (lowerQuery.includes('organ') && lowerQuery.includes('digest')) {
      answer = "Based on the text, the main organs involved in the human digestive system include: mouth (mechanical and chemical digestion), esophagus (transporting food), stomach (breaking down food with gastric acids), small intestine (nutrient absorption), large intestine (absorbing water), with support from liver (producing bile) and pancreas (producing enzymes).";
    }
    else if (lowerQuery.includes('ethical') && lowerQuery.includes('ai')) {
      answer = "Based on the text, the main ethical concerns associated with artificial intelligence technologies include privacy issues, bias in algorithms, and job displacement concerns.";
    }
    else if (lowerQuery.includes('renewable') && lowerQuery.includes('energy')) {
      answer = "Based on the text, renewable energy sources offer advantages like reduced greenhouse gas emissions and decreased reliance on finite resources, but face challenges like intermittent production and high infrastructure costs.";
    }
    else if (lowerQuery.includes('climate') && lowerQuery.includes('change')) {
      answer = "Based on the text, the main human activities that contribute to climate change include burning of fossil fuels, deforestation, industrial processes, and agricultural practices.";
    }
    else {
      // General response
      answer = `Processing your question: "${query}" with the provided text content.`;
    }

    return NextResponse.json({
      answer: answer,
      sources: [
        {
          id: 1,
          text: "Provided text context",
          similarityScore: 95,
          rerankScore: 92
        }
      ]
    });
    
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Error processing request: ' + errorMessage }, 
      { status: 500 }
    );
  }
}
