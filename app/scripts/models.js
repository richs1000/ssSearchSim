/*
 * models.js
 * Rich Simpson
 * August 19, 2014
 *
 * This code implements a simulation of search algorithms
 * for integration with Smart Sparrow.  
 *
 * This is our data model - The M in MVC
 */

/*
 * This is the main search model, which the controller will 
 * interact with.
 */
function SearchModel() {
		// set initial values for model variables
		this.initValues();
        // graph data structure
        this.graph = new GraphModel();
        // tree data structure
        this.tree = new TreeModel();
        // fringe data structure
        this.fringe = new FringeModel();
		// Initialize the state space graph
		this.initializeGraph();
} // SearchModel


/*
 * This function is used to provide initial values
 * for search model variables
 */
SearchModel.prototype.initValues = function() {
	// ID of node in graph where search starts
	this.startNode = 'A';
	// ID of node in graph where search ends
	this.endNode = 'T';
	// depth limit for iterative deepening search
	this.depthLimit = 50;
}

/*
 * This function is used to "reset" the search model
 */
SearchModel.prototype.reset = function() {
		// set initial values for model variables
		this.initValues();
        // graph data structure
        this.graph.reset();
        // tree data structure
        this.tree.reset();
        // fringe data structure
        this.fringe.reset();
		// Initialize the state space graph
		this.initializeGraph();
}


/*
 * This function is used to start a search over without
 * changing the graph in the search model. This is important
 * for depth-first search with iterative deepening
 */
SearchModel.prototype.restart = function() {
		// set initial values for model variables
		this.initValues();
        // reset the tree data structure
        this.tree.reset();
        // reset the fringe data structure
        this.fringe.reset();
}


SearchModel.prototype.initializeGraph = function() {
	// This as a quick, cheap way to store initial values
	// for the nodes in the graph. I'm using an object as
	//  a dictionary with nodeID:heuristic pairs.
	var nodeList = {A:4, B:4, C:4, D:4, E:3, F:3, G:3, I:3,
				J:2, K:2, L:2, M:3, N:2, O:1};

	// Add some nodes to the state space graph
	// loop over all of the nodes in the node list
	for (var nodeID in nodeList) {
		// add the node and its heuristic value to the graph
		this.addNodeToGraph(nodeID, nodeList[nodeID]);
	}	
	// This as a quick, cheap way to store initial values
	// for the edges in the graph. I'm using an object as a dictionary
	// of dictionaries with startNodeID:{edge} pairs, where each
	// {edge} consists of endNodeID:cost pairs
	var edgeList = {
		A:{B:1, E:1, F:1},
		B:{A:1, C:1, E:1, F:1, G:1},
		C:{B:1, D:1, F:1, G:1, H:1},
		D:{C:1, G:1, H:1},
		E:{A:1, B:1, F:1, I:1, J:1},
		F:{A:1, B:1, C:1, E:1, G:1, I:1, J:1, K:1},
		G:{B:1, C:1, D:1, F:1, H:1, J:1, K:1, L:1},
		H:{C:1, D:1, G:1, K:1, L:1},
		I:{E:1, F:1, J:1, N:1, M:1},
		J:{E:1, F:1, G:1, I:1, K:1, M:1, N:1, O:1},
		K:{F:1, G:1, H:1, J:1, L:1, N:1, O:1, P:1},
		L:{G:1, H:1, K:1, O:1, P:1},
		M:{I:1, J:1, N:1, Q:1, R:1},
		N:{I:1, J:1, K:1, M:1, O:1, Q:1, R:1, S:1},
		O:{J:1, K:1, L:1, N:1, O:1, P:1, R:1, S:1, T:1},
		P:{K:1, L:1, O:1, S:1, T:1},
		Q:{M:1, N:1, R:1},
		R:{M:1, N:1, O:1, Q:1, S:1},
		S:{N:1, O:1, P:1, R:1, T:1},
		T:{O:1, P:1, S:1},
	};
	// loop over all of the start nodes
	for (var startNodeID in edgeList) {
		// loop over all of the nodes the start node connects to
		for (var endNodeID in edgeList[startNodeID]) {
			// we only want to add some of the possible edges
			// pick a random number
			var randNum = Math.floor(Math.random() * 100) + 1;
			// we want about 33% of edges
			if (randNum <= 33) {
				// pick a random cost for the edge
				var randCost = Math.floor(Math.random() * 10) + 1;
				// add the edge and its cost to the graph model
				this.addEdgeToGraph(startNodeID, endNodeID, randCost);
				// if this is an undirected graph, then add an edge in the other direction
				if (! this.directedGraph) {
					// add the "opposite" edge and its cost to the graph model
					this.addEdgeToGraph(endNodeID, startNodeID, edgeList[startNodeID][endNodeID]);
				}
			}
		}
	}	
}


