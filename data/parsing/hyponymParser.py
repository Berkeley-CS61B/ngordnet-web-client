import json
from collections import defaultdict

obj = defaultdict(list)

hyponymsFile = open("hyponyms.txt","r")

for line in hyponymsFile.readlines():
    split = line.split(",")
    for word in split[1:]:
        obj[int(split[0])].append(int(word))

out = open("hyponyms.json","w")
out.write(json.dumps(obj))
out.close()