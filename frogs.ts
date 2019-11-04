let mutationRate = 0.15;
let chanceOfBird = .15;
let chanceOfFly = .15;
let flySatisfaction = .2;
let hungerSpeed = .015;
let rouletteWheelSize = 1000;
let recordedBestSize = 10;
let initPopulation = 400;
let padLength = 701;
let currentGeneration = 1;
let frogs = [];
let deadFrogs = [];
let bestFrogs = [];
let lilyPads = [];
let currentFrogId = 0;
enum PadSide {left, right}

class Frog {
    id: number;
    initDesireToMove: number;
    motivatedByHunger: number;
    motivatedByFood: number;
    motivatedByDeath: number;
    hungerLevel: number;
    padSide: PadSide;
    padNumber: number;
    causeOfCompletion: string;

    constructor(id) {
        this.id = id;
        this.padNumber = 0;
        this.padSide = 0;
    }

    setGenesFromScratch() {
        this.initDesireToMove = Math.random();
        this.hungerLevel = 1;
        this.motivatedByHunger = Math.random();
        this.motivatedByFood = Math.random();
        this.motivatedByDeath = Math.random();
    }
    setGenesFromParent(mother:Frog, father:Frog) {
        let rouletteWheel = [];
        for (let i = 0; i <= mutationRate * rouletteWheelSize; i++) {
            let randFrog = new Frog(-1);
            randFrog.setGenesFromScratch();
            rouletteWheel.push(randFrog);
        }
        for (let i = 0; i <= (1 - mutationRate) * rouletteWheelSize; i++) {
            if (i % 2 == 0)
                rouletteWheel.push(mother);
            else
                rouletteWheel.push(father);
        }
        this.initDesireToMove = rouletteWheel[(Math.floor(Math.random() * 100000000)) % rouletteWheelSize].initDesireToMove;
        this.hungerLevel = 1;
        this.motivatedByHunger = rouletteWheel[(Math.floor(Math.random() * 100000000)) % rouletteWheelSize].motivatedByHunger;
        this.motivatedByFood = rouletteWheel[(Math.floor(Math.random() * 100000000)) % rouletteWheelSize].motivatedByFood;
        this.motivatedByDeath = rouletteWheel[(Math.floor(Math.random() * 100000000)) % rouletteWheelSize].motivatedByDeath;
    }
}

class LilyPad {
    padSide: PadSide;
    padNumber: number;
    hasBird: boolean;
    hasFly: boolean;
    hasDeadFrog: boolean;

    constructor(pSide, pNumber){
        this.padSide = pSide;
        this.padNumber = pNumber;
    }

    setHasBird(bool:boolean) {
        this.hasBird = bool;
    }

    setHasFly(bool:boolean) {
        this.hasFly = bool;
    }
}

function initializeCourse() {
    lilyPads = [];
    for (let i = 0; i < padLength; i++) {
        let padLeft = new LilyPad(0,i);
        let padRight = new LilyPad(1,i);
        if (Math.random() < chanceOfBird && i != 0 && i != 1) {
            if(Math.random() > .5) {
                padRight.setHasBird(true);
            }
            else
                padLeft.setHasBird(true);
        }
        if (Math.random() < chanceOfFly && i != 0 && i != 1) {
            if(Math.random() > .5) {
                padRight.setHasFly(true);
            }
            else
                padLeft.setHasFly(true);
        }
        lilyPads.push([padLeft, padRight]);
    }
}

function initializePopulation() {
    for (currentFrogId; currentFrogId < initPopulation; currentFrogId++) {
        let frog = new Frog(currentFrogId);
        frog.setGenesFromScratch();
        frogs.push(frog);
    }
}

function runSimulation() {
    while (frogs.length > 0) {
        for (let i = 0; i < frogs.length; i++) {
            let frogsPrePos = frogs[i].padNumber;
            if (frogs[i] !== undefined) {
                frogs[i].hungerLevel -= hungerSpeed;
                switch (determineMovement(frogs[i], lilyPads[frogs[i].padNumber + 1][0], lilyPads[frogs[i].padNumber + 1][1])) {
                    case 0:
                        break;
                    case 1:
                        frogs[i].padNumber += 1;
                        frogs[i].padSide = 0;
                        break;
                    case 2:
                        frogs[i].padNumber += 1;
                        frogs[i].padSide = 1;
                        break;
                }
                if (frogs[i].padNumber >= padLength - 1) {
                    frogs[i].causeOfCompletion = "Victory!";
                    if (bestFrogs.length < recordedBestSize) {
                        bestFrogs.push(frogs[i]);
                    }
                    frogs.splice(i,1);
                    i--;
                    break;
                }
                if (frogs[i].hungerLevel <= 0) {
                    frogs[i].causeOfCompletion = "Death by starvation";
                    lilyPads[frogs[i].padNumber][frogs[i].padSide].hasDeadFrog = true;
                    deadFrogs.push(frogs[i]);
                    frogs.splice(i,1);
                    i--;
                    break;
                }
                if (lilyPads[frogs[i].padNumber][frogs[i].padSide].hasBird) {
                    frogs[i].causeOfCompletion = "Death by bird";
                    lilyPads[frogs[i].padNumber][frogs[i].padSide].hasDeadFrog = true;
                    deadFrogs.push(frogs[i]);
                    frogs.splice(i,1);
                    i--;
                    break;
                }
                if (lilyPads[frogs[i].padNumber][frogs[i].padSide].hasFly) {
                    if (frogsPrePos != frogs[i].padNumber) {
                        frogs[i].hungerLevel += flySatisfaction;
                        if (frogs[i].hungerLevel > 1) {
                            frogs[i].hungerLevel = 1;
                        }
                    }
                    break;
                }
            }
        }
    }
}

