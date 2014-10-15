/*
 * main.js
 * Rich Simpson
 * August 19, 2014
 *
 * This code implements a simulation of search algorithms
 * for integration with Smart Sparrow.  
 *
 * This is our view - The V in MVC
 */

function SearchView() {
	// set up graph view
	this.setupGraphView();
	// set up tree view
	this.setupTreeView();
	// Only set up the controls once
	this.setupControls();	
	// set up fringe view
	this.setupFringeView();
}


SearchView.prototype.reset = function() { 
	// set up graph view
	this.setupGraphView();
	// set up tree view
	this.setupTreeView();
	// reset controls like buttons to their original state
	this.resetControls();
	// set up the fringe view
	this.setupFringeView();
}



/*
 * Create the controls view
 */

SearchView.prototype.resetControls = function() {
	$( "#chooseBtn" ).prop("checked", true);
	$( "#SearchAlgorithm" ).buttonset('refresh');
}


initiateSearch = function(btnID, algLabel, searchAlg) {
	// if we are already searching, then don't do anything
	if (searchController.searchAlg == searchAlg) return;
	// reset the controller
	searchController.reset();
	// turn off the "choose" button
	$( "#chooseBtn" ).prop("checked", false);
	// check the DFS radio button
	$( btnID ).prop("checked", true);
	// make sure button group reflects changes
	$( "#SearchAlgorithm" ).buttonset('refresh');
	// display the search algorithm
	$( "#SearchAlgorithmLabel" ).html(algLabel);
	// enable the next button
	$( "#nextBtn" ).prop("disabled",false);
	// set the search algorithm to breadth-first
	searchController.searchAlg = searchAlg;
	// do the first step of the algorithm
	var path = searchController.genericSearchFirstStep();
	// if path is an array then we already found the solution
	if (isArray(path)) alert(path);
}

SearchView.prototype.setupControls = function() {
	// set up event handler for depth limit spinner
	var depthLimitSpnr = $( "#depthLimitSpnr" ).spinner({
		change: function( event, data ) {
			searchController.setSearchParameters({depthLimit:depthLimitSpnr.spinner( "value" )});
		},
	});
	// set maximum value and minimum value
	$( "#depthLimitSpnr" ).spinner( "option", "max", 50);
	$( "#depthLimitSpnr" ).spinner( "option", "min", 0);
	// set how much the value changes (steps) when up or down button
	// is pressed
	$( "#depthLimitSpnr" ).spinner( "option", "step", 5);
	// initialize radio buttons for choosing search algorithm
	$( "#SearchAlgorithm" ).buttonset();
	// disable the next button
	$( "#nextBtn" ).prop("disabled",true);
	// set up event handler for breadth-first search button
	$( "#bfsBtn" ).click(function() {
		initiateSearch("#bfsBtn", "Breadth-First Search", "BFS");
	});
	// set up event handler for depth-first search button
	$( "#dfsBtn" ).click(function() {
		initiateSearch("#dfsBtn", "Depth-First Search", "DFS");
	});	
	// set up event handler for uniform cost search button
	$( "#ucsBtn" ).click(function() {
		initiateSearch("#ucsBtn", "Uniform Cost Search", "UCS");
	});	
	// set up event handler for greedy search button
	$( "#greedyBtn" ).click(function() {
		initiateSearch("#greedyBtn", "Greedy Search", "GS");
	});	
	// add event handler for next step button
	$( "#nextBtn" ).click(function() {
		// check the search algorithm
		switch (searchController.searchAlg) {
			case "UCS":
			case "BFS":
			case "DFS":
			case "GS":
				// do the next step of the algorithm
				var path = searchController.genericSearchNextStep();
				// if path is an array then we found the solution or we ran
				// out of nodes to search
				if (isArray(path)) {
					// display the solution path
					alert(path);
					// disable the next button
					$( "#nextBtn" ).prop("disabled",true);
				}
				break;
			default:
				alert("No search algorithm selected");
				break;
		}
	});
	// add event handler for reset button
	$( "#resetBtn" ).click(function() {
		searchController.reset();
		// reset the search algorithm label
		$( "#SearchAlgorithmLabel" ).html("Choose a search algorithm by pressing on one of the buttons above.");
	});
}


/*
 * Create the graph view. The graph is drawn on a canvas.
 * Each node is represented as a circle. The graph is 
 * precomputed, so I create an array
 * of objects to keep track of which nodes have been
 * "discovered" by the search algorithm.
 */
