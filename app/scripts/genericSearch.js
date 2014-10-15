/*
 * Generic Search - this performs all the search algorithms by changing
 * which node gets pulled from the fringe
 * Note: For the visualization, the entire graph has been pre-computed.
 */
SearchController.prototype.genericSearchFirstStep = function() {
	// have we already started searching?
	if (this.discoveredNodes.length > 0) return;
// 	console.log('---starting GFS---');
// 	console.log(this.searchModel);
// 	console.log('start = ' + this.searchModel.startNode + ' end = ' + this.searchModel.endNode);
	// Keep track of how many loops through the search
	// I use this to avoid blowing up the browser
	loopCnt = 0;
	// keep track of "discovered" graph nodes to update the view of the graph
	// note that discovered nodes is an object variable so it carries over
	// between the first step and next step functions
	this.discoveredNodes = [this.searchModel.startNode];
	// get the index of the start node in the graph
	var graphNodeIndex = this.searchModel.graph.findNode(this.searchModel.startNode);
	// sanity check - does the tree node index make sense?
	if (graphNodeIndex < 0) return ["genericSearchFirstStep: graph node index out of bounds"];
	// get a pointer to the start node
	var graphStartNode = this.searchModel.graph.nodes[graphNodeIndex];
	// get a unique ID for the start node we add to the tree
	var uID = this.uniqueID(this.searchModel.startNode)
	// make the start node the root of the search tree
	this.searchModel.addNodeToTree(uID,								// nodeID
								graphStartNode.heuristic,			// heuristic
								0, 									// cost is 0 for root
								'', 								// no parent in tree
								this.searchModel.startNode);		// graphNodeID
	// put start node into fringe: nodeID, cost = 0, heuristic, depth = 0
	this.searchModel.addNodeToFringe(uID, 0, graphStartNode.heuristic, 0);
	// we're not done until we pull the goal node off the fringe
	// so we know we're going to the next step
	return -1;
}


SearchController.prototype.genericSearchNextStep = function() {
	// loop until the fringe is empty
	if (this.searchModel.fringe.nodes.length > 0) {
 		console.log("-----fringe-----");
 		this.searchModel.fringe.dumpFringe();
// 		console.log("-----tree-----");
// 		this.searchModel.tree.dumpTree();
// 		console.log("--------------");
		// update view of graph
		this.searchView.drawGraph(this.discoveredNodes);
		// pull next fringe node off of fringe 
		var fringeNode = this.searchModel.getNextFringeNode(this.searchAlg);
		// get nodeID from fringe node
		var treeNodeID = fringeNode.nodeID;
		// keep track of which tree nodes have been expanded
		this.expandedNodes[this.expandedNodes.length] = treeNodeID;
		// update fringe view
		this.searchView.updateFringeView(this.searchModel.fringe.fringeToString(),
									arrayToString(this.expandedNodes));
		// update tree view
		this.searchView.drawTree();		
		// get index of tree node
		var treeNodeIndex = this.searchModel.tree.findNode(treeNodeID);
		// sanity check - does the tree node index make sense?
		if (treeNodeIndex < 0) return ["genericSearchNextStep: tree node index out of bounds " + treeNodeIndex];
		// get corresponding graph node ID
		var graphNodeID = this.searchModel.tree.nodes[treeNodeIndex].graphNodeID;
// 		console.log("treeNodeID: " + treeNodeID + " treeNodeIndex: " + treeNodeIndex);
		// if we found the goal then return the answer
		if (graphNodeID == this.searchModel.endNode) {
			// get list of nodes from leaf to root
			pathList = this.searchModel.tree.traverseTree(treeNodeID);
			// return the solution
			return pathList;
		} 
		// if we've run past our depth limit then it's time to quit
		if (this.searchModel.tree.nodes[treeNodeIndex].depth > this.searchModel.depthLimit) {
// 			console.log("ran past depth limit");
			// We aren't searching
			this.searchAlg = "None";
			// return an explanation that we didn't complete the search
			return ["genericSearchNextStep: Exceeded depth limit"];
		} else {
			// otherwise, we add the node's children to the fringe
			this.getChildren(graphNodeID, treeNodeID);
			// update fringe view - to include children
			this.searchView.updateFringeView(this.searchModel.fringe.fringeToString(),
										arrayToString(this.expandedNodes));
			this.searchModel.fringe.dumpFringe()
			// update view of graph
			this.searchView.drawGraph(this.discoveredNodes);
			// update tree view - to include children
			this.searchView.drawTree();		
		}
	// in this case, we have run out of stuff in the fringe, so we're done
	} else {
		// We aren't searching
		this.searchAlg = "None";
		// return an explanation of what happened
		return ["genericSearchNextStep: No path exists"];
	}
	// we didn't find what we were looking for, so return -1
	return -1;
}


SearchController.prototype.getChildren = function(graphNodeID, treeNodeID) {
	// get index of graph node
	graphNodeIndex = this.searchModel.graph.findNode(graphNodeID);
	// sanity check - does the graph node index make sense?
	if (graphNodeIndex < 0) return;
// 	console.log("graphNodeID: " + graphNodeID + " graphNodeIndex: " + graphNodeIndex);
	// loop through all the edges in the graph (yes, this is dumb)
	for (edgeIndex = 0; edgeIndex < this.searchModel.graph.edges.length; edgeIndex++) {
		// does the edge start at our graph node?
		if (this.searchModel.graph.edges[edgeIndex].fromNodeID == graphNodeID) {
			// get ID of child node
			childNodeID = this.searchModel.graph.edges[edgeIndex].toNodeID;
			// get cost of edge to child node
			edgeCost = this.searchModel.graph.edges[edgeIndex].cost;
			// keep track of new "discovered" graph nodes to update the
			// view of the graph
			if (! nodeInList(childNodeID, this.discoveredNodes)) {
				this.discoveredNodes[this.discoveredNodes.length] = childNodeID;
			}
			// get a unique ID for child node
			uID = this.uniqueID(childNodeID);
			// get the index of the start node in the graph
			var graphChildNodeIndex = this.searchModel.graph.findNode(childNodeID);
			// sanity check - does the tree node index make sense?
			if (graphChildNodeIndex < 0) return ["getChildren: graph node index out of bounds"];
			// get a pointer to the child node
			var graphChildNode = this.searchModel.graph.nodes[graphChildNodeIndex];
			// add node to search tree - nodeID, heuristic, cost, parent, graphNodeID
			var treeNode = this.searchModel.addNodeToTree(uID,			// nodeID
											graphChildNode.heuristic,	// heuristic
											edgeCost,					// cost
											treeNodeID,					// parent in tree
											childNodeID);				// graphNodeID
			// put node on end of fringe: nodeID, cost, heuristic, depth
			this.searchModel.addNodeToFringe(uID, treeNode.cost, treeNode.heuristic, treeNode.depth);
			
		} // if an edge starts at our current node
	} // for loop for edges in graph
}
		