function select() {
    this.deadFrogs = sortBest(deadFrogs);
    for (let i = bestFrogs.length; i < recordedBestSize; i++) {
        bestFrogs.push(deadFrogs[i])
    }
    let bestFrogsTemp = bestFrogs;
    bestFrogs = [];
    for (let i = 0; i < bestFrogsTemp.length; i++) {
        console.log(bestFrogsTemp[i]);
        for (let j = 0; j < initPopulation / recordedBestSize; j++) {
            bestFrogs.push(bestFrogsTemp[i]);
        }
    }
    this.deadFrogs = [];
}

function sortBest(frogList) {
    return frogList.sort((a, b) => (a.padNumber < b.padNumber) ? 1 : -1);
}

function getBest() {
    return bestFrogs[0];
}

function initializeNextGen() {
    currentGeneration += 1;
    for (let i = 0; i  < initPopulation; i++) {
        let frog = new Frog(currentFrogId);
        frog.setGenesFromParent(bestFrogs[(Math.floor(Math.random() * 100000000)) % initPopulation], bestFrogs[(Math.floor(Math.random() * 100000000)) % initPopulation]);
        frogs.push(frog);
        currentFrogId++;
    }
    bestFrogs = [];
}

function clearCourse() {
    for (let i = 0; i < lilyPads.length; i++) {
        lilyPads[i][0].hasDeadFrog = false;
        lilyPads[i][1].hasDeadFrog = false;
    }
}

function determineMovement(frog:Frog, leftPad:LilyPad, rightPad:LilyPad) {
    let totalDesireToMoveLeft = frog.initDesireToMove + (1 - frog.hungerLevel) * frog.motivatedByHunger;
    let totalDesireToMoveRight = frog.initDesireToMove + (1 - frog.hungerLevel) * frog.motivatedByHunger;
    let desireToStayStill = .5;

    if(leftPad.hasFly) {
        totalDesireToMoveLeft += frog.motivatedByFood;
    }
    else totalDesireToMoveLeft += .5;

    if (leftPad.hasDeadFrog) {
        totalDesireToMoveLeft += frog.motivatedByDeath;
    }
    else totalDesireToMoveLeft += .5;

    if(rightPad.hasFly) {
        totalDesireToMoveRight += frog.motivatedByFood;
    }
    else totalDesireToMoveRight += .5;

    if (rightPad.hasDeadFrog) {
        totalDesireToMoveRight += frog.motivatedByDeath;
    }
    else totalDesireToMoveRight += .5;

    if (desireToStayStill >= totalDesireToMoveRight / 4 && desireToStayStill >= totalDesireToMoveLeft / 4){
       return 0;
    }
    if (totalDesireToMoveLeft > totalDesireToMoveRight) {
        return 1;
    }
    if (totalDesireToMoveLeft == totalDesireToMoveRight) {
        return Math.random() > .5 ? 1 : 2;
    }
    return 2;
}

function runFirstGen() {
    initializePopulation();
    initializeCourse();
    runSimulation();
    select();
    clearCourse();
    updateElements();
}

function runSubsequentGens() {
    initializeNextGen();
    initializeCourse();
    runSimulation();
    select();
    clearCourse();
    updateElements();
}

function updateElements() {
    document.getElementById("bfId").innerHTML = "Frog ID: " + getBest().id;
    document.getElementById("bfPN").innerHTML = "Lily Pad Reached: " + getBest().padNumber;
    document.getElementById("bfND").innerHTML = "Innate Desire Keep Moving: " + getBest().initDesireToMove.toFixed(2);
    document.getElementById("bfHM").innerHTML = "Motivation From Hunger: " + getBest().motivatedByHunger.toFixed(2);
    document.getElementById("bfFM").innerHTML = "Motivation From Food: " + getBest().motivatedByFood.toFixed(2);
    document.getElementById("bfDM").innerHTML = "Motivation From Unfortunate Frogs: " + getBest().motivatedByDeath.toFixed(2);
    document.getElementById("bfCD").innerHTML = "Reason He's Not Still Going: " + getBest().causeOfCompletion;
    document.getElementById("currentGeneration").innerHTML = "generation: " + currentGeneration;
}