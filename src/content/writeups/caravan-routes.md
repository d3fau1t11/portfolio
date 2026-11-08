## Challenge Overview

We are given a map of directed routes.  
We need to find the **cheapest directed route from `START` to `FINISH`**.  
The labels on the edges along that route, concatenated in order, form the flag.

Files provided:

- `bundle.zip`
- `routes.json`

After extracting `bundle.zip`, we get a single `routes.json` file.

---

## Step 1 — Inspect the JSON structure

First, we look at the JSON to understand its format.

```bash
python3 - <<'PY'
import json
from collections import Counter

d = json.load(open('routes.json'))
E = d['edges']

print('start:', d['start'])
print('finish:', d['finish'])
print('edges:', len(E))
print('edge keys:', Counter(tuple(e.keys()) for e in E).most_common(5))
print('cost types:', set(type(e['cost']).__name__ for e in E))
print('label lengths:', Counter(len(e['label']) for e in E).most_common(10))
print('sample start edges:', [e for e in E if e['from'] == d['start']][:5])
print('sample finish edges:', [e for e in E if e['to'] == d['finish']][:5])
PY
```

Output:

```
start: START
finish: FINISH
edges: 3535
edge keys: [(('from', 'to', 'cost', 'label'), 3535)]
cost types: {'int'}
label lengths: [(1, 3535)]
sample start edges: [{'from': 'START', 'to': 'junction-0652', 'cost': 1768, 'label': '5'}, ...]
sample finish edges: [{'from': 'junction-0308', 'to': 'FINISH', 'cost': 1659, 'label': '9'}, ...]
```

So the graph is a simple directed graph:

- Nodes are strings like `junction-xxxx`, `depot-xxxxxxxx`, plus `START` and `FINISH`.
- Each edge has:
  - `from`
  - `to`
  - `cost` (integer)
  - `label` (single character)

The flag is formed by concatenating the `label` of each edge on the cheapest path.

---

## Step 2 — Find the cheapest path

This is a classic **shortest path problem** on a weighted directed graph.  
Since all edge costs are non‑negative, we can use **Dijkstra’s algorithm**.

We build an adjacency list and run Dijkstra from `START` to `FINISH`, keeping track of the predecessor and the edge label used to reach each node.  
Then we reconstruct the path and concatenate the labels.

```bash
python3 - <<'PY'
import json, heapq

d = json.load(open('routes.json'))
start, finish, edges = d['start'], d['finish'], d['edges']

# Build adjacency list: node -> list of (neighbour, cost, label)
adj = {}
for e in edges:
    adj.setdefault(e['from'], []).append((e['to'], e['cost'], e['label']))

# Dijkstra
dist = {start: 0}
prev = {}          # node -> (previous_node, label)
pq = [(0, start)]

while pq:
    cost, u = heapq.heappop(pq)
    if cost != dist.get(u):
        continue
    if u == finish:
        break
    for v, w, label in adj.get(u, []):
        nc = cost + w
        if nc < dist.get(v, 10**30):
            dist[v] = nc
            prev[v] = (u, label)
            heapq.heappush(pq, (nc, v))

if finish not in dist:
    print('No path found')
else:
    print('cheapest cost:', dist[finish])
    labels = []
    cur = finish
    while cur != start:
        p, label = prev[cur]
        labels.append(label)
        cur = p
    labels = labels[::-1]
    raw = ''.join(labels)
    print('labels:', raw)
PY
```

Output:

```
cheapest cost: 123
labels: tibeb{caravan_4489ddfd760148f6bd3f}
```

The concatenated labels already form the complete flag, including the `tibeb{...}` wrapper.

---

## Step 3 — Extract the flag

From the output, the flag is:

```
tibeb{caravan_4489ddfd760148f6bd3f}
```

---

## Tricky / Interesting Points

1. **The labels already include the flag wrapper.**  
   The concatenated string is `tibeb{caravan_4489ddfd760148f6bd3f}`.  
   In the initial script I printed `tibeb{%s}` around it, which produced a double‑wrapped string:  
   `tibeb{tibeb{caravan_4489ddfd760148f6bd3f}}`.  
   The correct flag is simply the raw concatenated labels. Always check the format.

3. **All labels are single characters.**  
   This means the path length (35 edges) matches the flag length (35 characters).  
   The flag length is a good sanity check.

4. **Non‑negative costs.**  
   All costs are positive integers, so Dijkstra is the correct choice.  
   If negative costs were present, we would need Bellman‑Ford.

---

## Final Flag

```
tibeb{caravan_4489ddfd760148f6bd3f}
```
