import ast
import re
from typing import Tuple

class SecurityValidator:
    """
    Validates code input before execution to prevent basic malicious payloads.
    Uses AST for Python and Regex for other languages.
    """
    
    # Modules that are completely blocked in Python
    BLOCKED_PYTHON_MODULES = {
        "os", "sys", "subprocess", "socket", "pty", "pathlib", 
        "shutil", "urllib", "requests", "http", "ftp", "telnetlib",
        "multiprocessing", "threading", "tempfile"
    }
    
    # Functions that are blocked in Python
    BLOCKED_PYTHON_FUNCS = {
        "eval", "exec", "open", "compile", "__import__"
    }
    
    # Regex patterns for JavaScript/TypeScript
    BLOCKED_JS_PATTERNS = [
        r"require\s*\(\s*['\"](child_process|fs|net|http|https|os|cluster)['\"]\s*\)",
        r"import\s+.*\s+from\s+['\"](child_process|fs|net|http|https|os|cluster)['\"]",
        r"eval\s*\(",
        r"Function\s*\(",
        r"setTimeout\s*\(.*,\s*0\s*\)", # Potential event loop abuse
        r"setInterval\s*\("
    ]

    @classmethod
    def validate(cls, code: str, language: str) -> Tuple[bool, str]:
        """
        Validates the given code.
        Returns (is_valid, error_message)
        """
        if language == "python":
            return cls._validate_python(code)
        elif language in ["javascript", "typescript"]:
            return cls._validate_js(code)
        # Add other languages as needed. For now, allow others or apply basic regex.
        return True, ""

    @classmethod
    def _validate_python(cls, code: str) -> Tuple[bool, str]:
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            # If it doesn't parse, let the execution engine handle the SyntaxError
            return True, ""

        for node in ast.walk(tree):
            # Check for blocked imports
            if isinstance(node, ast.Import):
                for alias in node.names:
                    base_module = alias.name.split('.')[0]
                    if base_module in cls.BLOCKED_PYTHON_MODULES:
                        return False, f"Security Violation: Import of module '{alias.name}' is blocked."
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    base_module = node.module.split('.')[0]
                    if base_module in cls.BLOCKED_PYTHON_MODULES:
                        return False, f"Security Violation: Import from module '{node.module}' is blocked."
            
            # Check for blocked function calls (like eval, exec, open)
            elif isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name):
                    if node.func.id in cls.BLOCKED_PYTHON_FUNCS:
                        return False, f"Security Violation: Function '{node.func.id}' is blocked."
                
                # Check for object attributes like os.system if somehow imported dynamically
                # (Though we block dynamic imports and __import__, it's good defense in depth)
                elif isinstance(node.func, ast.Attribute):
                    if isinstance(node.func.value, ast.Name):
                        if node.func.value.id in cls.BLOCKED_PYTHON_MODULES:
                            return False, f"Security Violation: Access to module '{node.func.value.id}' is blocked."

        return True, ""

    @classmethod
    def _validate_js(cls, code: str) -> Tuple[bool, str]:
        for pattern in cls.BLOCKED_JS_PATTERNS:
            if re.search(pattern, code):
                return False, "Security Violation: Blocked function or module detected in code."
        return True, ""
