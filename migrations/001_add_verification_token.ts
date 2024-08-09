import { sql } from '@vercel/postgres';

export async function migrate(): Promise<void> {
    try {
        // Add verification_token column
        await sql`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS verification_token TEXT,
            ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE
        `;

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
}