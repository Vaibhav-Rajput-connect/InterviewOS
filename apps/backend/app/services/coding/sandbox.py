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

class DockerSandbox(SandboxManager):
    """
    Production-grade sandbox using Docker.
    Requires Docker to be running on the host.
    """
    
    # Map languages to minimal container images
    DOCKER_IMAGES = {
        "python": "python:3.11-slim",
        "javascript": "node:18-alpine",
        "typescript": "node:18-alpine",
        "java": "openjdk:17-slim",
        "cpp": "gcc:12",
        "go": "golang:1.20-alpine",
        "rust": "rust:1.70-slim"
    }

    def execute(self, command: list[str], cwd: str, timeout: int = 5) -> Dict:
        start_time = time.time()
        
        # We need to map the command back to a language to pick the right image,
        # but SandboxManager only takes a command. We can deduce it or pass it.
        # For a robust system, we should pass language to the sandbox, but since
        # the command often starts with 'python', 'node', 'java', etc:
        cmd_runner = command[0] if command else "python"
        
        # Simple heuristic mapping for this architecture
        image_name = self.DOCKER_IMAGES.get("python")
        if "node" in cmd_runner or "npx" in cmd_runner:
            image_name = self.DOCKER_IMAGES["javascript"]
        elif "java" in cmd_runner:
            image_name = self.DOCKER_IMAGES["java"]
        elif "g++" in cmd_runner or "./main" in command: # Simplification for compiled
            image_name = self.DOCKER_IMAGES["cpp"]
            
        docker_cmd = [
            "docker", "run", "--rm",
            "--network", "none",            # Complete network isolation
            "--memory", "128m",             # Prevent OOM crashes on host
            "--cpus", "0.5",                # Prevent CPU starvation
            "-v", f"{cwd}:/workspace",      # Mount the workspace
            "-w", "/workspace",             # Set working directory inside container
            image_name
        ] + command
        
        try:
            process = subprocess.run(
                docker_cmd,
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
            
            stdout = e.stdout.decode('utf-8') if e.stdout else ""
            stderr = e.stderr.decode('utf-8') if e.stderr else ""
            
            return {
                "stdout": stdout,
                "stderr": stderr,
                "exit_code": 124,
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
