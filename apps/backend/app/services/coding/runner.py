import os
import uuid
from typing import Dict, Any
from app.services.coding.sandbox import SandboxManager, LocalSandbox, DockerSandbox, create_workspace, cleanup_workspace
from app.services.coding.security import SecurityValidator

# Map language to file extension and execution command
LANGUAGE_CONFIG: Dict[str, Dict[str, Any]] = {
    "python": {
        "extension": ".py",
        "command": ["python"]
    },
    "javascript": {
        "extension": ".js",
        "command": ["node"]
    },
    "typescript": {
        "extension": ".ts",
        "compile_command": ["npx", "tsc"],
        "command": ["node"]
    },
    "java": {
        "extension": ".java",
        # Java requires compilation or newer java versions can run source directly (Java 11+)
        "command": ["java"]
    },
    "cpp": {
        "extension": ".cpp",
        # C++ requires compilation. We'll handle this specially in the execute logic if needed,
        # or just assume a script runner for now. For a robust system, we would compile then run.
        "compile_command": ["g++", "-O2", "-std=c++17", "-o", "main"],
        "command": ["./main"]
    },
    "go": {
        "extension": ".go",
        "command": ["go", "run"]
    },
    "rust": {
        "extension": ".rs",
        "compile_command": ["rustc", "-o", "main"],
        "command": ["./main"]
    }
}

