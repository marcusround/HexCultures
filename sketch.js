"use strict";
const version = 2334;

const hexRadius = 10;
const hexMargin = 0;

const oceanPercentage = 0.44;
const oceanMargin = {x: 0.1, y: 0.2};

let hexHeight, hexWidth, columns, rows;
let hexagons = [];

const alpha = "0123456789ABCDEF";

function setup() {
    print(version);
	hexWidth = hexRadius * 2;
	hexHeight = Math.sqrt(3)*hexRadius;
	columns = Math.ceil(window.innerWidth / (hexRadius * 3));
	rows = Math.ceil(window.innerHeight / (hexHeight / 2)) + 1;
	
	createCanvas((columns + 1/4) * (hexRadius * 3), (rows + 1) * (hexHeight / 2));
	fill(255, 100);
	stroke(255);
	strokeWeight(5);
	noStroke();
	noiseDetail(8);
	for (let x = 0; x < columns; x++) {
      hexagons.push([]);
      for (let y = 0; y < rows; y++) {
        let genes = [];
        for (let i = 0; i < 6; i++) {
            genes[i] = alpha[ Math.floor ( random() * alpha.length) ];
        }
        hexagons[x].push(new Hex(x, y, genes));
      }
	}
	// neighbouring needs to be done after they're all initialised
	for (let x = 0; x < columns; x++) {
		for (let y = 0; y < rows; y++) {
		  hexagons[x][y].initialiseNeighbours(x, y);
		}
	}
}

function draw() {
  background(45, 67, 185);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      let hex = hexagons[x][y];
      hex.draw();
      hex.checkActive();
    }
  }
  update();
}

function update() {
	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < columns; x++) {
			let hex = hexagons[x][y];
			hex.updateActive();
		}
	}
}

class Hex {
	constructor(x, y, genes) {
      
		// establish grid position
		this.pos = createVector(x, y);
		
		// establish pixel position
		this.pixelPos = createVector(0, 0);
		this.pixelPos.x = hexWidth * (1.5 * x + 0.5 + y % 2 * 0.75);
		this.pixelPos.y = hexHeight * (y * 0.5 + 0.5);
		
		// establish terrain
		this.land = true;

		const baseNoise = noise( x * 0.30, y * 0.06 );
		
		const relativeX = x / columns;
		const relativeY = y / rows;

		let marginModifierX = 1.0;
		let marginModifierY = 1.0;

		if ( relativeX > ( 1 - oceanMargin.x ) ) {
			marginModifierX = ( 1 - relativeX ) / oceanMargin.x;
		} else if ( relativeX < oceanMargin.x ) {
			marginModifierX = relativeX / oceanMargin.x;
		}

		if ( relativeY > ( 1 - oceanMargin.y ) ) {
			marginModifierY = ( 1 - relativeY ) / oceanMargin.y;
		} else if ( relativeY < oceanMargin.y ) {
			marginModifierY = relativeY / oceanMargin.y;
		}

		if (baseNoise * marginModifierX * marginModifierY < oceanPercentage) {
			this.land = false;
		}

		// establish state
		this.genes = genes;
		this.nextGenes = genes;
		
		// establish neighbours
		this.neighbours = [];
    }
	
	initialiseNeighbours(x, y) {
		let n = [false, false, false, false, false, false];

		if (this.land == true) {
			const odd = y%2;
			
			// above
			if (y >= 2) {
				n[0] = hexagons[x][y-2];
			}
			
			// top right
			if (y >= 1) {
				if (!odd || x < columns-1) {
					n[1] = hexagons[x+odd][y-1];
				}
			}
			
			// bottom right
			if (y < rows-1) {
				if (!odd || x < columns-1) {
					n[2] = hexagons[x+odd][y+1];
				}
			}
			
			// bottom
			if (y < rows-2) {
				n[3] = hexagons[x][y+2];
			}
			
			// bottom left
			if (y < rows-1) {
				if (odd || x >= 1) {
					n[4] = hexagons[x-1+odd][y+1];
				}
			}
			
			// top left
			if (y >= 1) {
				if (odd || x >= 1) {
					n[5] = hexagons[x-1+odd][y-1];
				}
			}
		}

		this.neighbours = n;
	}
	
	updateActive() {
      this.genes = this.nextGenes;
    }
  
    checkActive() {
      if ( this.land ) {
        this.nextGenes = this.genes;
        
        // For each element of the hex string,
        for ( let i = 0; i < 6; i++){

          let nextGeneSelection = [];
          // there is a 50% chance of picking a replacement from a randomly selected neighbour.
          // we create an array of all neighbours' corresponding gene and pick from it randomly.
          if (Math.random() < 0.5){
            for ( let j = 0; j < 6; j++ ){
              if ( this.neighbours[j].land == true) {
                  nextGeneSelection.push(this.neighbours[j].genes[i]);
              }
            }
            let nextGene = nextGeneSelection[Math.floor(Math.random() * nextGeneSelection.length)];
            this.nextGenes[i] = nextGene;
          }
        }
      }
    }

	checkNeighbours() {
		return true;
	}
	
	draw() {
		if (this.land) {
			if (this.genes) {
			  let geneString = "#";
			  for (let i = 0; i < 6; i++){
			    geneString += this.genes[i];
			  }
			  fill (geneString);
			} else {
			  fill(25, 155, 67);
			}
			push();
			translate(this.pixelPos.x, this.pixelPos.y);
			beginShape();

			for (let i = 0; i < 6; i++) {
				vertex((hexRadius-hexMargin/2)*cos(i*Math.PI/3), (hexRadius-hexMargin/2)*sin(i*Math.PI/3));
			}

			endShape(CLOSE);
			pop();
		}
	}
}

