from json import dumps
from collections import defaultdict

obj = defaultdict(int)

f = open("word_history_size14377.csv")
for line in f.readlines():
    l = line.split("\t")
    obj[l[0]] += int(l[2])

out = open("all_words.json","w")
out.write(dumps(obj))