SearchView.prototype.setupGraphView = function() { 
	// handle for graph canvas
	this.graphCanvas = document.getElementById('graphCanvas');	
	// handle for graph canvas context
	this.graphContext = this.graphCanvas.getContext('2d');
	// erase the canvas
	this.graphContext.clearRect(0, 0, this.graphCanvas.width, this.graphCanvas.height);
	// set canvas to 1/3 width of window
	this.graphContext.canvas.width  = (window.innerWidth / 3) - 10;
	// set radius for each node
	this.graphNodeRadius = 20;
	// create an object filled with node objects. each 
	// object stores:
	// - the x and y position of the node within the canvas, 
	// - the id of the node
	this.graphNodes = {
		A:{x:100, y:50, id:'A'},
		B:{x:175, y:50, id:'B'},
		C:{x:250, y:50, id:'C'},
		D:{x:325, y:50, id:'D'},
		E:{x:100, y:125, id:'E'},
		F:{x:175, y:125, id:'F'},
		G:{x:250, y:125, id:'G'},
		H:{x:325, y:125, id:'H'},
		I:{x:100, y:200, id:'I'},
		J:{x:175, y:200, id:'J'},
		K:{x:250, y:200, id:'K'},
		L:{x:325, y:200, id:'L'},
		M:{x:100, y:275, id:'M'},
		N:{x:175, y:275, id:'N'},
		O:{x:250, y:275, id:'O'},
		P:{x:325, y:275, id:'P'},
		Q:{x:100, y:350, id:'Q'},
		R:{x:175, y:350, id:'R'},
		S:{x:250, y:350, id:'S'},
		T:{x:325, y:350, id:'T'},
	};
}


SearchView.prototype.drawGraph = function(nodeList) { 
	// erase the canvas
	this.graphContext.clearRect(0, 0, this.graphCanvas.width, this.graphCanvas.height);
	this.graphContext.canvas.width  = (window.innerWidth / 3) - 10;
	// draw all the nodes that have been "discovered"
	this.drawNodes(nodeList);
	// draw the edges between the discovered nodes
	this.drawEdges(nodeList);
}

SearchView.prototype.drawEdges = function(nodeList) { 
	// make sure we have a canvas and a context
	if (this.graphCanvas.getContext) {
		// loop through the node list and find all the edges that
		// should be visible
		for (var startIndex = 0; startIndex < nodeList.length; startIndex++) {
			var startNodeID = nodeList[startIndex];
			for (var endIndex = 0; endIndex < nodeList.length; endIndex++) {
				var endNodeID = nodeList[endIndex];
				// is the node supposed to be drawn?
				if (searchController.searchModel.graph.findEdge(startNodeID, endNodeID) >= 0) {
					this.drawEdge(startNodeID, endNodeID);
				} // if we're supposed to draw this edge
			} // all nodes are the endNode
		} // all nodes are the startNode
	} // if we have a context
}


