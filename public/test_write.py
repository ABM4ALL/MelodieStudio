import networkx as nx
G = nx.path_graph(4)
pos = nx.circular_layout(G)
for node_id, pos in pos.items():
    nx.set_node_attributes(G, {node_id:{"x": pos[0], "y": pos[1]}})
print(G.nodes[0]['x'])
nx.write_gexf(G,'test.gexf')
