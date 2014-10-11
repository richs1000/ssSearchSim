/*
 * Depth-First Search with Iterative Deepening
 * Note: For the visualization, the entire graph has been pre-computed.
 */
SearchController.prototype.depthFirstSearchIDFirstStep = function() {
	// have we already started DFS-ID?
	if (this.discoveredNodes.length > 0) {
		console.log("oops: " + this.discoveredNodes);
		return;
	}
// 	console.log('---starting DFS-ID---');
// 	console.log(this.searchModel);
// 	console.log('start = ' + this.searchModel.startNode + ' end = ' + this.searchModel.endNode);
	// Keep track of how many loops through the search
	// I use this to avoid blowing up the browser
//	loopCnt = 0;
	// keep track of "discovered" graph nodes to update the
	// view of the graph
	// note that discovered nodes is an object variable so
	// it carries over between the first step and next step
	// functions
	this.discoveredNodes = [this.searchModel.startNode];
	// get a unique ID for the start node
	uID = this.uniqueID(this.searchModel.startNode)
	// make the start node the root of the search tree
	this.searchModel.addNodeToTree(uID,									// nodeID
								0, 										// heuristic
								0, 										// cost
								'', 									// parent in tree
								this.searchModel.startNode);			// graphNodeID
	// put start node into fringe
	this.searchModel.addNodeToFringe(uID);
	// we're not done until we pull the goal node off the fringe
	// so we know we're going to the next step
	return -1;
}


SearchController.prototype.depthFirstSearchIDNextStep = function() {
	console.log("depth limit = " + this.depthLimitCounter);
	// loop until the fringe is empty
//	console.log("-----fringe-----");
//	this.searchModel.fringe.dumpFringe();
//	console.log("-----tree-----");
//	this.searchModel.tree.dumpTree();
//	console.log("--------------");
	if (this.searchModel.fringe.nodes.length > 0) {
		// update view of graph
		this.searchView.drawGraph(this.discoveredNodes);
		// pull next nodeID off of fringe - it's a stack so
		// we remove from the back
		treeNodeID = this.searchModel.fringe.nodes.pop();
		// keep track of which tree nodes have been expanded
		this.expandedNodes[this.expandedNodes.length] = treeNodeID;
		// update fringe view
		this.searchView.updateFringeView(this.searchModel.fringe.fringeToString(),
									arrayToString(this.expandedNodes));
		// update tree view
		this.searchView.drawTree();		
		// get index of tree node
		treeNodeIndex = this.searchModel.tree.findNode(treeNodeID);
		// sanity check - does the tree node index make sense?
		if (treeNodeIndex < 0) return ["tree node index out of bounds"];
		// get corresponding graph node ID
		graphNodeID = this.searchModel.tree.nodes[treeNodeIndex].graphNodeID;
// 		console.log("treeNodeID: " + treeNodeID + " treeNodeIndex: " + treeNodeIndex);
		// if we found the goal then return the answer
		if (graphNodeID == this.searchModel.endNode) {
			// get list of nodes from leaf to root
			pathList = this.searchModel.tree.traverseTree(treeNodeID);
			// return the solution
			return pathList;
		} 
		// if we've run past our total depth limit then it's time to quit
		if (this.searchModel.tree.nodes[treeNodeIndex].depth > this.searchModel.depthLimit) {
// 			console.log("ran past depth limit");
			// We aren't searching
			this.searchAlg = "None";
			// return an explanation that we didn't complete the search
			return ["Exceeded depth limit"];
		// if the node's depth is within our current "depth ceiling" then add it to the fringe
		} else if (this.searchModel.tree.nodes[treeNodeIndex].depth < this.depthLimitCounter) {
			// otherwise, we add the node's children to the fringe
			this.getChildren(graphNodeID);
			// update fringe view - to include children
			this.searchView.updateFringeView(this.searchModel.fringe.fringeToString(),
										arrayToString(this.expandedNodes));
			// update view of graph
			this.searchView.drawGraph(this.discoveredNodes);
			// update tree view - to include children
			this.searchView.drawTree();		
		}
	// in this case, we have run out of stuff in the fringe, so we increment the depth limit and
	// start over
	} else if (this.depthLimitCounter < this.searchModel.depthLimit) {
		// increment depth count
		this.depthLimitCounter += 1;
		// set the the search model back to the "beginning"
		this.searchModel.restart();
		// reset the view
		this.searchView.reset();
		// reset the array of graph nodes that have been "discovered" by the search
		emptyOutArray(this.discoveredNodes);
		// reset the array of nodes that have been expanded
		emptyOutArray(this.expandedNodes);
		// start over at the beginning
		console.log("starting over...");
		this.depthFirstSearchIDFirstStep();
	// in this case, we have run out of stuff in the fringe, and we've passed the limit so we're done
	} else {
		// We aren't searching
		this.searchAlg = "None";
		// return an explanation of what happened
		return ["No path exists"];
	}
	// we didn't find what we were looking for, so return -1
	return -1;
}

/*
SearchController.prototype.getChildren = function(graphNodeID) {
	// get index of graph node
	graphNodeIndex = this.searchModel.graph.findNode(graphNodeID);
	// sanity check - does the graph node index make sense?
	if (graphNodeIndex < 0) return;
// 	console.log("graphNodeID: " + graphNodeID + " graphNodeIndex: " + graphNodeIndex);
	// loop through all the edges in the graph (yes, this is dumb)
	for (edgeIndex = 0; edgeIndex < this.searchModel.graph.edges.length; edgeIndex++) {
		// does the edge start at our graph node?
		if (this.searchModel.graph.edges[edgeIndex].fromNodeID == graphNodeID) {
			childNodeID = this.searchModel.graph.edges[edgeIndex].toNodeID;
			// keep track of new "discovered" graph nodes to update the
			// view of the graph
			if (! nodeInList(childNodeID, this.discoveredNodes)) {
				this.discoveredNodes[this.discoveredNodes.length] = childNodeID;
			}
			// get a unique ID for child node
			uID = this.uniqueID(childNodeID);
			// add node to search tree
			this.searchModel.addNodeToTree(uID,						// nodeID
											0,						// heuristic
											0,						// cost
											treeNodeID,				// parent in tree
											childNodeID);			// graphNodeID
			// put node on fringe - it's a queue so we add
			// to the back
			this.searchModel.addNodeToFringe(uID);
		} // if an edge starts at our current node
	} // for loop for edges in graph
}
*/