/*
 * GraphNode represents the nodes within the state space graph.
 * A graph node has a unique ID. Depending on the search
 * algorithm being used, it may or may not have a heuristic
 * value indicating the node's distance from the goal node,
 * where a larger value indicates greater distance from the 
 * goal. The node also has an array for keeping track of all
 * the times it appears in the search tree.
 */
function GraphNode() {
	// Node ID - unique for each node in graph
	this.nodeID = '';
	// Heuristic (h) value - Distance from node to goal
	this.heuristic = 0;
	// Array of corresponding nodes in tree
	this.treeNodeIDs = [];
} // GraphNode


/*
 * GraphEdge represents the edges/arcs between nodes in the
 * graph. A graph edge has a start node, an end node and a
 * cost, which may or may not be considered by the search
 * algorithm. For an undirected edge, you can either treat
 * a single edge as undirected or create two separate edges.
 */
function GraphEdge() {
	// start node
	this.fromNodeID = '';
	// end node
	this.toNodeID = '';
	// cost of edge (g value)
	this.cost = 0;
} // GraphEdge


/*
 * The GraphModel consists of an array of nodes and an array
 * of edges.
 */
function GraphModel() {
	// array of nodes - starts off empty
	this.nodes = [];
	// array of edges - starts off empty
	this.edges = [];
	// the graph is undirected
	this.directedGraph = false;
} // GraphModel



GraphModel.prototype.reset = function() {
	// array of nodes - starts off empty
	emptyOutArray(this.nodes);
	// array of edges - starts off empty
	emptyOutArray(this.edges);
}


/*
 * This function returns the index of a tree node based on its ID
 */
GraphModel.prototype.findNode = function(nodeID) {
	// loop through nodes in tree
	for	(var index = 0; index < this.nodes.length; index++) {
		// check whether the current nodeID is the target nodeID
	    if (this.nodes[index].nodeID == nodeID)
	    	// return the index of the target nodeID within the 
	    	// node array
	    	return index;
	}
	// return -1 to indicate that the nodeID wasn't found
	return -1;
}


/*
 * This function returns the index of an edge based on its 
 * fromNodeID and toNodeID
 */
GraphModel.prototype.findEdge = function(fromNodeID, toNodeID) {
	// loop through edges in tree
	for	(var index = 0; index < this.edges.length; index++) {
		// check whether the current nodeID is the target nodeID
	    if (this.edges[index].fromNodeID == fromNodeID && 
	    	this.edges[index].toNodeID == toNodeID)
	    	// return the index of the target nodeID within the 
	    	// node array
	    	return index;
	}
	// return -1 to indicate that the nodeID wasn't found
	return -1;
}


/*
 * This function is used to add a node to the nodes array
 */
SearchModel.prototype.addNodeToGraph = function(nodeID, heuristic) {
	// is the heuristic less than zero?
	if (heuristic < 0) return;
	// does the node already exist?
	if (this.graph.findNode(nodeID) >= 0) return;
	// Create a GraphNode object
	var newGraphNode = new GraphNode();
	// Initialize object values
	newGraphNode.nodeID = nodeID;
	newGraphNode.heuristic = heuristic;	
	// Add GraphNode object to array of nodes
	this.graph.nodes[this.graph.nodes.length] = newGraphNode;
}


/*
 * This function is used to add an edge to the edges array
 */
