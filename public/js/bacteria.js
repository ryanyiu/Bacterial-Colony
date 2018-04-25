const MAX_ENERGY_RESERVE_CHEMOTROPH = 120;
const MAX_ENERGY_RESERVE_PHOTOTROPH = 160;
const MIN_ENERGY_RESERVE = 40;

const MAX_ENERGY_PRODUCTION_CHEMOTROPH = 55;
const MAX_ENERGY_PRODUCTION_PHOTOTROPH = 70;
const MIN_ENERGY_PRODUCTION = 20;

const MAX_ENERGY_CELL_MITOSIS = 10;

const MAX_ENERGY_CELL_MOVEMENT_CHEMOTROPH = 25;
const MAX_ENERGY_CELL_MOVEMENT_PHOTOTROPH = 45;
const MIN_ENERGY_CELL_MOVEMENT = 10;

const MAX_BASE_METABOLIC_RATE_CHEMOTROPH = 30;
const MAX_BASE_METABOLIC_RATE_PHOTOTROPH = 30;
const MIN_BASE_METABOLIC_RATE = 10; 

const MAX_RAND_FACTOR = 0.9;
const MIN_RAND_FACTOR = 0.1;

function incrementColor(color, step) {
    return (parseInt(color, 16) + step).toString(16);
}

function parseColor(color) {
    return parseInt(color, 16);
}
/**
 * Bacteria class is responsible for defining the general bacteria class
 * 
 */
// Color for the cells: #999900
// Color for bacteria: #004400 for phototrophic
//                     #883300 for chemotrophic 
class Bacteria {
    /**
     * Carbon Types: 0 --> autotrophic
     *               1 --> heterotrophic
     *               2 --> mixotrophic
     * 
     * Energy Types: 0 --> phototrophic
     *               1 --> chemotrophic
     * @param cell, this is the cell that the bacteria is associated with
     */
    constructor(cell_size, cell) {
        this.graphic = new PIXI.Graphics();
        this.size = cell_size - 2;
        this.cell = cell;
        this.x = this.cell.x;
        this.y = this.cell.y;
        this.cell.isOccupied = true;
        this.isDead = false;
        this.nextCell = null;
        this.isChild = false;
        // --Specify shape and idle movement--
        this.rounded = Math.floor(Math.random() * 10);
        this.move = Math.random() * 0.2;
        // --Specify energy use and resource requirement, based on cell-type
        this.carbonType = Math.floor(Math.random() * 3);
        this.energyType = Math.floor(Math.random() * 2);
        this.randFactor = (MAX_RAND_FACTOR - MIN_RAND_FACTOR) * Math.random() + MIN_RAND_FACTOR;
        this.reserveEnergy = 0;
        this.resourcesNeeded = [];
        this.lightEfficiency = 0;
        this.setResourcesNeeded();
        this.energyProduction = 0;
        this.baseMetabolicRate = 0;
        this.movementEnergy = 0;
        if (this.energyType == 0) { // Phototroph
            this.energyProduction = (MAX_ENERGY_PRODUCTION_PHOTOTROPH - MIN_ENERGY_PRODUCTION) * this.randFactor
                                        + MIN_ENERGY_PRODUCTION;
            this.baseMetabolicRate = (MAX_BASE_METABOLIC_RATE_PHOTOTROPH - MIN_BASE_METABOLIC_RATE) * this.randFactor
                                        + MIN_BASE_METABOLIC_RATE;
            this.movementEnergy = (MAX_ENERGY_CELL_MOVEMENT_PHOTOTROPH - MIN_ENERGY_CELL_MOVEMENT) * this.randFactor
                                        + MIN_ENERGY_CELL_MOVEMENT;
        } else {                    // Chemotroph
            this.energyProduction = (MAX_ENERGY_PRODUCTION_CHEMOTROPH - MIN_ENERGY_PRODUCTION) * this.randFactor
                                        + MIN_ENERGY_PRODUCTION;
            this.baseMetabolicRate = (MAX_BASE_METABOLIC_RATE_CHEMOTROPH - MIN_BASE_METABOLIC_RATE) * this.randFactor
                                        + MIN_BASE_METABOLIC_RATE;
            this.movementEnergy = (MAX_ENERGY_CELL_MOVEMENT_CHEMOTROPH - MIN_ENERGY_CELL_MOVEMENT) * this.randFactor
                                        + MIN_ENERGY_CELL_MOVEMENT;
        }
        this.mitosisEnergy = this.randFactor * MAX_ENERGY_CELL_MITOSIS;
        // -----------------------------------------------------------------
        this.color;
        if (this.energyType == 0) {
            this.color = "004400";
        } else {
            this.color = "883300";
        }
        //this.setInteractive();
    }

