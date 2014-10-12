/*
 * main.js
 * Rich Simpson
 * August 19, 2014
 *
 * This code implements a simulation of search algorithms
 * for integration with Smart Sparrow.  
 *
 * This is our controller - The C in MVC
 */


/*
 * Check whether the given NodeID is in the nodeList
 * I use this to determine whether or not I should draw 
 * a given node.
 */
function nodeInList(node, nodeList) { 
	// loop through the node list
	for (index = 0; index < nodeList.length; index++) {
		// do we have a match?
		if (node == nodeList[index]) return true;
	}
	// we didn't find it, so return false
	return false;
}


/*
 * I use this function to empty out all of the arrays that
 * I use in this program.
 */
function emptyOutArray(myArray) {
	myArray.length = 0;
}


/*
 * This function returns true if it is passed an array and false
 * otherwise. I found it here:
 * http://www.w3schools.com/js/js_arrays.asp
 */
function isArray(myArray) {
    return myArray.constructor.toString().indexOf("Array") > -1;
}
 

function arrayToString(myArray) {
	var arrayStr = " ";
	// loop through all items in the array
	for	(index = 0; index < myArray.length; index++) {
		// add each nodeID in the fringe to our string
		arrayStr += myArray[index] + " ";
	}
	// return the string when we're done
// 	console.log(arrayStr);
	return arrayStr;
}


/*
 * This is the controller for the search simulations.
 */
function SearchController() {
	// Create the data model
	this.searchModel = new SearchModel();
	// Create the view
	this.searchView = new SearchView();
	// This counter is used to create unique IDs for each node\
	// in the search tree
	this.uniqueCounter = 0;
	// I use the discovered nodes array to keep track of which
	// graph nodes should be drawn by the graph view
	this.discoveredNodes = [];
	// I use the expanded nodes array to keep track of which 
	// tree nodes have already been expanded
	this.expandedNodes = [];
	// We aren't searching
	this.searchAlg = "None";
	// Keep track of the current "depth limit" for depth-first
	// search with iterative deepening
	this.depthLimitCounter = 1;
}


/*
 * This sets everything back to "factory original" settings
 */
SearchController.prototype.reset = function() {
// 	console.log("resetting controller");
	// Create the data model
	this.searchModel.reset();
	// Create the view
	this.searchView.reset();
	// This counter is used to create unique IDs for each node\
	// in the search tree
	this.uniqueCounter = 0;
	// I use the discovered nodes array to keep track of which
	// graph nodes should be drawn by the graph view
	emptyOutArray(this.discoveredNodes);
	// I use the expanded nodes array to keep track of which 
	// tree nodes have already been expanded
	emptyOutArray(this.expandedNodes);
	// We aren't searching
	this.searchAlg = "None";
}


/*
 * I use this to set/change values for the search parameters
 */
SearchController.prototype.setSearchParameters = function(parameters) {
// 	console.log(parameters);
	// do we have a new value for the start node
	if (parameters.startNode) {
		// update the value
		this.searchModel.startNode = parameters.startNode;
	}
	// do we have a new value for the end node
	if (parameters.endNode) {
		// update the value
		this.searchModel.endNode = parameters.endNode;	
	}
	// do we have a new value for the depth limit
	if (parameters.depthLimit) {
		// update the value
		this.searchModel.depthLimit = parameters.depthLimit;	
	}
// 	console.log("setSearchParameters");
// 	console.log("start: " + this.searchModel.startNode + 
// 				" end: " + this.searchModel.endNode +
// 				" depth: " + this.searchModel.depthLimit);
}


/*
 * I use this function to create unique nodeIDs for each node
 * in the tree.
 */
SearchController.prototype.uniqueID = function(nodeID) {
	// append a number to the end of the nodeID
	uniqueNodeID = nodeID.concat(this.uniqueCounter.toString());
	// increment the unique ID counter
	this.uniqueCounter += 1;
	// return the unique nodeID
	return uniqueNodeID;
}


SearchController.prototype.drawGraph = function() {
	// get the list of nodes from the model
	nodeList = this.searchModel.nodeList();
	// tell the view to draw the nodes
	this.searchView.drawNodes(nodeList);
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
			// add node to search tree
			var treeNode = this.searchModel.addNodeToTree(uID,			// nodeID
											graphChildNode.heuristic,	// heuristic
											graphChildNode.cost,		// cost
											treeNodeID,					// parent in tree
											childNodeID);				// graphNodeID
			// put node on end of fringe: nodeID, cost, heuristic, depth
			this.searchModel.addNodeToFringe(uID, treeNode.cost, treeNode.heuristic, treeNode.depth);
		} // if an edge starts at our current node
	} // for loop for edges in graph
}
		

// Create a new Search Controller
var searchController = new SearchController();


$(document).ready(function() {
	// I don't know why I can't do this in CSS, but I can't and I'm
	// tired of fighting with it.
// 	$("#depthLimitSpnr").width(50);
	// This should really be in my code for initializing the view, but
	// it doesn't work there
 	$("#depthLimitSpnr").spinner( "value", 50 );
});




/*
 * Unit Testing
 */
