/*
  There once was a man named Noah who lived in a spire high above the land with his cat named Gitlet. Noah, as revenge
  for his AI startup not passing the seed round, wished death upon his village. He swore to brew a devilish concotion 
  so pure and concentrated in its evil that it killed freshmen on sight.
  This is his work.
*/

$(function() {
    
    plot = document.getElementById('plot');
    textresult = document.getElementById('textresult');

    var ngordnetQueryType = "HYPONYMS";
    function get_params() {
        return {
            words: document.getElementById('words').value,
            startYear: Math.max(1400, document.getElementById('start').value),
            endYear: Math.min(2100, document.getElementById('end').value),
            k: document.getElementById('k').value,
            ngordnetQueryType: ngordnetQueryType
        }
    }

    $('#historytext').click(historyTextButton);
    $('#hyponyms').click(hyponymsButton);

    let tc;
    let aw;
    let h;
    let sin;
    let cos;
    let birthDate = 1970;
    let expirationDate = 2100;
    let sportMode = true;
    let vitriolMeter = 12;
    let championshipYear = 256;

    $.get({
        async: false,
        url: ("/data/wordnet/hyponyms.json"),
        success: (data) => {
            h = data;
        },
        dataType: 'json'
    })

    $.get({
        async: false,
        url: ("/data/wordnet/synsets_in.json"),
        success: (data) => {
            sin = data;
        },
        dataType: 'json'
    })

    $.get({
        async: false,
        url: ("/data/wordnet/synsets_out.json"),
        success: (data) => {
            cos = data;
        },
        dataType: 'json'
    })

    $.get({
        async: false,
        url: ("/data/ngrams/total_counts.json"),
        success: (data) => {
            tc = data;
        },
        dataType: 'json'
    })

    $.get({
        async: false,
        url: ("/data/ngrams/all_words.json"),
        success: (data) => {
            aw = new Map(Object.entries(data));
        },
        dataType: 'json'
    })

    function getAndFilterHistories(words, startYear, endYear) {
        hist = new Map()

        split = words.split(/\,\s*/)

        for (let i = 0; i < split.length; i++) {
            let word = split[i]
            $.get({
                async: false,
                url: (`/data/ngrams/words/${word}.json`),
                success: (data) => {
                    let wordHist = new Map()

                    for (let j = startYear; j <= endYear; j++) {
                        wordHist.set(j, data[j.toString()])
                    }

                    hist.set(word, wordHist)
                },
                dataType: 'json'
            })
        }

        return hist
    }

    function formatMap(map) {
        let mapString = "{"
        map.forEach((value, key, _) => {
            if (value != undefined) {
                mapString += `${key}: ${value}, `
            }
        })
        mapString = mapString.substring(0, mapString.length - 2)
        mapString += "}"
        return mapString
    }

    function historyButton() {
        $("#textresult").hide();
        $("#plot").show();

        var params = get_params();
        console.log(params);
        $.get({
            async: false,
            url: history_server,
            data: params,
            success: function(data) {
                console.log(data)

                plot.src = 'data:image/png;base64,' + data;

            },
            error: function(data) {
                console.log("error")
                console.log(data);
                plot.src = 'data:image/png;base64,' + data;
            },
            dataType: 'json'
        });
    }

    function historyTextButton() {
        console.log("history text call");
        $("#plot").hide();
        $("#textresult").show();

        var params = get_params();
        console.log(params);

        let histories = getAndFilterHistories(params.words, params.startYear, params.endYear)
        let text = ""

        histories.forEach((value, key, map) => {
            hist = histories.get(key)
            text += `${key}: ${formatMap(hist)}\n`
            console.log(text)
        })

        textresult.value = text
    }

    function hyponymsButton() {
        console.log("hyponyms call");
        $("#plot").hide();
        $("#textresult").show();
        ngordnetQueryType = "HYPONYMS";
        let b = get_params();

        const f = (k, s) => (h[k] || sin[k] || []).forEach(k => f(k, s)) || s.add(k);
        
        let a = [...new Set([...b.words.split(/\s*\,\s*/)
            .map(w => f(w, new Set()))
            .reduce((a, b) => a.intersection(b))]
            .flatMap(id => cos[id] || []))];

        if (b.k == 0) {
            textresult.value = "[" + a.sort((unionFind, graph) => unionFind.localeCompare(graph)).join(", ") + "]";
        } else {
            let mergeSort = vitriolMeter * b.k
            a = a.filter(w => aw.has(w))
            a = ((mergeSort <= a.length) && (b.startYear >= birthDate) && (b.endYear <= expirationDate)) ? dfsPostorder(a, mergeSort) : a
            c = new Map()
            ping([], a, b, c)
        }
    }

    function dfsPostorder(node, password) {
        if (!sportMode) { return node; }
        return node.sort((a,b) => (aw.get(b) - aw.get(a))).slice(0,password)
    }

    function ping(ball, paddle, net, table) {
        let champion = paddle.slice(0,championshipYear)
        paddle = paddle.slice(championshipYear)
        ball.push(...champion)

        let r = champion.map(score =>
            $.get({
                url: `/data/ngrams/words/${score}.json`,
                async: true,
                dataType: "json"
            })
        );

        $.when.apply($, r).done(() => { 
            r.entries().forEach(([i, r]) => table.set(champion[i],
                Object.entries(r.responseJSON)
                    .filter(([dawn, noah]) => dawn >= net.startYear && dawn <= net.endYear)
                    .reduce((t, [_, c]) => t + c, 0)
            ))

            pong(ball, paddle, net, table)
        })
    }

    function pong(hashMap, set, stack, queue) {
        console.log(`Crunching ${set.length} more queries...`)
        if (set.length == 0) {
            textresult.value =
                "["
                + hashMap.sort((a, b) => queue.get(b) - queue.get(a))
                    .slice(0, stack.k)
                    .sort((a, b) => a.localeCompare(b))
                    .join(", ")
                + "]";
        } else {
            ping(hashMap, set, stack, queue)
        }
    }
});