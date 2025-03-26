import subprocess
import os
import signal

PROJECT_KEYWORDS = ["super-investor", "fastapi.exe", "spawn_main"]
CONFIRM_BEFORE_KILL = True  # Set to False to auto-kill without confirmation


def list_python_processes():
    result = subprocess.run(['wmic', 'process', 'where', 'caption="python.exe"', 'get', 'ProcessId,CommandLine'],
                            capture_output=True, text=True)
    lines = result.stdout.strip().splitlines()[1:]  # Skip header
    processes = []

    for line in lines:
        if not line.strip():
            continue
        parts = line.rsplit(' ', 1)
        if len(parts) == 2:
            cmd, pid = parts
            pid = pid.strip()
            cmd = cmd.strip()
            if any(keyword.lower() in cmd.lower() for keyword in PROJECT_KEYWORDS):
                processes.append((int(pid), cmd))

    return processes


def kill_process(pid):
    try:
        os.kill(pid, signal.SIGTERM)
        print(f"✅ Killed PID {pid}")
    except Exception as e:
        print(f"❌ Failed to kill PID {pid}: {e}")


def main():
    procs = list_python_processes()
    if not procs:
        print("No matching FastAPI-related Python processes found.")
        return

    for pid, cmd in procs:
        print(f"\nFound: PID {pid}")
        print(f"Cmd: {cmd}")
        if CONFIRM_BEFORE_KILL:
            confirm = input("Kill this process? (y/n): ").strip().lower()
            if confirm != "y":
                continue
        kill_process(pid)


if __name__ == "__main__":
    main()