SearchModel.prototype.addEdgeToGraph = function(fromNodeID, toNodeID, cost) {
	// are the from and to nodes the same?
	if (fromNodeID == toNodeID) return;
	// Is cost > 0?
	if (cost < 0) return;
	// does the from node already exist?
	if (this.graph.findNode(fromNodeID) < 0) return;
	// does the to node already exist?
	if (this.graph.findNode(toNodeID) < 0) return;
	// does the edge already exist?
	if (this.graph.findEdge(fromNodeID, toNodeID) >= 0) return;
	// Create a GraphEdge object
	var newGraphEdge = new GraphEdge();
	// initialize values
	newGraphEdge.fromNodeID = fromNodeID;
	newGraphEdge.toNodeID = toNodeID;
	newGraphEdge.cost = cost;
	// Add GraphEdge object to array of edges
	this.graph.edges[this.graph.edges.length] = newGraphEdge;
}


/*
 * This function dumps the contents of the node array in no particular
 * order.
 */
GraphModel.prototype.dumpGraph = function() {
	// loop through the nodes array
	for	(var index = 0; index < this.nodes.length; index++) {
		// print out ID of each node
		console.log("Index: " + index + " ID: " + this.nodes[index].nodeID);
	}
	// loop through the edges array
	for	(var index = 0; index < this.edges.length; index++) {
		// print out details about each edge
		console.log("Index: " + index + " fromID: " + this.edges[index].fromNodeID 
						+ " toID: " + this.edges[index].toNodeID);

	}
}


/*
 * This function returns a list of all the nodes in the graph.
 */
GraphModel.prototype.nodeList = function() {
// 	console.log("-----Node List-----");
	// create empty array to store list
	var nodeList = [];
	// loop through the nodes array
	for	(var index = 0; index < this.nodes.length; index++) {
		// add nodeID to path
		nodeList[nodeList.length] = this.nodes[index].nodeID;
	}
	// return list of nodes
	return nodeList;
}



/*
 * TreeNode represents the nodes within the search tree. A
 * tree node has a unique ID. Depending on the search
 * algorithm being used, it may or may not have:
 * - a heuristic value indicating the node's distance from 
 * the goal node, where a larger value indicates greater 
 * distance from the goal.
 * - a cost value indicating the sum of all the edge costs
 * traversed to reach this node in the tree
 * The node has a pointer back to its parent, an array of
 * pointers to its children, and a pointer to the 
 * corresponding node in the state space graph.
 */
function TreeNode() {
	// Node ID - unique for each node in graph
	this.nodeID = '';
	// Heuristic (h) value - Distance from node to goal
	this.heuristic = 0;
	// Cost (g) value - Total cost of all edges traversed to reach this node
	this.cost = 0;
	// Depth of node within search tree
	this.depth = 0;
	// ID of Node's parent in tree
	this.parent = '';
	// Array of Node's children in tree
	this.children = [];
	// ID of unique node in graph
	this.graphNodeID = '';
} // TreeNode


/*
 * The TreeModel consists of an array of tree nodes.
 */
function TreeModel() {
	// array of nodes - starts off empty
	this.nodes = [];
	// keep a pointer to the root node handy
	this.rootNodeID = '';
	// I keep an array of how many nodes are at each depth
	// in the tree. This makes it easier to draw later on.
	this.depthList = [];
}


TreeModel.prototype.reset = function() {
// 	console.log("resetting model");
	// array of nodes - starts off empty
	emptyOutArray(this.nodes);
	// keep a pointer to the root node handy
	this.rootNodeID = '';
	// I keep an array of how many nodes are at each depth
	// in the tree. This makes it easier to draw later on.
	emptyOutArray(this.depthList);
}


/*
 * This function adds a new node to the search tree.
 */
