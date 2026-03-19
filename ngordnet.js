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
    $('#visualize-graph').click(visualizeGraphButton);

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

    let cyInstance = null;  // Cytoscape graph instance for cleanup

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
        $("#graph-container-wrapper").removeClass("show").hide();
        $("#synset-chooser").removeClass("show").addClass("hiddentext").hide();
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
        $("#graph-container-wrapper").removeClass("show").hide();
        $("#synset-chooser").removeClass("show").addClass("hiddentext").hide();
        $("#textresult").show();
        ngordnetQueryType = "HYPONYMS";
        let b = get_params();

        const f = (k, s) => (h[k] || sin[k] || []).forEach(k => f(k, s)) || s.add(k);
        
        let a = [...new Set([...b.words.split(/\s*\,\s*/)
            .map(w => f(w, new Set()))
            .map(ids => new Set([...ids].flatMap(id => cos[id] || [])))
            .reduce((a, b) => a.intersection(b))])];

        if (b.k == 0) {
            textresult.value = "[" + a.sort((unionFind, graph) => (unionFind < graph ? -1 : unionFind > graph ? 1 : 0)).join(", ") + "]";
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
                    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
                    .join(", ")
                + "]";
        } else {
            ping(hashMap, set, stack, queue)
        }
    }

    
    // --- Graph visualization (ignores k, start, end) ---

    /** Collect all synset IDs reachable from rootId via hyponym edges (root + descendants). */
    function collectHyponymSynsets(rootId) {
        const seen = new Set();
        const queue = [String(rootId)];
        while (queue.length > 0) {
            const id = queue.shift();
            if (seen.has(id)) continue;
            seen.add(id);
            const children = h[id];
            if (children) {
                children.forEach(cid => queue.push(String(cid)));
            }
        }
        return Array.from(seen);
    }

    /** Build Cytoscape elements: nodes = synsets (id + words), edges = hyponym links. */
    function buildGraphFromSynset(rootId) {
        const synsetIds = collectHyponymSynsets(rootId);
        const nodes = synsetIds.map(id => {
            const words = (cos[id] || []).join(", ");
            const label = `${id}\n${words || "(no words)"}`;
            return { data: { id: String(id), label, words: words || "(no words)" } };
        });
        const edgeSet = new Set();
        const edges = [];
        synsetIds.forEach(parentId => {
            const children = h[parentId];
            if (children) {
                children.forEach(childId => {
                    const eid = `${parentId}-${childId}`;
                    if (!edgeSet.has(eid)) {
                        edgeSet.add(eid);
                        edges.push({ data: { id: eid, source: String(parentId), target: String(childId) } });
                    }
                });
            }
        });
        return { nodes, edges };
    }

    /**
     * Compute the longest path length from root to each node (root = 0, children = 1 + max(parent depths)).
     * Returns a Map: nodeId (string) -> depth (number).
     */
    function computeLongestPathLevels(rootId, edges) {
        const root = String(rootId);
        const parents = new Map();  // nodeId -> [parent ids]
        edges.forEach(e => {
            const sid = e.data.source;
            const tid = e.data.target;
            if (!parents.has(tid)) parents.set(tid, []);
            parents.get(tid).push(sid);
        });
        const allNodes = new Set(edges.flatMap(e => [e.data.source, e.data.target]));
        allNodes.add(root);

        const postOrder = [];
        const visited = new Set();
        function dfs(v) {
            visited.add(v);
            edges.filter(e => e.data.source === v).forEach(e => {
                const w = e.data.target;
                if (!visited.has(w)) dfs(w);
            });
            postOrder.push(v);
        }
        dfs(root);
        const topoOrder = postOrder.reverse();

        const depth = new Map();
        topoOrder.forEach(nodeId => {
            if (nodeId === root) {
                depth.set(nodeId, 0);
            } else {
                const preds = parents.get(nodeId) || [];
                const maxPred = preds.length === 0 ? -1 : Math.max(...preds.map(p => depth.get(p)));
                depth.set(nodeId, 1 + maxPred);
            }
        });
        return depth;
    }

    /**
     * Reorder nodes at each level by their parent's position on the level above:
     * siblings (same parent) stay together, and the order of groups follows the order of parents above.
     */
    function orderNodesByParentAbove(byLevel, depthMap, edges, rootId) {
        const root = String(rootId);
        const parents = new Map();  // nodeId -> [parent ids]
        edges.forEach(e => {
            const sid = e.data.source;
            const tid = e.data.target;
            if (!parents.has(tid)) parents.set(tid, []);
            parents.get(tid).push(sid);
        });
        const orderedByLevel = new Map();
        orderedByLevel.set(0, [root]);
        const levels = [...byLevel.keys()].sort((a, b) => a - b);
        for (let i = 1; i < levels.length; i++) {
            const level = levels[i];
            const prevOrder = orderedByLevel.get(level - 1);
            const nodesAtLevel = [...(byLevel.get(level) || [])];
            nodesAtLevel.sort((a, b) => {
                const parentsA = (parents.get(a) || []).filter(p => depthMap.get(p) === level - 1);
                const parentsB = (parents.get(b) || []).filter(p => depthMap.get(p) === level - 1);
                if (parentsA.length === 0 && parentsB.length === 0) return 0;
                if (parentsA.length === 0) return 1;
                if (parentsB.length === 0) return -1;
                const minIdxA = Math.min(...parentsA.map(p => prevOrder.indexOf(p)));
                const minIdxB = Math.min(...parentsB.map(p => prevOrder.indexOf(p)));
                if (minIdxA !== minIdxB) return minIdxA - minIdxB;
                const parentA = parentsA.reduce((best, p) =>
                    prevOrder.indexOf(p) < prevOrder.indexOf(best) ? p : best, parentsA[0]);
                const parentB = parentsB.reduce((best, p) =>
                    prevOrder.indexOf(p) < prevOrder.indexOf(best) ? p : best, parentsB[0]);
                const childListA = (h[parentA] || []).map(String);
                const childListB = (h[parentB] || []).map(String);
                const posA = childListA.indexOf(a);
                const posB = childListB.indexOf(b);
                return posA - posB;
            });
            orderedByLevel.set(level, nodesAtLevel);
        }
        return orderedByLevel;
    }

    /**
     * Build preset positions so root is at top and each level is the longest-path distance from root.
     * Nodes at each level are ordered by their parent's position above, then spread horizontally.
     */
    function computeLeveledPositions(rootId, nodes, edges) {
        const depthMap = computeLongestPathLevels(rootId, edges);
        const byLevel = new Map();  // level (number) -> [node ids]
        nodes.forEach(n => {
            const id = n.data.id;
            const d = depthMap.get(id);
            if (d === undefined) return;
            if (!byLevel.has(d)) byLevel.set(d, []);
            byLevel.get(d).push(id);
        });
        const orderedByLevel = orderNodesByParentAbove(byLevel, depthMap, edges, rootId);
        const nodeWidth = 170;
        const nodeHeight = 60;
        const levelHeight = 90;
        const positions = {};
        const levels = [...orderedByLevel.keys()].sort((a, b) => a - b);
        const maxLevelSize = Math.max(1, ...levels.map(l => orderedByLevel.get(l).length));
        const levelWidth = maxLevelSize * nodeWidth;
        levels.forEach(level => {
            const ids = orderedByLevel.get(level);
            const n = ids.length;
            const firstCenterX = ((maxLevelSize - n + 1) * nodeWidth) / 2 + nodeWidth / 2;
            ids.forEach((id, i) => {
                positions[id] = { x: firstCenterX + i * nodeWidth, y: level * levelHeight };
            });
        });
        return positions;
    }

    function renderCytoscape(rootId) {
        if (cyInstance) {
            cyInstance.destroy();
            cyInstance = null;
        }
        $("#node-popup").addClass("hiddentext").hide();
        const { nodes, edges } = buildGraphFromSynset(rootId);
        const positions = computeLeveledPositions(rootId, nodes, edges);
        const elements = [...nodes, ...edges];
        cyInstance = cytoscape({
            container: document.getElementById("cy"),
            elements,
            style: [
                {
                    selector: "node",
                    style: {
                        "label": "data(label)",
                        "text-valign": "center",
                        "text-halign": "center",
                        "font-size": "9px",
                        "text-wrap": "wrap",
                        "text-max-width": "140px",
                        "background-color": "#6fb1fc",
                        "color": "#000",
                        "width": "160px",
                        "height": "56px",
                        "shape": "round-rectangle"
                    }
                },
                {
                    selector: "edge",
                    style: {
                        "width": 1,
                        "line-color": "#ccc",
                        "target-arrow-color": "#ccc",
                        "target-arrow-shape": "triangle",
                        "curve-style": "bezier",
                        "source-endpoint": "180deg",
                        "target-endpoint": "0deg"
                    }
                }
            ],
            layout: {
                name: "preset",
                positions: function (node) {
                    return positions[node.id()] || { x: 0, y: 0 };
                },
                fit: true,
                padding: 30
            }
        });

        const popupEl = document.getElementById("node-popup");
        const popupContent = document.getElementById("node-popup-content");
        const popupClose = document.getElementById("node-popup-close");

        function hideNodePopup() {
            $("#node-popup").addClass("hiddentext").hide();
        }

        function formatNodeLabel(nodeId) {
            const words = (cos[nodeId] || []).join(", ");
            return words ? `${nodeId}: ${words}` : nodeId;
        }

        function showNodePopup(node) {
            const id = node.id();
            const parentNodes = node.incomers().filter(e => e.isNode());
            const childNodes = node.outgoers().filter(e => e.isNode());
            const currentLabel = formatNodeLabel(id);
            let html = `<h4>Synset ${id}</h4>`;
            html += "<strong>Parents:</strong>";
            html += parentNodes.length ? `<ul>${parentNodes.map(n => "<li>" + formatNodeLabel(n.id()) + "</li>").join("")}</ul>` : "<ul><li>(none)</li></ul>";
            html += "<strong>Children:</strong>";
            html += childNodes.length ? `<ul>${childNodes.map(n => "<li>" + formatNodeLabel(n.id()) + "</li>").join("")}</ul>` : "<ul><li>(none)</li></ul>";
            popupContent.innerHTML = html;
            $("#node-popup").removeClass("hiddentext").show();
        }

        cyInstance.on("tap", "node", function (evt) {
            showNodePopup(evt.target);
        });
        cyInstance.on("tap", function (evt) {
            if (evt.target === cyInstance) hideNodePopup();
        });
        $(popupClose).off("click").on("click", hideNodePopup);
    }

    function showSynsetChooser(word, synsetIds) {
        $("#plot").hide();
        $("#textresult").hide();
        $("#graph-container-wrapper").hide();
        $("#synset-chooser-word").text(word);
        $("#synset-options").empty();
        synsetIds.forEach(synsetId => {
            const words = (cos[synsetId] || []).join(", ");
            const isLeaf = !h[String(synsetId)];
            const text = `ID ${synsetId}: ${words || "(no words)"}${isLeaf ? " (leaf: no hyponyms)" : ""}`;
            const btn = $("<div class='synset-option'/>").text(text).data("synset-id", synsetId);
            btn.on("click", function () {
                $("#synset-chooser").removeClass("show").addClass("hiddentext");
                $("#synset-chooser").hide();
                $("#graph-container-wrapper").addClass("show").show();
                renderCytoscape(synsetId);
            });
            $("#synset-options").append(btn);
        });
        $("#synset-chooser").removeClass("hiddentext").addClass("show").show();
    }

    function visualizeGraphButton() {
        $("#plot").hide();
        $("#textresult").show();
        $("#graph-container-wrapper").removeClass("show").hide();
        $("#synset-chooser").removeClass("show").addClass("hiddentext").hide();

        const word = document.getElementById("words").value.trim().split(/\s*,\s*/)[0];
        if (!word) {
            textresult.value = "Enter a word first.";
            return;
        }
        const synsetIds = sin[word];
        if (!synsetIds || synsetIds.length === 0) {
            textresult.value = `No synsets found for "${word}".`;
            return;
        }
        if (synsetIds.length === 1) {
            $("#textresult").hide();
            $("#graph-container-wrapper").addClass("show").show();
            renderCytoscape(synsetIds[0]);
        } else {
            $("#textresult").hide();
            showSynsetChooser(word, synsetIds);
        }
    }
});