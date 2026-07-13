import asyncio
from sqlalchemy import text
from app.db.engine import engine

async def add_column():
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE coding_problems ADD COLUMN test_cases JSON;"))
            print("Successfully added test_cases column.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(add_column())
