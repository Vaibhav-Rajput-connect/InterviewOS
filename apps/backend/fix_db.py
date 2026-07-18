import asyncio
import asyncpg
import os

async def main():
    conn = await asyncpg.connect("postgresql://neondb_owner:npg_CIMUGT2RoW9g@ep-red-sun-avkjhc1e-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require")
    
    print("Creating coding_problems...")
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS coding_problems (
            id UUID PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) UNIQUE NOT NULL,
            difficulty VARCHAR(50) NOT NULL,
            description TEXT NOT NULL,
            constraints JSON,
            examples JSON,
            test_cases JSON,
            boilerplate JSON,
            created_at TIMESTAMP WITH TIME ZONE
        );
        CREATE INDEX IF NOT EXISTS ix_coding_problems_slug ON coding_problems(slug);
    """)
    
    print("Creating user_problem_statuses...")
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS user_problem_statuses (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            problem_id UUID NOT NULL REFERENCES coding_problems(id) ON DELETE CASCADE,
            status VARCHAR(50),
            bookmarked BOOLEAN,
            last_attempted_at TIMESTAMP WITH TIME ZONE,
            solved_at TIMESTAMP WITH TIME ZONE
        );
    """)
    
    print("Creating coding_submissions...")
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS coding_submissions (
            id UUID PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            problem_id UUID NOT NULL REFERENCES coding_problems(id) ON DELETE CASCADE,
            language VARCHAR(50) NOT NULL,
            code TEXT NOT NULL,
            status VARCHAR(50),
            created_at TIMESTAMP WITH TIME ZONE
        );
    """)
    
    print("Done!")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())
