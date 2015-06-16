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



// Create a new Search Controller
var searchController = new SearchController();

var simModel = new pipit.CapiAdapter.CapiModel({
    demoMode: true,
    studentResponse: "5"
});


pipit.CapiAdapter.expose('demoMode', simModel);
pipit.CapiAdapter.expose('studentResponse', simModel);
 	

$(document).ready(function() {
	// I don't know why I can't do this in CSS, but I can't and I'm
	// tired of fighting with it.
// 	$("#depthLimitSpnr").width(50);
	// This should really be in my code for initializing the view, but
	// it doesn't work there
 	$("#depthLimitSpnr").spinner( "value", 50 );

	pipit.Controller.notifyOnReady();

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


