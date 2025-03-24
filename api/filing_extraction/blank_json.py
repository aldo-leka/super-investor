import json
import sys
from typing import Any

def blank_values(data: Any) -> Any:
    """
    Recursively replace all values in a JSON-like structure with empty strings,
    keeping keys and structure the same.
    """
    if isinstance(data, dict):
        return {k: blank_values(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [blank_values(item) for item in data]
    else:
        return ""  # replace any value (str, int, bool, etc.) with empty string

def process_file(input_path: str, output_path: str):
    with open(input_path, "r", encoding="utf-8") as infile:
        data = json.load(infile)

    blanked = blank_values(data)

    with open(output_path, "w", encoding="utf-8") as outfile:
        json.dump(blanked, outfile, indent=2)

    print(f"Blanked JSON written to {output_path}")

if __name__ == "__main__":
    # Example usage:
    # python blank_values.py input.json output.json
    if len(sys.argv) != 3:
        print("Usage: python blank_values.py <input_file> <output_file>")
    else:
        process_file(sys.argv[1], sys.argv[2])
