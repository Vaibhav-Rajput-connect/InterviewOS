import asyncio
from app.db.session import engine
from app.models.coding import CodingSubmission

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(CodingSubmission.__table__.create)
    print("Table created!")

asyncio.run(main())
