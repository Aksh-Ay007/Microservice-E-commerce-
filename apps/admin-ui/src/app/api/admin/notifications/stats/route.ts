import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/api/notifications/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch notification statistics' },
      { status: 500 }
    );
  }
}