SearchView.prototype.drawEdge = function(startNode, endNode) { 
	// get the cost of the edge
	var edgeCost = searchController.searchModel.graph.findEdgeCost(startNode, endNode);
	// if the cost is -1 then we don't need to draw it, so we're done
	if (edgeCost == -1) return;
	// make sure we have a canvas to draw in
	if (this.graphCanvas.getContext) {
		// start the drawing path
		this.graphContext.beginPath();
		// all the edges are drawn in black
 		this.graphContext.strokeStyle = "black";
		// get starting x,y coordinates
		var startX = this.graphNodes[startNode].x;
		var startY = this.graphNodes[startNode].y;
		// get ending x,y coordinates
		var endX = this.graphNodes[endNode].x;
		var endY = this.graphNodes[endNode].y;
// 		console.log('-----');
// 		console.log('sN: ' + startNode + ' eN: ' + endNode);
// 		console.log('sX: ' + startX + ' sY: ' + startY +
// 					'eX: ' + endX + ' eY: ' + endY);
		// adjust x coordinate of start and end points to 
		// begin drawing at edge of nodes
		// if the start node is to the left of the end node
		if (startX < endX) {
			startX += this.graphNodeRadius;
			endX -= this.graphNodeRadius;
		// if the start node is to the right of the end node
		} else if (startX > endX) {
			startX -= this.graphNodeRadius;
			endX += this.graphNodeRadius;			
		}
		// adjust y coordinate of start and end points to 
		// begin drawing at edge of nodes
		// if the start node is above the end node
		if (startY < endY) {
			startY += this.graphNodeRadius;
			endY -= this.graphNodeRadius;
		// if the start node is below the end node
		} else if (startY > endY) {
			startY -= this.graphNodeRadius;
			endY += this.graphNodeRadius;			
		}
// 		console.log('sX: ' + startX + ' sY: ' + startY +
// 					'eX: ' + endX + ' eY: ' + endY);
// 		console.log('-----');
		// move to the start of the line
		this.graphContext.moveTo(startX, startY);
		// draw the line
		this.graphContext.lineTo(endX, endY);
		// close the drawing path
		this.graphContext.closePath();
		// fill in the line on the canvas
		this.graphContext.stroke();
		// if we are using an algorithm that doesn't consider cost, add costs to the graph
		if (searchController.searchAlg == "UCS") {
			// set the font for the cost
			this.graphContext.textAlign = "center";
			this.graphContext.textBaseline = "bottom";
			this.graphContext.fillStyle = "red";
			this.graphContext.font = "12pt Helvetica";
			// get mid-point x,y coordinates
			var midX = Math.floor((startX + endX) / 2);
			var midY = Math.floor((startY + endY) / 2);
			// create a string for the cost value
			var costString = "g=" + edgeCost;
			// draw the cost string
			this.graphContext.fillText(costString, midX, midY);
		}
	} // if we have a context
}


SearchView.prototype.drawNodes = function(nodeList) { 
	// make sure we have a canvas and a context
	if (this.graphCanvas.getContext) {
		// loop through the array and draw all the nodes that
		// should be visible
		for (nodeID in this.graphNodes) {
			// is the node supposed to be drawn?
			if (nodeInList(nodeID, nodeList)) {
				this.drawNode(nodeID);
			} // if we're supposed to draw this node
		} // loop over all nodes in object
	} // if we have a context
}


SearchView.prototype.drawNode = function(nodeID) { 
	// start the drawing path
	this.graphContext.beginPath();
	// if this is the start node or end node, draw it in red
	if (nodeID == searchController.searchModel.startNode ||
		nodeID == searchController.searchModel.endNode) {
 		this.graphContext.strokeStyle = "red";
 	// otherwise, draw it in black
	} else {
 		this.graphContext.strokeStyle = "black";
 	}
	// move the pen to the starting point of the node
	// if I don't do this I get lines between each circle I draw
	// I have to offset the x value because x is in the center of the circle
	this.graphContext.moveTo(this.graphNodes[nodeID].x + this.graphNodeRadius, 
							this.graphNodes[nodeID].y);
	// draw the node
	this.graphContext.arc(	this.graphNodes[nodeID].x,	// x
							this.graphNodes[nodeID].y, 	// y
							this.graphNodeRadius, 		// radius
							0, 							// start angle
							Math.PI * 2, 				// end angle
							true);						// clockwise
 	// draw the node on the canvas
	this.graphContext.stroke();
	// set the font for the node ID
	this.graphContext.textAlign = "center";
	this.graphContext.textBaseline = "bottom";
	this.graphContext.fillStyle = "black";
	this.graphContext.font = "12pt Helvetica";
	// draw the node ID
	this.graphContext.fillText(nodeID, this.graphNodes[nodeID].x, this.graphNodes[nodeID].y);
	// set the font for the node's heuristic value
	this.graphContext.textAlign = "center";
	this.graphContext.textBaseline = "top";
	this.graphContext.fillStyle = "black";
	this.graphContext.font = "10pt Helvetica";
	// get the index to the node list in the model
	graphNodeIndex = searchController.searchModel.graph.findNode(nodeID);
	// create a string for the heuristic value
	var hString = "h=" + searchController.searchModel.graph.nodes[graphNodeIndex].heuristic;
	// draw the heuristic string
	this.graphContext.fillText(hString, this.graphNodes[nodeID].x, this.graphNodes[nodeID].y);
}


/*
 * Create the tree view. The tree is drawn on a canvas.
 * Each node is represented as a circle. Unlike the
 * graph, the tree is computed as the search progresses,
 * so I don't create anything ahead of time.
 */