SearchModel.prototype.addNodeToTree = function(nodeID, heuristic, cost, parent, graphNodeID) {
	// is the heuristic less than zero?
	if (heuristic < 0) return;
	// is the cost less than zero?
	if (cost < 0) return;
	// if a tree node with this ID already exists then don't
	// do anything because tree node IDs are unique
	if (this.tree.findNode(nodeID) >= 0) return;
	// if the corresponding graph node does not exist then
	// don't do anything
	if (this.graph.findNode(graphNodeID) < 0) return;
	// create new TreeNode object
	var newTreeNode = new TreeNode();
	// set values in object
	newTreeNode.nodeID = nodeID;
	newTreeNode.heuristic = heuristic;
	newTreeNode.parent = parent;
	newTreeNode.graphNodeID = graphNodeID;
	// if this isn't the root calculate depth and cost of node and
	// update it's parent's list of children
	if (parent != '') {
		// find the index of the parent in the tree's node list
		parentIndex = this.tree.findNode(parent);
		// the child's depth is 1 + the parent's
		newTreeNode.depth = 1 + this.tree.nodes[parentIndex].depth;
		// the child's cost is the cost of the last edge plus the cost
		// to reach the parent
		newTreeNode.cost = cost + this.tree.nodes[parentIndex].cost;
		// add this node to the parent's list of children
		this.tree.nodes[parentIndex].children.push(nodeID);
	// if this is the root then depth = 0 which is the default
	} else {
		this.tree.rootNodeID = nodeID;
	}
	// increment my count of how many nodes are at each depth
	// first I have to check whether I have a counter for the
	// current level
	if (!(newTreeNode.depth in this.tree.depthList)) {
		// we haven't started counting at this depth yet, so
		// this is the first one
		this.tree.depthList[newTreeNode.depth] = 1;
	} else {
		// increment the depth counter
		this.tree.depthList[newTreeNode.depth] += 1;
	}
// 	console.log("updating depthList: " + this.tree.depthList);
	// add node to array of nodes
	this.tree.nodes[this.tree.nodes.length] = newTreeNode;
	// return a pointer to new tree node
	return newTreeNode;	
}


/*
 * This function returns the index of a tree node based on its ID
 */
TreeModel.prototype.findNode = function(nodeID) {
	// loop through nodes in tree
	for	(var index = 0; index < this.nodes.length; index++) {
		// check whether the current nodeID is the target nodeID
	    if (this.nodes[index].nodeID == nodeID)
	    	// return the index of the target nodeID within the 
	    	// node array
	    	return index;
	}
	// return -1 to indicate that the nodeID wasn't found
	return -1;
}


/*
 * This function starts at a node (usually a leaf) in the tree and traces
 * back to the root node.
 */
TreeModel.prototype.traverseTree = function(startNodeID) {
// 	console.log("-----traverse tree-----");
	// create empty array to store path
	var path = [];
	// initialize the variable for traversing the tree
	// treePtr is an index into the node array
	var nodeIndex = this.findNode(startNodeID);
	do {
// 		console.log(path);
// 		console.log(nodeIndex);
// 		console.log(this.nodes[nodeIndex]);
		// add nodeID to path - keep adding to front so the path
		// comes out in the right order
//		path[path.length] = this.nodes[nodeIndex].nodeID;
		path.unshift(this.nodes[nodeIndex].nodeID);
		// get the parent ID
	    parentNodeID = this.nodes[nodeIndex].parent;
		// move to the node's parent
		nodeIndex = this.findNode(parentNodeID);
	// as long as the node being pointed to has a parent, keep traversing
	} while (parentNodeID != '')
	// add root node to path
	path[path.length] = parentNodeID;
	// return path from start node to tree root
	return path;
}


/*
 * This function dumps the contents of the node array in no particular
 * order.
 */
TreeModel.prototype.dumpTree = function() {
	for	(var index = 0; index < this.nodes.length; index++) {
		console.log("Index: " + index + " ID: " + this.nodes[index].nodeID + " Parent: " 
					+ this.nodes[index].parent);
	}
}


/*
 * FringeNode represents the nodes within the fringe. Each
 * fringe node corresponds to a node in the search tree. 
 * Depending on the search algorithm being used, it may or 
 * may not have:
 * - a heuristic value indicating the node's distance from 
 * the goal node, where a larger value indicates greater 
 * distance from the goal.
 * - a cost value indicating the sum of all the edge costs
 * traversed to reach this node in the tree
 */