/*
$(document).ready(function() {
	// Create a new searchModel
	var searchModel = new SearchModel();
	// Add some nodes to the state space graph
	searchModel.addNodeToGraph('A', 0);
	searchModel.addNodeToGraph('B', 0);
	searchModel.addNodeToGraph('C', 0);
	searchModel.addNodeToGraph('D', 0);
	// Intentional errors
	searchModel.addNodeToGraph('D', 0);					// add same node twice
	searchModel.addNodeToGraph('E', -4);				// add node with negative heuristic
	// Add some edges to the state space graph
	searchModel.addEdgeToGraph('A', 'B', 0);	
	searchModel.addEdgeToGraph('A', 'C', 0);	
	searchModel.addEdgeToGraph('B', 'D', 0);	
	// Intentional errors
	searchModel.addEdgeToGraph('A', 'B', 0);			// add same edge twice
	searchModel.addEdgeToGraph('A', 'A', 0);			// add edge with same from and to node
	searchModel.addEdgeToGraph('C', 'D', -1);			// add edge with negative cost
	searchModel.addEdgeToGraph('F', 'D', 0);			// add edge with non-existant from node
	searchModel.addEdgeToGraph('C', 'F', 0);			// add edge with non-existant to node
	// Dump the state space graph
	searchModel.graph.dumpGraph();
	// Add some nodes to the search tree - nodeID, heuristic, cost, parent, graphNodeID
	searchModel.addNodeToTree('A1', 4, 0, '', 'A');
	searchModel.addNodeToTree('B2', 4, 0, 'A1', 'B');
	searchModel.addNodeToTree('C3', 4, 0, 'A1', 'C');
	// Intentional errors
	searchModel.addNodeToTree('B2', 4, 0, 'A1', 'B');	// add same node twice
	searchModel.addNodeToTree('D4', -4, 0, 'B2', 'D');	// add node with negative heuristic
	searchModel.addNodeToTree('D4', 4, -1, 'B2', 'D');	// add node with negative cost
	searchModel.addNodeToTree('D4', 4, 0, 'B2', 'G');	// add node with nonexistant graph node
	// Dump the search tree
	searchModel.tree.dumpTree();
	// Add some nodeIDs to the fringe
	searchModel.addNodeToFringe('A1');
	searchModel.addNodeToFringe('B2');
	// Intentional errors
	searchModel.addNodeToFringe('F7');				// node that doesn't exist in search tree
	// Dump the fringe
	searchModel.fringe.dumpFringe();
});
*/


/*
 * Unit tests
 
	// Do BFS
	path = searchController.breadthFirstSearch();
	console.log("victoia")
	console.log(path);

*/


/*
SearchController.prototype.breadthFirstSearch = function() {
	console.log('---starting BFS---');
	console.log('start = ' + this.searchModel.startNode + ' end = ' + this.searchModel.endNode);
	// Keep track of how many loops through the search
	// I use this to avoid blowing up the browser
	loopCnt = 0;
	// keep track of "discovered" graph nodes to update the
	// view of the graph
	discoveredNodes = [this.searchModel.startNode];
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
	// loop until the fringe is empty
	while (this.searchModel.fringe.nodes.length > 0) {
		console.log("-----fringe-----");
		this.searchModel.fringe.dumpFringe();
		console.log("-----tree-----");
		this.searchModel.tree.dumpTree();
		console.log("--------------");
		// update view of graph
		this.searchView.drawNodes(discoveredNodes);
		// pull next nodeID off of fringe - it's a queue so
		// we remove from the front
		treeNodeID = this.searchModel.fringe.nodes.shift();
		// get index of tree node
		treeNodeIndex = this.searchModel.tree.findNode(treeNodeID);
		// sanity check - does the tree node index make sense?
		if (treeNodeIndex < 0) return;
		// get corresponding graph node ID
		graphNodeID = this.searchModel.tree.nodes[treeNodeIndex].graphNodeID;
		console.log("treeNodeID: " + treeNodeID + " treeNodeIndex: " + treeNodeIndex);
		// if we found the goal then return the answer
		if (graphNodeID == this.searchModel.endNode) {
			// get list of nodes from leaf to root
			pathList = this.searchModel.tree.traverseTree(treeNodeID);
			// return the solution
			return pathList;
		}
		// get index of graph node
		graphNodeIndex = this.searchModel.graph.findNode(graphNodeID);
		// sanity check - does the graph node index make sense?
		if (graphNodeIndex < 0) return;
		console.log("graphNodeID: " + graphNodeID + " graphNodeIndex: " + graphNodeIndex);
		// loop through all the edges in the graph (yes, this is dumb)
		for (edgeIndex = 0; edgeIndex < this.searchModel.graph.edges.length; edgeIndex++) {
			// does the edge start at our graph node?
			if (this.searchModel.graph.edges[edgeIndex].fromNodeID == graphNodeID) {
				childNodeID = this.searchModel.graph.edges[edgeIndex].toNodeID;
				// keep track of "discovered" graph nodes to update the
				// view of the graph
				discoveredNodes[discoveredNodes.length] = childNodeID;
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
		// if we've run past our depth limit then it's time to quit
		if (loopCnt++ > this.searchModel.depthLimit) {
			console.log("ran path depth limit");
			// return an empty list to indicate that we didn't complete the search
			return [];
		}
		// ask the user if they want to quit
		if (confirm("Press OK for next step") != true) {
			console.log("user cancelled");
			// return an empty list to indicate that we didn't complete the search
			return [];
		}
	} // while loop for BFS
}
*/