    /**
     * 0 --> Idle 
     * 1 --> Move to a new cell
     * 2 --> Attempt cell mitosis
     * This function will return a newly spawned bacterium from cell mitosis if
     *  mitosis is the action taken by the bacterium
     */
    takeAction() {
        if (this.isDead) return;
        let state = Math.floor(Math.random() * 3);
        switch (state) {
            case 0:
                this.reserveEnergy += this.calculateEnergyProduction() - this.calculateEnergyConsumption(state);
                break;
            case 1:
                if (this.canMove()) {
                    let moveDir = Math.floor(Math.random() * 4);
                    let check = moveDir;
                    while(this.cell.neighbors[moveDir] == null ||
                            this.cell.neighbors[moveDir].isOccupied) {
                        moveDir = (moveDir + 1) % 4;
                        if (check == moveDir) break;
                    }
                    if (this.cell.neighbors[moveDir] != null &&
                        !this.cell.neighbors[moveDir].isOccupied) {
                        this.nextCell = this.cell.neighbors[moveDir];
                        this.nextCell.isOccupied = true;
                        this.reserveEnergy += this.calculateEnergyProduction() - this.calculateEnergyConsumption(state);
                        break;
                    } else {
                        this.reserveEnergy += this.calculateEnergyProduction() - this.calculateEnergyConsumption(0);
                        break;
                    }
                } else {
                    this.reserveEnergy += this.calculateEnergyProduction() - this.calculateEnergyConsumption(0);
                    break;
                }
            case 2:
                if (this.canSplit()) {
                    let check = Math.floor(Math.random() * 4);
                    let checkLoop = check;
                    while (this.cell.neighbors[check] == null ||
                            this.cell.neighbors[check].isOccupied) {
                        check = (check + 1) % 4;
                        if (check == checkLoop) break;
                    }
                    let cellToFill = this.cell.neighbors[check];
                    if (cellToFill != null && cellToFill.isOccupied == false) {
                        cellToFill.isOccupied = true;
                        let bacterium = new Bacteria(cell_size, this.cell);
                        bacterium.isChild = true;
                        bacterium.nextCell = cellToFill;
                        bacterium.energyType = this.energyType;
                        bacterium.randFactor = this.randFactor;
                        bacterium.color = parseColor(this.color);
                        if (Math.random() <= 0.55) {
                            if (Math.random() >= 0.5) {
                                bacterium.randFactor += Math.random() * 0.05;
                                bacterium.color = incrementColor(bacterium.color, 2);
                            } else {
                                bacterium.randFactor -= Math.random() * 0.05;
                                bacterium.color = incrementColor(bacterium.color, 1);
                            }
                        }
                        this.reserveEnergy += (this.calculateEnergyProduction() - this.calculateEnergyConsumption(state)) / 2;
                        bacterium.reserveEnergy = this.reserveEnergy;
                        return bacterium;
                    } else {
                        this.reserveEnergy += this.calculateEnergyProduction() - this.calculateEnergyConsumption(0);
                        break;
                    }
                } else {
                    this.reserveEnergy += this.calculateEnergyProduction() - this.calculateEnergyConsumption(0);
                    break;
                }
            default:
                console.log("Something's wrong");
                break;
        }
        if (this.reserveEnergy < 0) this.isDead = true;
        return null;
    }

    /**
     * Carbon Types: 0 --> autotrophic
     *               1 --> heterotrophic
     *               2 --> mixotrophic
     * 
     * Energy Types: 0 --> phototrophic
     *               1 --> chemotrophic
     */
    setResourcesNeeded() {
        switch(this.energyType) {
            case 0: // phototrophic
                this.resourcesNeeded.push(this.randFactor * 25);
                this.resourcesNeeded.push(0);
                this.lightEfficiency = this.randFactor * 0.5;
                return;
            case 1: // chemotrophic
                this.resourcesNeeded.push(this.randFactor * 35);
                this.resourcesNeeded.push(0);
                return;
        }
    }

