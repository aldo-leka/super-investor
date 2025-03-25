import os
import itertools
from collections import Counter

MASTER_DIR = "masterdatadownload"  # or full path if needed


def parse_master_idx(file_path):
    with open(file_path, "rb") as f:
        lines = [
            line.decode("latin-1").strip()
            for line in itertools.islice(f, 11, None)
            if "|" in line.decode("latin-1")
        ]
        return [line.split("|")[4] for line in lines]  # txt_filename is the 5th field


def collect_all_filenames():
    all_filenames = []

    for root, dirs, files in os.walk(MASTER_DIR):
        for file in files:
            if file == "master.idx":
                idx_path = os.path.join(root, file)
                try:
                    filenames = parse_master_idx(idx_path)
                    all_filenames.extend(filenames)
                except Exception as e:
                    print(f"⚠️ Failed to read {idx_path}: {e}")

    return all_filenames


def main():
    print("🔍 Scanning all master.idx files...")
    all_filenames = collect_all_filenames()

    total = len(all_filenames)
    counts = Counter(all_filenames)
    duplicates = [fname for fname, count in counts.items() if count > 1]

    print(f"\n📊 Total filings parsed: {total}")
    print(f"✅ Unique filenames: {len(counts)}")
    print(f"❌ Duplicate filenames: {len(duplicates)}\n")

    if duplicates:
        print("🚨 Duplicate filenames:")
        for fname in duplicates:
            print(f"- {fname} (count: {counts[fname]})")


if __name__ == "__main__":
    main()
