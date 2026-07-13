from abc import ABC, abstractmethod
import subprocess
import time
import os
import shutil
import tempfile
from typing import Dict, Optional, Tuple

class SandboxManager(ABC):
    """
    Abstract interface for executing code in a sandboxed environment.
    Designed to be implemented by LocalSandbox, DockerSandbox, etc.
    """
    
    @abstractmethod
    def execute(self, command: list[str], cwd: str, timeout: int = 5) -> Dict:
        """
        Executes a command inside the sandbox.
        
        Args:
            command: The command to run as a list of strings.
            cwd: The working directory for the command.
            timeout: Maximum execution time in seconds.
            
        Returns:
            Dict containing stdout, stderr, exit_code, time_ms, and status.
        """
        pass

class LocalSandbox(SandboxManager):
    """
    A simple local subprocess sandbox for development.
    Uses basic timeout. In production, this should be swapped with Docker/Firecracker.
    """
    
    def execute(self, command: list[str], cwd: str, timeout: int = 5) -> Dict:
        start_time = time.time()
        
        try:
            # Run the process
            process = subprocess.run(
                command,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            end_time = time.time()
            time_ms = int((end_time - start_time) * 1000)
            
            status = 'Accepted' if process.returncode == 0 else 'Runtime Error'
            
            return {
                "stdout": process.stdout,
                "stderr": process.stderr,
                "exit_code": process.returncode,
                "time_ms": time_ms,
                "status": status
            }
            
        except subprocess.TimeoutExpired as e:
            end_time = time.time()
            time_ms = int((end_time - start_time) * 1000)
            
            # Extract whatever output was captured before timeout (if any)
            stdout = e.stdout.decode('utf-8') if e.stdout else ""
            stderr = e.stderr.decode('utf-8') if e.stderr else ""
            
            return {
                "stdout": stdout,
                "stderr": stderr,
                "exit_code": 124, # Standard timeout exit code
                "time_ms": time_ms,
                "status": "Time Limit Exceeded"
            }
        except Exception as e:
            end_time = time.time()
            time_ms = int((end_time - start_time) * 1000)
            return {
                "stdout": "",
                "stderr": str(e),
                "exit_code": 1,
                "time_ms": time_ms,
                "status": "Internal Error"
            }

def create_workspace() -> str:
    """Creates a temporary isolated workspace directory."""
    return tempfile.mkdtemp(prefix="interviewos_sandbox_")

def cleanup_workspace(workspace_dir: str):
    """Cleans up the temporary workspace directory."""
    if os.path.exists(workspace_dir):
        shutil.rmtree(workspace_dir, ignore_errors=True)