    /**
     * Calculates the amount of energy produced given the number of resources consumed
     */
    calculateEnergyProduction() {
        this.consumeResources();
        switch(this.energyType) {
            case 0: // phototrophic
                let energyFactor = (this.lightEfficiency * this.randFactor) + this.randFactor;
                return this.energyProduction * (this.resourcesNeeded[1] / this.resourcesNeeded[0]) * energyFactor; 
            case 1: // chemotrophic
                return this.energyProduction * (this.resourcesNeeded[1] / this.resourcesNeeded[0])
        }
    }

    /**
     * Calculates the amount of energy 
     * @param state : represents the state that the cell is in (this aids in
     *                  calculating the amount of energy consumed) 
     */
    calculateEnergyConsumption(state) {
        switch(state) {
            case 0: // Idle
                return this.baseMetabolicRate;
            case 1: // Move to a new cell
                return this.baseMetabolicRate + this.movementEnergy;
            case 2: // Cell mitosis
                return this.baseMetabolicRate + this.mitosisEnergy;
            default:
                return;
        }
    }

    /**
     * Calculates how many of the resources on the current cell are consumed
     */
    consumeResources() {
        if (this.resourcesNeeded[0] > this.cell.resources) {
            this.resourcesNeeded[1] = this.cell.resources;
            this.cell.resources = 0;
        } else {
            this.resourcesNeeded[1] = this.resourcesNeeded[0];
            this.cell.resources -= this.resourcesNeeded[0];
        }
    }

    /**
     * Checks whether or not the cell has the requisite amount of materials for
     *  cell movement.
     */
    canMove() {
        return this.reserveEnergy >= this.movementEnergy;
    }

    /**
     * Checks whether or not the cell has the requisite amount of resources for
     *  cell mitosis
     */
    canSplit() {
        return this.reserveEnergy >= this.mitosisEnergy;
    }

    // Handles the drawing of the bacterium
    drawBacterium() {
        // Handle dying animation
        if (this.isDead && this.size > 1) this.size -= this.size / 10;
        else if (this.size <= 1) {
            this.size = 0;
            return;
        }

        // Handle movement to a new cell
        if (this.nextCell != null) {
            if (!this.isChild) this.cell.isOccupied = false;
            else this.isChild = false;
            this.cell = this.nextCell;
            this.nextCell = null;
        }
        if (this.x * cell_size != this.cell.x * cell_size || this.y * cell_size != this.cell.y * cell_size) {
            if (Math.abs(this.x * cell_size - this.cell.x * cell_size) <= 1 &&
                Math.abs(this.x * cell_size - this.cell.y * cell_size) <= 1) {
                this.x = this.cell.x;
                this.y = this.cell.y;
            } else {
                this.x += (this.cell.x - this.x) / 10;
                this.y += (this.cell.y - this.y) / 10;
            }
        }

        this.graphic.clear();
        this.graphic.beginFill(parseColor(this.color));
        if (this.rounded >= (Math.floor(this.size / 3 + 1) / 2)) {
            this.graphic.drawRoundedRect(this.x * cell_size + (cell_size - this.size) / 2,
                this.y * cell_size + (cell_size - this.size) / 2, this.size, this.size, 
                this.size - this.rounded);
        } else {
            this.graphic.drawRoundedRect(this.x * cell_size + (cell_size - this.size) / 2,
                this.y * cell_size + (cell_size - this.size) / 2, this.size, this.size,
                this.rounded + (2 * this.size) / 3);
        }
        this.rounded = (this.rounded + this.move) % Math.floor(this.size / 3 + 1);
        this.graphic.endFill();
    }

    /**
     * Responsible for setting the interactive clicking option for a bacterium via PIXI Graphics
     */
    // setInteractive() {
    //     this.graphic.hitArea = new PIXI.Rectangle(this.x * cell_size - 2, this.y * cell_size - 2,
    //                                     );
    // }
}