function FringeNode() {
	// Node ID - same as the ID of a node in the search tree
	this.nodeID = '';
	// Heuristic (h) value - Distance from node to goal
	this.heuristic = 0;
	// Cost (g) value - Total cost of all edges traversed to reach this node
	this.cost = 0;
} // FringeNode


/*
 * The fringe keeps track of what nodes are available for expansion.
 * The fringe is implemented as a priority queue. The "priority" is
 * determined by the algorithm:
 *   Depth-First - order added (ascending)
 *   Breadth-First - order added (descending)
 *   Greedy - heuristic (ascending)
 *   Uniform Cost Search - cost (ascending)
 *   A* - cost + heuristic (ascending)
 */
function FringeModel() {
	// array of Fringe Nodes - starts off empty
	this.nodes = [];
}


FringeModel.prototype.reset = function() {
	// array of nodes - starts off empty
	emptyOutArray(this.nodes);
}


/*
 * This function dumps the contents of the fringe in order.
 */
FringeModel.prototype.dumpFringe = function() {
	// loop through all items in the array
	for	(index = 0; index < this.nodes.length; index++) {
		// print out each nodeID in the fringe
		console.log("Index: " + index + 
					"\tID: " + this.nodes[index].nodeID + 
					"\tCost: " + this.nodes[index].cost + 
					"\tHeuristic: " + this.nodes[index].heuristic +
					"\tDepth: " + this.nodes[index].depth);
	}
}


FringeModel.prototype.fringeToString = function() {
	var fringeStr = " ";
	// loop through all items in the array
	for	(index = 0; index < this.nodes.length; index++) {
		// add each nodeID in the fringe to our string
		fringeStr += this.nodes[index].nodeID + " ";
	}
	// return the string when we're done
// 	console.log(fringeStr);
	return fringeStr;
}


FringeModel.prototype.lowestCostNodeIndex = function() {
	// keep track of current lowest cost
	var lowestCost = -1;
	// keep index of node with current lowest cost
	var lowestCostIndex = -1;
	// loop through all the items in the fringe
	for	(index = 0; index < this.nodes.length; index++) {	
		// compare the current lowest cost to current node's cost
		if (lowestCost == -1 || lowestCost > this.nodes[index].cost) {
			// if we found a new lowest cost, keep track of it
			lowestCost = this.nodes[index].cost;
			lowestCostIndex = index;
		}
	}
	// return the index
	return index;
}

/*
 * This function adds a new tree nodeID to the fringe.
 */
SearchModel.prototype.addNodeToFringe = function(nodeID, cost, heuristic, depth) {
	// Does the tree node exist?
	if (this.tree.findNode(nodeID) < 0) return;
	// Did we get a cost value?
	if (cost === undefined) cost = 0;
    // Did we get a heuristic value
	if (heuristic === undefined) heuristic = 0;
    // Did we get a depth value
	if (depth === undefined) depth = 0;
	// create a fringe node object
	var newFringeNode = new FringeNode();
	// set values in object
	newFringeNode.nodeID = nodeID;
	newFringeNode.heuristic = heuristic;
	newFringeNode.cost = cost;
	newFringeNode.depth = depth;	
	// add fringe node to end of array of nodes
	this.fringe.nodes[this.fringe.nodes.length] = newFringeNode;	
}


/*
 * This function removes a node from the fringe and returns it. Which node
 * gets removed depends on which search algorithm we're using
 */
SearchModel.prototype.getNextFringeNode = function(searchAlg) {
// 	console.log("-------------getNextFringeNode-------------");
// 	console.log("-----fringe-----");
// 	this.fringe.dumpFringe();
	// sanity check - are there any nodes in fringe?
	if (this.fringe.nodes.length <= 0) return -1;
	// sanity check - are we searching?
	if (searchAlg == "None") return -1;
	// initialize fringeNode
	var fringeNode = -1;
	// choose next node based on search algorithm
	switch (searchAlg) {
		case "DFS":
			// if we are doing depth-first search, take the last node added
			fringeNode = this.fringe.nodes.pop();
			break;
		default:
			alert("No search algorithm selected");
			break;
	}
	// return node
	return fringeNode;
}