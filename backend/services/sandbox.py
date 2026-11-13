"""Isolated subprocess runner for executing Python code in a sandbox."""

from __future__ import annotations

import asyncio
import logging
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path

from config import settings

logger = logging.getLogger(__name__)


@dataclass
class SandboxResult:
    """Result of a sandboxed execution."""
    stdout: str
    stderr: str
    return_code: int
    timed_out: bool


async def run_in_sandbox(
    code: str,
    timeout: int | None = None,
    extra_env: dict[str, str] | None = None,
) -> SandboxResult:
    """Execute *code* as a Python script inside an isolated temp directory.

    * A fresh temp directory under ``settings.sandbox_base_dir`` is created.
    * The script is written there and executed via ``python``.
    * stdout / stderr are captured.
    * A hard timeout (default ``settings.sandbox_timeout_seconds``) kills
      the process if it runs too long.
    * The temp directory is cleaned up afterwards.
    """
    timeout = timeout or settings.sandbox_timeout_seconds
    sandbox_dir = Path(settings.sandbox_base_dir)
    sandbox_dir.mkdir(parents=True, exist_ok=True)

    # Create a temp directory for this run
    run_dir = Path(tempfile.mkdtemp(dir=str(sandbox_dir), prefix="run_"))
    script_path = run_dir / "script.py"
    script_path.write_text(code, encoding="utf-8")

    env = os.environ.copy()
    # Restrict some env vars for safety
    env["HOME"] = str(run_dir)
    env["TMPDIR"] = str(run_dir)
    if extra_env:
        env.update(extra_env)

    timed_out = False
    try:
        proc = await asyncio.create_subprocess_exec(
            "python",
            str(script_path),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=str(run_dir),
            env=env,
        )

        try:
            stdout_bytes, stderr_bytes = await asyncio.wait_for(
                proc.communicate(), timeout=timeout
            )
        except asyncio.TimeoutError:
            proc.kill()
            await proc.wait()
            timed_out = True
            stdout_bytes = b""
            stderr_bytes = b"Execution timed out after %d seconds" % timeout

        return SandboxResult(
            stdout=stdout_bytes.decode("utf-8", errors="replace"),
            stderr=stderr_bytes.decode("utf-8", errors="replace"),
            return_code=proc.returncode if proc.returncode is not None else -1,
            timed_out=timed_out,
        )
    except FileNotFoundError:
        logger.error("Python interpreter not found")
        return SandboxResult(
            stdout="",
            stderr="Python interpreter not found on PATH",
            return_code=-1,
            timed_out=False,
        )
    except Exception as exc:
        logger.exception("Sandbox execution error")
        return SandboxResult(
            stdout="",
            stderr=str(exc),
            return_code=-1,
            timed_out=False,
        )
    finally:
        # Clean up
        try:
            import shutil
            shutil.rmtree(run_dir, ignore_errors=True)
        except Exception:
            pass
