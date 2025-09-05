import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, query } = await request.json();
    return NextResponse.json({
      answer: "Test response - API is working",
      sources: []
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Test error message: '+ (error instanceof Error ? error.message : String(error)) }, 
      { status: 500 }
    );
  }
}