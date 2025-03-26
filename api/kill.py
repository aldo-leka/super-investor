import psutil
import os

# Safer keywords — for Python-based FastAPI/dev servers only
keywords = [
    "main.py",
    "fastapi",
    "spawn_main"
]

current_pid = os.getpid()
killed = []

for proc in psutil.process_iter(['pid', 'cmdline', 'name']):
    try:
        pid = proc.info['pid']
        name = proc.info['name']
        cmdline = " ".join(proc.info['cmdline']) if proc.info['cmdline'] else ""

        # Skip self
        if pid == current_pid:
            continue

        # Only target Python processes (strict filter)
        if name and "python" in name.lower():
            if any(keyword in cmdline for keyword in keywords):
                print(f"Killing PID {pid}: {cmdline}")
                proc.kill()
                killed.append(pid)

    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
        continue

if not killed:
    print("No matching FastAPI-related processes found.")
else:
    print(f"Killed PIDs: {killed}")
