/*
 * Depth-First Search
 * Note: For the visualization, the entire graph has been pre-computed.
 */
SearchController.prototype.depthFirstSearchFirstStep = function() {
	// have we already started DFS?
	if (this.discoveredNodes.length > 0) return;
// 	console.log('---starting DFS---');
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


SearchController.prototype.depthFirstSearchNextStep = function() {
	// loop until the fringe is empty
	if (this.searchModel.fringe.nodes.length > 0) {
// 		console.log("-----fringe-----");
// 		this.searchModel.fringe.dumpFringe();
// 		console.log("-----tree-----");
// 		this.searchModel.tree.dumpTree();
// 		console.log("--------------");
		// update view of graph
		this.searchView.drawGraph(this.discoveredNodes);
		// pull next fringe node off of fringe - it's a stack so
		// we remove from the back
		var fringeNode = this.searchModel.fringe.nodes.pop();
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
		if (treeNodeIndex < 0) return ["tree node index out of bounds"];
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
			return ["Exceeded depth limit"];
		} else {
			// otherwise, we add the node's children to the fringe
			this.getChildren(graphNodeID, treeNodeID);
			// update fringe view - to include children
			this.searchView.updateFringeView(this.searchModel.fringe.fringeToString(),
										arrayToString(this.expandedNodes));
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
		return ["No path exists"];
	}
	// we didn't find what we were looking for, so return -1
	return -1;
}

