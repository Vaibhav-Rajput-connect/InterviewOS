import asyncio
import os
import sys
import json

# Add the parent directory to sys.path so 'app' can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# pyrefly: ignore [missing-module-attribute]
from app.db.engine import engine, async_session_factory
from app.models.coding import CodingProblem, ProblemTag, ProblemCompany
from app.db.base import Base

async def seed_data():
    async with engine.begin() as conn:
        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("Tables created.")
        
    async with async_session_factory() as db:
        # Check if we already have 300 problems
        from sqlalchemy import select, func
        result = await db.execute(select(func.count(CodingProblem.id)))
        count = result.scalar()
        
        if count >= 300:
            print(f"Problems already seeded. Found {count} problems.")
            return
            
        print("Loading problems from generated_problems.json...")
        with open("generated_problems.json", "r") as f:
            problems_data = json.load(f)
            
        # We need to skip inserting ones that already exist, or just insert them all if table is empty.
        # Given we had 2 problems before, let's just clear the table or safely insert.
        # The easiest way is to truncate to avoid unique constraint issues on slug.
        
        print("Clearing existing coding_problems to start fresh...")
        await db.execute(Base.metadata.tables['coding_problems'].delete())
        # Delete tags and companies too if they cascade or exist
        await db.execute(Base.metadata.tables['problem_tags'].delete())
        await db.execute(Base.metadata.tables['problem_companies'].delete())
        
        print(f"Seeding {len(problems_data)} mock problems...")
        
        db_problems = []
        for p_data in problems_data:
            p = CodingProblem(
                title=p_data["title"],
                slug=p_data["slug"],
                difficulty=p_data["difficulty"],
                description=p_data["description"],
                constraints=p_data["constraints"],
                examples=p_data["examples"],
                test_cases=p_data["test_cases"],
                boilerplate=p_data["boilerplate"]
            )
            db_problems.append(p)
            
        db.add_all(db_problems)
        await db.flush() # Flush to get IDs
        
        # Now add tags and companies
        all_tags = []
        all_companies = []
        
        for idx, p_data in enumerate(problems_data):
            p_id = db_problems[idx].id
            for t in p_data.get("tags", []):
                all_tags.append(ProblemTag(problem_id=p_id, name=t))
            for c in p_data.get("companies", []):
                all_companies.append(ProblemCompany(problem_id=p_id, name=c))
                
        db.add_all(all_tags)
        db.add_all(all_companies)
        
        await db.commit()
        print("Done seeding 300 problems.")

if __name__ == "__main__":
    asyncio.run(seed_data())
