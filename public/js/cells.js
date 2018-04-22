const MIN_RESOURCES = 100;
const MAX_RESOURCES = 200;

const MIN_REGENERATION = 10;
const MAX_REGENERATION = 25;
/**
 * This class is responsible for setting up the cells along with their different
 *  properties (like food, lighting, etc.).
 * 
 * Constructor : param = x, y
 *  Defines the location of the cell
 *  Will also randomly generate the properties available on the cell
 */
// Color for the cells: #999900
// Color for bacteria: #004400
class Cell {
    constructor(x, y) {
        this.graphic = new PIXI.Graphics();
        this.neighbors = [null, null, null, null];
        this.x = x;     // represents the 'column' that the cell is located at  
        this.y = y;     // represents the 'row' that the cell is located at
        this.isOccupied = false;
        this.bacterium = null;
        this.maxResources = (MAX_RESOURCES - MIN_RESOURCES) * Math.random() + MIN_RESOURCES;
        this.resources = this.maxResources;
        this.regenerationFactor = (MAX_REGENERATION - MIN_REGENERATION) * Math.random() + MIN_REGENERATION;
    }

    drawCell(cell_size) {
        this.graphic.beginFill(Cell.color());
        this.graphic.lineStyle(2, 0xffffff);
        this.graphic.drawRect(this.x * cell_size, this.y * cell_size,
             cell_size, cell_size);
        this.graphic.endFill();
    }

    regenerateResources() {
        this.resources += this.regenerationFactor;
        if (this.resources > this.maxResources) this.resources = this.maxResources;
    }

    static color() {
        return 0x999900;
    }
}