SearchView.prototype.setupTreeView = function() { 
	// handle for tree canvas
	this.treeCanvas = document.getElementById('treeCanvas');	
	// handle for tree canvas context
	this.treeContext = this.treeCanvas.getContext('2d');
	// erase the canvas
	this.treeContext.clearRect(0, 0, this.treeCanvas.width, this.treeCanvas.height);
	// set canvas to 2/3 width of window
	this.treeContext.canvas.width  = (window.innerWidth * 2 / 3) - 10;
	// set radius for each node
	this.treeNodeRadius = 10;
	// the root node gets drawn in the top center
	this.rootX = this.treeCanvas.width / 2;
	this.rootY = 10;
	// each layer of nodes gets drawn the same distance
	// below the previous layer
	this.verticalSeparation = this.treeNodeRadius * 4;
}


SearchView.prototype.drawTree = function() { 
	// erase the canvas
	this.treeContext.clearRect(0, 0, this.treeCanvas.width, this.treeCanvas.height);
	this.treeContext.canvas.width  = (window.innerWidth * 2 / 3) - 10;
	var depthCount = [];
	this.drawTreeNodes(searchController.searchModel.tree.rootNodeID,	// id of node to be drawn
						searchController.searchModel.tree.depthList,	// number of nodes at each level
						depthCount, 			// array of counters for how many nodes we have drawn at each level
						this.rootX, 			// the x coordinate of the node's center
						this.rootY, 			// the y coordinate of the node's center
						this.treeCanvas.width);	// the width of the columns at this level
}


/*
 * This is a recursive depth-first traversal of the tree. 
 * depthList - array containing the number of nodes at each depth in the tree
 * columnWidth - each "level" of the tree (corresponding to each depth) is divided
 * into columns. Each column is an equal size, so columnWidth = canvasWidth / depthList[i]
 */
SearchView.prototype.drawTreeNodes = function(rootNodeID, depthList, depthCount, rootX, rootY, columnWidth) { 
// 	console.log("---drawing tree---");
// 	console.log("\trn: " + rootNodeID);
// 	console.log("\tdL: " + depthList);
// 	console.log("\tdC: " + depthCount);
// 	console.log("\trX: " + rootX + " rY: " + rootY + " cW: " + columnWidth);
// 	if (! confirm("Keep Going?")) return;
	// make sure we have a canvas and a context
	if (this.treeCanvas.getContext) {
		// get the index of the node in the tree's nodeList
		var rootNodeIndex = searchController.searchModel.tree.findNode(rootNodeID);
		// if the node exists
		if (rootNodeIndex >= 0) {
			// draw the node
			this.drawTreeNode(rootNodeID, rootX, rootY);
			// get the depth of the node
			var rootNodeDepth = searchController.searchModel.tree.nodes[rootNodeIndex].depth;
			// keep track of how many nodes we have left at this level
			// first I have to check whether I have a counter for the
			// current level
			if (!(rootNodeDepth in depthCount)) {
				// we haven't started counting at this depth yet, so
				// this is the first one
				depthCount[rootNodeDepth] = 1;
			} else {
				// increment the depth counter
				depthCount[rootNodeDepth] += 1;
			}
			// loop through the node's children
			for (var childIndex = 0; childIndex < searchController.searchModel.tree.nodes[rootNodeIndex].children.length; childIndex++) {
				// get the nodeID for the child
				var childID = searchController.searchModel.tree.nodes[rootNodeIndex].children[childIndex];
				// how many nodes have been drawn at the child's depth?
				// first make sure we have a counter
				var nodesInNextLevel = 0;
				if (!(rootNodeDepth+1 in depthCount)) {
					// we haven't started counting at this depth yet, so
					// this is the first one
					depthCount[rootNodeDepth+1] = 0;
				} else {
					// increment the depth counter
					nodesInNextLevel = depthCount[rootNodeDepth+1];
				}
				// how wide is each column
				var columnWidth = this.treeCanvas.width / depthList[rootNodeDepth + 1];
				// where is the center of the column we are drawing in?
				// if the node is in column x, we want to go over x-1 
				// columns and then half of the xth column
				var xPos = (nodesInNextLevel * columnWidth) + (columnWidth / 2);
				// where are the nodes in this depth drawn?
				var yPos = rootY + this.verticalSeparation;
// 				console.log("\tchild = " + childID + " nINL: " + nodesInNextLevel + 
// 							" cW: " + columnWidth + " xPos: " + xPos);
				// recurse!
				this.drawTreeNodes(childID,					// ID of the child node
									depthList, 				// counters for how many nodes are at each depth
									depthCount,				// counters for how many nodes have we drawn
									xPos,					// center of column
									yPos,					// y position for next level
									columnWidth);			// column width
				// draw edge between root node and child
				// startNodeID, startX, startY, endNodeID, endX, endY
				this.drawTreeEdge(rootX, rootY, xPos, yPos);
			} // loop through all the children
		} // if we have a node
	} // if we have a context
}


