import asyncio
import os
import sys

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
        # Check if we already have problems
        from sqlalchemy import select
        result = await db.execute(select(CodingProblem).limit(1))
        existing = result.scalar_one_or_none()
        
        if existing:
            print("Problems already seeded.")
            return

        print("Seeding mock problems...")
        p1 = CodingProblem(
            title="Two Sum",
            slug="two-sum",
            difficulty="Easy",
            description="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            constraints=["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
            examples=[
                {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."},
                {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"},
                {"input": "nums = [3,3], target = 6", "output": "[0,1]"}
            ],
            test_cases=[
                {"args": [[2,7,11,15], 9], "expected": [0,1], "is_hidden": False},
                {"args": [[3,2,4], 6], "expected": [1,2], "is_hidden": False},
                {"args": [[3,3], 6], "expected": [0,1], "is_hidden": False},
                {"args": [[2,5,5,11], 10], "expected": [1,2], "is_hidden": True}
            ],
            boilerplate={"typescript": "function twoSum(nums: number[], target: number): number[] {\n    \n};"}
        )
        
        p2 = CodingProblem(
            title="Add Two Numbers",
            slug="add-two-numbers",
            difficulty="Medium",
            description="You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.",
            constraints=["The number of nodes in each linked list is in the range [1, 100].", "0 <= Node.val <= 9"],
            examples=[],
            boilerplate={"typescript": "function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {\n    \n};"}
        )
        
        db.add_all([p1, p2])
        await db.flush() # Flush to get IDs
        
        tags_p1 = [ProblemTag(problem_id=p1.id, name=t) for t in ["Array", "Hash Table"]]
        companies_p1 = [ProblemCompany(problem_id=p1.id, name=c) for c in ["Google", "Amazon", "Apple", "Spotify"]]
        
        tags_p2 = [ProblemTag(problem_id=p2.id, name=t) for t in ["Linked List", "Math"]]
        companies_p2 = [ProblemCompany(problem_id=p2.id, name=c) for c in ["Amazon", "Microsoft", "Bloomberg"]]
        
        db.add_all(tags_p1 + tags_p2 + companies_p1 + companies_p2)
        
        await db.commit()
        print("Done seeding problems.")

if __name__ == "__main__":
    asyncio.run(seed_data())
