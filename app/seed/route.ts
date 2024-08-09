import bcrypt from 'bcrypt';
import { db } from '@vercel/postgres';
import { users } from '@/app/lib/placeholder-data';

export async function GET() {
    const client = await db.connect();

    async function seedUsers() {
        await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
        await client.sql`
          CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            first_name VARCHAR(255) NULL,
            last_name VARCHAR(255) NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            email_verified BOOLEAN DEFAULT FALSE,
            verification_token TEXT
          );
        `;

        const insertedUsers = await Promise.all(
            users.map(async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                return client.sql`
              INSERT INTO users (id, first_name, last_name, email, password)
              VALUES (${user.id}, ${user.first_name}, ${user.last_name}, ${user.email}, ${hashedPassword})
              ON CONFLICT (id) DO NOTHING;
            `;
            }),
        );

        return insertedUsers;
    }

    try {
        await client.sql`BEGIN`;
        await seedUsers();
        await client.sql`COMMIT`;

        return Response.json({ message: 'Database seeded successfully' });
    } catch (error) {
        await client.sql`ROLLBACK`;
        return Response.json({ error }, { status: 500 });
    }
}