SearchView.prototype.drawTreeNode = function(nodeID, xPos, yPos) { 
	// start the drawing path
	this.treeContext.beginPath();
 	// draw the node in black
	this.treeContext.strokeStyle = "black";
	// move the pen to the starting point of the node
	// if I don't do this I get lines between each circle I draw
	// I have to offset the x value because x is in the center of the circle
	this.treeContext.moveTo(xPos + this.treeNodeRadius, yPos);
	// draw the node
	this.treeContext.arc(	xPos,						// x
							yPos, 						// y
							this.treeNodeRadius, 		// radius
							0, 							// start angle
							Math.PI * 2, 				// end angle
							true);						// clockwise
 	// draw the node on the canvas
	this.treeContext.stroke();
	// set the font for the node ID
	this.treeContext.textAlign = "center";
	this.treeContext.textBaseline = "middle";
	this.treeContext.fillStyle = "black";
	this.treeContext.font = "8pt Helvetica";
	// draw the node ID
	this.treeContext.fillText(nodeID, xPos, yPos);
}


SearchView.prototype.drawTreeEdge = function(startX, startY,endX, endY) { 
	if (this.treeCanvas.getContext) {
		// start the drawing path
		this.treeContext.beginPath();
		// all the edges are drawn in black
 		this.treeContext.strokeStyle = "black";
// 		console.log('-----');
// 		console.log('sN: ' + startNode + ' eN: ' + endNode);
// 		console.log('sX: ' + startX + ' sY: ' + startY +
// 					'eX: ' + endX + ' eY: ' + endY);
		// adjust x coordinate of start and end points to 
		// begin drawing at edge of nodes
		// if the start node is to the left of the end node
		if (startX < endX) {
			startX += this.treeNodeRadius;
			endX -= this.treeNodeRadius;
		// if the start node is to the right of the end node
		} else if (startX > endX) {
			startX -= this.treeNodeRadius;
			endX += this.treeNodeRadius;			
		}
		// adjust y coordinate of start and end points to 
		// begin drawing at edge of nodes
		// if the start node is above the end node
		if (startY < endY) {
			startY += this.treeNodeRadius;
			endY -= this.treeNodeRadius;
		// if the start node is below the end node
		} else if (startY > endY) {
			startY -= this.treeNodeRadius;
			endY += this.treeNodeRadius;			
		}
// 		console.log('sX: ' + startX + ' sY: ' + startY +
// 					'eX: ' + endX + ' eY: ' + endY);
// 		console.log('-----');
		// move to the start of the line
		this.treeContext.moveTo(startX, startY);
		// draw the line
		this.treeContext.lineTo(endX, endY);
		// close the drawing path
		this.treeContext.closePath();
		// fill in the line on the canvas
		this.treeContext.stroke();
	} // if we have a context
}

/*
 * Create the fringe view
 */
SearchView.prototype.setupFringeView = function() {
	// depth limit doesn't matter
	$( "#depthLimitDisplay" ).html("<h2>Depth limit only applies for DFS-ID</h2>");
	// fringe is empty
	$( "#fringeDisplay" ).html("<h2>Fringe is empty</h2>");
	// no nodes have been expanded
	$( "#expandedNodesDisplay" ).html("<h2>No nodes have been expanded yet</h2>");
}


SearchView.prototype.updateFringeView = function(fringeString, expandedNodesString) {
	// if we are doing DFS-ID, then update the depth limit
	if (searchController.searchAlg == "DFSID") {
		$( "#depthLimitDisplay" ).html("<h2>" + searchController.depthLimitCounter + "</h2>");
	}
	// update list of nodes in fringe
	$( "#fringeDisplay" ).html("<h2>" + fringeString + "</h2>");
	// update list of expanded nodes
	$( "#expandedNodesDisplay" ).html("<h2>" + expandedNodesString + "</h2>");
}




