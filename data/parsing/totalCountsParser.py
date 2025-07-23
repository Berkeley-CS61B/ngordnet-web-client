import json
target = "total_counts.csv"

obj = {}

f = open(target, "r")
for line in f.readlines():
    split = line.split(",")
    obj[int(split[0])] = int(split[1])

out = open("total_counts.json", "w")
out.write(json.dumps(obj))