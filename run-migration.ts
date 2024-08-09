import dotenv from 'dotenv';
dotenv.config();

import { migrate } from './migrations/001_add_verification_token';

async function runMigration(): Promise<void> {
    try {
        await migrate();
        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

runMigration();