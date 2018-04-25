// Define constant size for the cells
const cell_size = 30;
var tick = 0;

var animateId;
/**
 * TODO: 1) Change Environment into a Singleton (this way I can fucking animate easier)
 *       2) Implement food logic into cells.js
 *       3) Implement bacteria logic into bacteria.js
 */

/**
 * Environment is the general "system" of the animation.
 * It contains the cells and bacteria, as well as maintains the drawing
 *  of the cells and bacteria.
 */
// Color for the cells: #999900
// Color for bacteria: #004400
var Environment = {
    stage : new PIXI.Container(),
    graphics : new PIXI.Graphics(),

    // Initial canvas set-up
    canvas : new PIXI.Application({
        width : 900,
        height : 720
    }),
        
    // cells contains the cells that make up the environment
    cells : [],

    // bacteria is the array holding all of the bacteria currently
    // occupying the cells
    bacteria : [],

    // Initialize the view of the canvas
    initView : function() {
        this.canvas.view.style.display = 'block';
        this.canvas.view.style.margin = 'auto';
        this.canvas.view.style.padding = '5px';
        this.canvas.view.style.backgroundColor = '#ffffff';
        document.body.appendChild(this.canvas.view);
    },

    // Initialize and create the matrix of cells
    initCells : function() {
        for (let i = 0; i < 30; i++) { // i represents the rows
            this.cells.push([]);
            for (let j = 0; j < 24; j++) { // j represents the columns
                var cell = new Cell(i, j);
                this.cells[i].push(cell);
            }
        }
        // Initialize the neighbors of the cells (only up, down, left, and right)
        for (let i = 0; i < this.cells.length; i++) { // i is the index of the column
            for (let j = 0; j < this.cells[i].length; j++) { // j is the index of the row
                let cell = this.cells[i][j];
                if (i == 0) {
                    if (j == 0) {                                   // top left corner
                        cell.neighbors[1] = this.cells[i + 1][j];
                        cell.neighbors[2] = this.cells[i][j + 1];
                    } else if (j == this.cells[i].length - 1) {     // bottom left corner
                        cell.neighbors[0] = this.cells[i][j - 1];
                        cell.neighbors[1] = this.cells[i + 1][j];
                    } else {                                        // left side
                        cell.neighbors[0] = this.cells[i][j + 1];
                        cell.neighbors[1] = this.cells[i + 1][j];
                        cell.neighbors[2] = this.cells[i][j - 1];
                    }
                } else if (i == this.cells.length - 1) {            
                    if (j == 0) {                                   // top right corner
                        cell.neighbors[2] = this.cells[i][j + 1];
                        cell.neighbors[3] = this.cells[i - 1][j];
                    } else if (j == this.cells[i].length - 1) {     // bottom right corner
                        cell.neighbors[0] = this.cells[i][j - 1];
                        cell.neighbors[3] = this.cells[i - 1][j];
                    } else {                                        // right side
                        cell.neighbors[0] = this.cells[i][j - 1];
                        cell.neighbors[2] = this.cells[i][j + 1];
                        cell.neighbors[3] = this.cells[i - 1][j];
                    }
                } else {
                    if (j == 0) {                                   // top side
                        cell.neighbors[1] = this.cells[i + 1][j];
                        cell.neighbors[2] = this.cells[i][j + 1];
                        cell.neighbors[3] = this.cells[i - 1][j];
                    } else if (j == this.cells[i].length - 1) {     // bottom side
                        cell.neighbors[0] = this.cells[i][j - 1];
                        cell.neighbors[1] = this.cells[i + 1][j];
                        cell.neighbors[3] = this.cells[i - 1][j];
                    } else {                                        // middle
                        cell.neighbors[0] = this.cells[i][j - 1];
                        cell.neighbors[1] = this.cells[i + 1][j];
                        cell.neighbors[2] = this.cells[i][j + 1];
                        cell.neighbors[3] = this.cells[i - 1][j];
                    }
                }
            }    
        }
    },

    // Create 3 initial bacteria, randomly placed and associated with different cells
    initBacteria : function() {
        for (let i = 0; i < 6; i++) {
            var bacterium = null;
            while(1) {
                let x = Math.floor(Math.random() * 30);
                let y = Math.floor(Math.random() * 24);
                if (!this.cells[x][y].isOccupied) {
                    bacterium = new Bacteria(cell_size, this.cells[x][y]);
                    this.cells[x][y].bacterium = bacterium;
                    break;
                }
            }
            this.bacteria.push(bacterium);
        }
    },

    // Draw a cell space onto the environment
    drawCells : function() {
        for (let i = 0; i < this.cells.length; i++) {
            for (let j = 0; j < this.cells[i].length; j++) {
                let cell = this.cells[i][j];
                cell.drawCell(cell_size);
                this.canvas.stage.addChild(cell.graphic);
            }
        }
    },

    // Draw a bacteria onto the environment
    drawBacteria : function() {
        for (let i = 0; i < this.bacteria.length; i++) {
            let bacterium = this.bacteria[i];
            bacterium.drawBacterium();
            this.canvas.stage.addChild(bacterium.graphic);
        }
    },

    // Draw the entire environment
    draw : function() {
        this.drawCells();
        this.drawBacteria();
        this.canvas.stage.addChild(this.graphics);
    },

    activate : function() {
        for (let i = 0; i < this.bacteria.length; i++) {
            let bacterium = this.bacteria[i];
            let check = bacterium.takeAction();
            if (check != null) {
                this.bacteria.splice(0, 0, check);
                i++;                                // Need to maintain moving to the next bacterium
            }
            bacterium.cell.regenerateResources();
            if (bacterium.isDead && bacterium.size == 0) {
                this.bacteria.splice(i, 1);    
            } else if (!bacterium.isDead) {
                // let cell = this.bacteria[i].cell;
                // console.log(cell.x + ", " + cell.y);
            }
        }
        console.log(this.bacteria.length);
    }
}

// Initialize the environment and start the simulation
function init() {
    Environment.initView();
    Environment.initCells();
    Environment.initBacteria();
    Environment.draw();
    animate();
}

// Handles the animations in the program 
function animate() {
    if (Environment.bacteria.length == 0) cancelAnimationFrame(animateId);
    if (tick == 100) {
        Environment.activate();
        tick = 0;
    }
    Environment.drawBacteria();
    animateId = requestAnimationFrame(animate);
    tick++;
}

init();