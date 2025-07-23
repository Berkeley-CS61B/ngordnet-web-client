from json import dumps
obj = set()

f = open("top_49887_words.csv")
for line in f.readlines():
    l = line.split("\t")
    obj.add(l[0])

out = open("all_words.json","w")
out.write(dumps(list(obj)))