class CodeRunner:
    def __init__(self):
        self.sandbox: SandboxManager
        # Default to DockerSandbox for production security
        # Fall back to LocalSandbox only if configured (e.g. for simple local testing)
        if os.environ.get("USE_LOCAL_SANDBOX") == "true" or os.environ.get("RENDER") is not None:
            self.sandbox = LocalSandbox()
        else:
            self.sandbox = DockerSandbox()
            
    def _inject_test_runner(self, code: str, language: str, test_cases: list) -> str:
        import json
        import re
        cases_json = json.dumps(test_cases)
        
        if language == "python":
            # Extract function name
            match = re.search(r'def\s+(\w+)\s*\(', code)
            func_name = match.group(1) if match else "twoSum"
            wrapper = f"""
import json, time, traceback

__cases = {cases_json}
__results = []
__passed = 0
__failed = 0

for i, tc in enumerate(__cases):
    try:
        t0 = time.time()
        # Parse inputs if they are strings from DB (e.g., "[2,7,11,15]\\n9")
        # For simplicity, we just assume the function takes these as raw strings if not args,
        # but wait, if it's "args", we expand it. If it's "input", we pass it as a single string.
        # Actually, let's just pass the raw input to the user's function if it's HackerRank style,
        # or evaluate it if it's LeetCode style.
        input_data = tc.get('args', tc.get('input'))
        if isinstance(input_data, list):
            res = {func_name}(*input_data)
        elif isinstance(input_data, str) and '\\n' in input_data:
            # Quick hack for twoSum seeded string
            parts = input_data.split('\\n')
            res = {func_name}(json.loads(parts[0]), json.loads(parts[1]))
        else:
            res = {func_name}(input_data)
            
        t1 = time.time()
        
        # Check expected
        expected = json.loads(tc['expected']) if isinstance(tc['expected'], str) else tc['expected']
        passed = (res == expected)
        if passed:
            __passed += 1
        else:
            __failed += 1
            
        __results.append({{
            "test_case": i + 1,
            "passed": passed,
            "expected": expected,
            "actual": res,
            "time_ms": int((t1-t0)*1000)
        }})
    except Exception as e:
        __failed += 1
        __results.append({{
            "test_case": i + 1,
            "passed": False,
            "error": str(e)
        }})

print("---TEST_RESULTS_BEGIN---")
print(json.dumps({{"passed_count": __passed, "failed_count": __failed, "results": __results}}))
print("---TEST_RESULTS_END---")
"""
            return code + "\n" + wrapper
            
        elif language in ["javascript", "typescript"]:
            match = re.search(r'function\s+(\w+)\s*\(', code)
            func_name = match.group(1) if match else "twoSum"
            wrapper = f"""
const __cases = {cases_json};
const __results = [];
let __passed = 0;
let __failed = 0;

for (let i = 0; i < __cases.length; i++) {{
    const tc = __cases[i];
    try {{
        const t0 = Date.now();
        let inputData = tc.args || tc.input;
        let res;
        if (Array.isArray(inputData)) {{
            res = {func_name}(...inputData);
        }} else if (typeof inputData === 'string' && inputData.includes('\\n')) {{
            const parts = inputData.split('\\n');
            res = {func_name}(JSON.parse(parts[0]), JSON.parse(parts[1]));
        }} else {{
            res = {func_name}(inputData);
        }}
        const t1 = Date.now();
        
        const expected = typeof tc.expected === 'string' ? JSON.parse(tc.expected) : tc.expected;
        const passed = JSON.stringify(res) === JSON.stringify(expected);
        if (passed) __passed++;
        else __failed++;
        
        __results.push({{
            test_case: i + 1,
            passed: passed,
            expected: expected,
            actual: res,
            time_ms: t1 - t0
        }});
    }} catch (e) {{
        __failed++;
        __results.push({{
            test_case: i + 1,
            passed: false,
            error: e.toString()
        }});
    }}
}}
console.log("---TEST_RESULTS_BEGIN---");
console.log(JSON.stringify({{passed_count: __passed, failed_count: __failed, results: __results}}));
console.log("---TEST_RESULTS_END---");
"""
            return code + "\n" + wrapper
            
        return code

    def execute(self, language: str, code: str, problem_id: str | None = None, test_cases: list | None = None) -> Dict[str, Any]:
        """
        Orchestrates code execution by setting up the workspace, writing code, 
        and invoking the sandbox.
        """
        # 1. Security Validation
        is_valid, error_msg = SecurityValidator.validate(code, language)
        if not is_valid:
            return {
                "stdout": "",
                "stderr": error_msg,
                "exit_code": 1,
                "time_ms": 0,
                "status": "Security Violation",
                "test_results": [],
                "passed_count": 0,
                "failed_count": 0
            }

        if language not in LANGUAGE_CONFIG:
            return {
                "stdout": "",
                "stderr": f"Unsupported language: {language}",
                "exit_code": 1,
                "time_ms": 0,
                "status": "Internal Error",
                "test_results": [],
                "passed_count": 0,
                "failed_count": 0
            }
            
        if test_cases:
            code = self._inject_test_runner(code, language, test_cases)
            
        config = LANGUAGE_CONFIG[language]
        workspace = create_workspace()
        
        try:
            # For compiled languages, we usually name the file Main or main
            # Java classes need to match filename if public, we'll just use Main.java
            filename = f"Main{config['extension']}"
            if language == "python":
                filename = f"solution{config['extension']}"
            elif language in ["javascript", "typescript"]:
                filename = f"index{config['extension']}"
                
            file_path = os.path.join(workspace, filename)
            
            with open(file_path, "w") as f:
                f.write(code)
                
            # If the language requires compilation (like C++ or Rust)
            if "compile_command" in config:
                compile_cmd = config["compile_command"] + [filename]
                compile_result = self.sandbox.execute(compile_cmd, cwd=workspace, timeout=10)
                
                # If compilation fails, return the error
                if compile_result["exit_code"] != 0:
                    compile_result["status"] = "Compilation Error"
                    return compile_result

            # Execute the code
            run_cmd = config["command"]
            if language not in ["cpp", "rust"]:
                run_file = filename
                if language == "typescript":
                    run_file = filename.replace(".ts", ".js")
                run_cmd = run_cmd + [run_file]
                
            result = self.sandbox.execute(run_cmd, cwd=workspace, timeout=5)
            
            # Extract test results from stdout
            import re
            import json
            test_results = []
            passed_count = 0
            failed_count = 0
            
            if result.get("stdout"):
                match = re.search(r'---TEST_RESULTS_BEGIN---\n(.*)\n---TEST_RESULTS_END---', result["stdout"], re.DOTALL)
                if match:
                    try:
                        parsed = json.loads(match.group(1))
                        test_results = parsed.get("results", [])
                        passed_count = parsed.get("passed_count", 0)
                        failed_count = parsed.get("failed_count", 0)
                        # Remove the injected output from stdout
                        result["stdout"] = result["stdout"].replace(match.group(0) + "\n", "").replace(match.group(0), "")
                    except Exception:
                        pass
                        
            result["test_results"] = test_results
            result["passed_count"] = passed_count
            result["failed_count"] = failed_count
            
            return result
            
        finally:
            cleanup_workspace(workspace)
