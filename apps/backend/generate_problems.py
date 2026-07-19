import json
import random

TOPICS = [
    "Arrays", "Strings", "Hash Table", "Linked List", "Stack", "Queue", 
    "Tree", "BST", "Heap", "Graph", "DFS", "BFS", "Dynamic Programming", 
    "Greedy", "Binary Search", "Sliding Window", "Backtracking", "Trie", 
    "Bit Manipulation", "Math", "Sorting", "Intervals", "Priority Queue"
]

COMPANIES = [
    "Google", "Amazon", "Facebook", "Microsoft", "Apple", "Netflix", 
    "Uber", "Airbnb", "Lyft", "Pinterest", "Snapchat", "Stripe", "Square", 
    "Palantir", "Bloomberg", "LinkedIn", "Twitter", "Goldman Sachs"
]

DIFFICULTIES = ["Easy", "Medium", "Hard"]

TEMPLATES = [
    {
        "title_template": "Find the {} in an Array",
        "desc_template": "Given an array of integers, find the {}.",
        "slug_template": "find-the-{}-in-an-array",
        "tags": ["Arrays"]
    },
    {
        "title_template": "Maximum {} Subarray",
        "desc_template": "Given an integer array, find the contiguous subarray (containing at least one number) which has the largest {} and return its sum.",
        "slug_template": "maximum-{}-subarray",
        "tags": ["Arrays", "Dynamic Programming"]
    },
    {
        "title_template": "Valid {}",
        "desc_template": "Given a string s containing just the characters '(', ')', '{{', '}}', '[' and ']', determine if the input string is a valid {}.",
        "slug_template": "valid-{}",
        "tags": ["Strings", "Stack"]
    },
    {
        "title_template": "Merge Two Sorted {}",
        "desc_template": "You are given the heads of two sorted {}. Merge the two lists in a one sorted list.",
        "slug_template": "merge-two-sorted-{}",
        "tags": ["Linked List", "Sorting"]
    },
    {
        "title_template": "Search in a {} Array",
        "desc_template": "There is an integer array nums sorted in ascending order (with distinct values). Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.",
        "slug_template": "search-in-a-{}-array",
        "tags": ["Arrays", "Binary Search"]
    },
    {
        "title_template": "Binary Tree {} Traversal",
        "desc_template": "Given the root of a binary tree, return the {} traversal of its nodes' values.",
        "slug_template": "binary-tree-{}-traversal",
        "tags": ["Tree", "DFS", "BFS"]
    },
    {
        "title_template": "Number of {}s",
        "desc_template": "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of {}s.",
        "slug_template": "number-of-{}s",
        "tags": ["Graph", "DFS", "BFS"]
    },
    {
        "title_template": "Climbing {}",
        "desc_template": "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top of the {}?",
        "slug_template": "climbing-{}",
        "tags": ["Math", "Dynamic Programming"]
    },
    {
        "title_template": "Longest Substring Without Repeating {}",
        "desc_template": "Given a string s, find the length of the longest substring without repeating {}.",
        "slug_template": "longest-substring-without-repeating-{}",
        "tags": ["Strings", "Hash Table", "Sliding Window"]
    },
    {
        "title_template": "Word {} II",
        "desc_template": "Given an m x n board of characters and a list of strings words, return all words on the board.",
        "slug_template": "word-{}-ii",
        "tags": ["Strings", "Backtracking", "Trie"]
    }
]

FILLERS = [
    "Elements", "Nodes", "Characters", "Values", "Items", "Numbers", "Paths",
    "Sequences", "Combinations", "Permutations", "Subsets", "Islands", "Stairs",
    "Trees", "Graphs", "Matrices", "Points", "Lines", "Pairs", "Triplets", "Anagrams",
    "Palindromes", "Prefixes", "Suffixes", "Vowels", "Consonants", "Digits", "Bits",
    "Coins", "Steps", "Jumps", "Words", "Sentences", "Paragraphs", "Lists", "Arrays",
    "Queues", "Stacks", "Heaps", "Dictionaries", "Sets", "Maps", "Tuples"
]

def generate_problems(count=300):
    problems = []
    seen_titles = set()
    
    # Keep Two Sum and Add Two Numbers as the first two to maintain consistency
    first_two = [
        {
            "title": "Two Sum",
            "slug": "two-sum",
            "difficulty": "Easy",
            "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            "constraints": ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9", "-10^9 <= target <= 10^9"],
            "examples": [
                {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]", "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."}
            ],
            "test_cases": [
                {"args": [[2,7,11,15], 9], "expected": [0,1], "is_hidden": False}
            ],
            "boilerplate": {"typescript": "function twoSum(nums: number[], target: number): number[] {\n    \n};"},
            "tags": ["Array", "Hash Table"],
            "companies": ["Google", "Amazon", "Apple"],
            "acceptance": "65.2%"
        },
        {
            "title": "Add Two Numbers",
            "slug": "add-two-numbers",
            "difficulty": "Medium",
            "description": "You are given two non-empty linked lists representing two non-negative integers. Add the two numbers and return the sum as a linked list.",
            "constraints": ["The number of nodes in each linked list is in the range [1, 100].", "0 <= Node.val <= 9"],
            "examples": [],
            "test_cases": [],
            "boilerplate": {"typescript": "function addTwoNumbers(l1: ListNode | null, l2: ListNode | null): ListNode | null {\n    \n};"},
            "tags": ["Linked List", "Math"],
            "companies": ["Amazon", "Microsoft", "Bloomberg"],
            "acceptance": "45.1%"
        }
    ]
    
    problems.extend(first_two)
    seen_titles.add("Two Sum")
    seen_titles.add("Add Two Numbers")
    
    while len(problems) < count:
        template = random.choice(TEMPLATES)
        filler = random.choice(FILLERS)
        
        title = template["title_template"].format(filler)
        if title in seen_titles:
            continue
            
        seen_titles.add(title)
        
        slug = template["slug_template"].format(filler.lower())
        desc = template["desc_template"].format(filler.lower())
        
        difficulty = random.choice(DIFFICULTIES)
        
        # Random acceptance rate between 20.0% and 80.0%
        acc = round(random.uniform(20.0, 80.0), 1)
        
        num_tags = random.randint(1, 4)
        tags = list(set(template["tags"] + random.sample(TOPICS, num_tags)))
        
        num_companies = random.randint(1, 5)
        companies = random.sample(COMPANIES, num_companies)
        
        # Camel case for function name
        func_name = "".join(x.capitalize() for x in title.split(" "))
        func_name = func_name.replace("-", "")
        func_name = func_name[0].lower() + func_name[1:]
        
        boilerplate = {
            "typescript": f"function {func_name}(): any {{\n    // Implementation here\n}};"
        }
        
        problem = {
            "title": title,
            "slug": slug,
            "difficulty": difficulty,
            "description": desc,
            "constraints": ["Length <= 10^5", "Elements >= 0"],
            "examples": [
                {"input": "example input", "output": "example output", "explanation": "example explanation"}
            ],
            "test_cases": [],
            "boilerplate": boilerplate,
            "tags": tags[:4],
            "companies": companies,
            "acceptance": f"{acc}%"
        }
        
        problems.append(problem)
        
    with open("generated_problems.json", "w") as f:
        json.dump(problems, f, indent=4)
        
    print(f"Successfully generated {len(problems)} problems to generated_problems.json")

if __name__ == "__main__":
    generate_problems(300)
