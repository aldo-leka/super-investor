import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  try {
    const result = await sql`
      UPDATE users
      SET email_verified = true, verification_token = NULL
      WHERE verification_token = ${token}
      RETURNING id
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json({ error: 'An error occurred while verifying email' }, { status: 500 });
  }
}
