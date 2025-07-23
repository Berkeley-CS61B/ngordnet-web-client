import json
from collections import defaultdict

synsets_in = defaultdict(list)
synsets_out = defaultdict(list)

synsetsFile = open("synsets.txt","r")

for line in synsetsFile.readlines():
    split = line.split(",")
    for word in split[1].split(" "):
        synsets_in[word].append(int(split[0]))
        synsets_out[int(split[0])].append(word)

out = open("synsets_in.json","w")
out.write(json.dumps(synsets_in))
out = open("synsets_out.json","w")
out.write(json.dumps(synsets_out))
out.close()