import { NextRequest, NextResponse } from 'next/server';
import { generateInitialChatName } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { iceBreaker, description, messageCount } = await request.json();

    if (!iceBreaker) {
      return NextResponse.json(
        { error: 'Ice breaker is required' },
        { status: 400 }
      );
    }

    // Generate chat name using Gemini
    const chatName = await generateInitialChatName(iceBreaker, description);

    return NextResponse.json({ chatName });
  } catch (error) {
    console.error('Error generating chat name:', error);
    return NextResponse.json(
      { error: 'Failed to generate chat name', chatName: 'Recovery Support Chat' },
      { status: 500 }
    );
  }
}