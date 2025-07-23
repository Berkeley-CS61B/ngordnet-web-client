from os import mkdir
from json import dumps
target = "top_49887_words.csv"

lastWord = ""
years = {}

def flush():
    global years
    if len(years) > 0:
        newFile = open("words/" + lastWord + ".json", "w")
        newFile.write(dumps(years))
        newFile.close()

        years = {}

f = open(target, "r")

for line in f.readlines():
    l = line.split("\t")

    if (lastWord != l[0]):

        flush()
        lastWord = l[0]

    years[int(l[1])] = int(l[2])

flush()
    