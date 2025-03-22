import json

# Load first JSON file where CIK is the key
with open('companies_info.json', 'r') as f1:
    data1 = json.load(f1)

# Load second JSON file where CIK is inside 'cik_str'
with open('company_tickers.json', 'r') as f2:
    data2 = json.load(f2)

# Convert CIKs to sets for comparison
ciks_in_first = set(data1.keys())
ciks_in_second = {str(entry['cik_str']) for entry in data2.values()}

# Count how many companies in each file
num_first = len(ciks_in_first)
num_second = len(ciks_in_second)

# Total unique companies (union of CIKs)
total_unique = len(ciks_in_first.union(ciks_in_second))

# Find CIKs in first but not in second
missing_from_second = {cik: data1[cik]['Company Name'] for cik in ciks_in_first - ciks_in_second}

# Find CIKs in second but not in first
missing_from_first = {
    str(entry['cik_str']): entry['title']
    for entry in data2.values()
    if str(entry['cik_str']) not in ciks_in_first
}

# Write results to JSON files
with open('missing_from_second.json', 'w') as f:
    json.dump(missing_from_second, f, indent=4)

with open('missing_from_first.json', 'w') as f:
    json.dump(missing_from_first, f, indent=4)

print(f"Companies in first file: {num_first}")
print(f"Companies in second file: {num_second}")
print(f"Total unique companies (combined): {total_unique}")
print("Missing entries written to missing_from_second.json and missing_from_first.json")
