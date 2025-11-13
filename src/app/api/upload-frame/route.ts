import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    
    // Forward to your external server
    const response = await fetch(process.env.BOOTED_SERVER!, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type - let fetch set it automatically for FormData
      },
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Proxy upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload frame' },
      { status: 500 }
    );
  }
}