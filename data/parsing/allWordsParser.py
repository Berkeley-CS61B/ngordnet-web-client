from json import dumps
from collections import defaultdict

obj = defaultdict(int)

f = open("top_49887_words.csv")
for line in f.readlines():
    l = line.split("\t")
    obj[l[0]] += int(l[2])

out = open("all_words.json","w")
out.write(dumps(obj))