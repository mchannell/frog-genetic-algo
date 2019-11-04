var mutationRate = 0.1;
var chanceOfBird = .65;
var chanceOfFly = .35;
var flySatisfaction = .2;
var hungerSpeed = .04;
var rouletteWheelSize = 20;
var recordedBestSize = 5;
var initPopulation = 20;
var padLength = 251;
var currentGeneration = 1;
var frogs = [];
var deadFrogs = [];
var bestFrogs = [];
var lilyPads = [];
var currentFrogId = 0;
var PadSide;
(function (PadSide) {
    PadSide[PadSide["left"] = 0] = "left";
    PadSide[PadSide["right"] = 1] = "right";
})(PadSide || (PadSide = {}));
var Frog = /** @class */ (function () {
    function Frog(id) {
        this.id = id;
        this.padNumber = 0;
        this.padSide = 0;
    }
    Frog.prototype.setGenesFromScratch = function () {
        this.initDesireToMove = Math.random();
        this.hungerLevel = Math.random();
        this.motivatedByHunger = Math.random();
        this.motivatedByFood = Math.random();
        this.motivatedByDeath = Math.random();
    };
    Frog.prototype.setGenesFromParent = function (mother, father) {
        var rouletteWheel = [];
        for (var i = 0; i <= mutationRate * rouletteWheelSize; i++) {
            var randFrog = new Frog(-1);
            randFrog.setGenesFromScratch();
            rouletteWheel.push(randFrog);
        }
        for (var i = 0; i <= (1 - mutationRate) * rouletteWheelSize; i++) {
            if (i % 2 == 0)
                rouletteWheel.push(mother);
            else
                rouletteWheel.push(father);
        }
        this.initDesireToMove = rouletteWheel[(Math.floor(Math.random() * 100000000)) % rouletteWheelSize].initDesireToMove;
        this.hungerLevel = rouletteWheel[(Math.floor(Math.random() * 100000000)) % rouletteWheelSize].hungerLevel;
        this.motivatedByHunger = rouletteWheel[(Math.floor(Math.random() * 100000000)) % rouletteWheelSize].motivatedByHunger;
        this.motivatedByFood = rouletteWheel[(Math.floor(Math.random() * 100000000)) % rouletteWheelSize].motivatedByFood;
        this.motivatedByDeath = rouletteWheel[(Math.floor(Math.random() * 100000000)) % rouletteWheelSize].motivatedByDeath;
    };
    return Frog;
}());
var LilyPad = /** @class */ (function () {
    function LilyPad(pSide, pNumber) {
        this.padSide = pSide;
        this.padNumber = pNumber;
    }
    LilyPad.prototype.setHasBird = function (bool) {
        this.hasBird = bool;
    };
    LilyPad.prototype.setHasFly = function (bool) {
        this.hasFly = bool;
    };
    return LilyPad;
}());
function initializeCourse() {
    lilyPads = [];
    for (var i = 0; i < padLength; i++) {
        var padLeft = new LilyPad(0, i);
        var padRight = new LilyPad(1, i);
        if (Math.random() < chanceOfBird) {
            if (Math.random() > .5) {
                padRight.setHasBird(true);
            }
            else
                padLeft.setHasBird(true);
        }
        if (Math.random() < chanceOfFly) {
            if (Math.random() > .5) {
                padRight.setHasFly(true);
            }
            else
                padLeft.setHasFly(true);
        }
        lilyPads.push([padLeft, padRight]);
        console.log(lilyPads);
    }
}
function initializePopulation() {
    for (currentFrogId; currentFrogId < initPopulation; currentFrogId++) {
        var frog = new Frog(currentFrogId);
        frog.setGenesFromScratch();
        frogs.push(frog);
    }
}
function runSimulation() {
    while (frogs.length > 0) {
        for (var i = 0; i < frogs.length; i++) {
            var frogsPrePos = frogs[i].padNumber;
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
                    frogs.splice(i, 1);
                    i--;
                    break;
                }
                if (frogs[i].hungerLevel <= 0) {
                    frogs[i].causeOfCompletion = "Death by starvation";
                    lilyPads[frogs[i].padNumber][frogs[i].padSide].hasDeadFrog = true;
                    deadFrogs.push(frogs[i]);
                    frogs.splice(i, 1);
                    i--;
                    break;
                }
                if (lilyPads[frogs[i].padNumber][frogs[i].padSide].hasBird) {
                    frogs[i].causeOfCompletion = "Death by bird";
                    lilyPads[frogs[i].padNumber][frogs[i].padSide].hasDeadFrog = true;
                    deadFrogs.push(frogs[i]);
                    frogs.splice(i, 1);
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
    for (var i = bestFrogs.length; i < recordedBestSize; i++) {
        bestFrogs.push(deadFrogs[i]);
    }
    var bestFrogsTemp = bestFrogs;
    bestFrogs = [];
    for (var i = 0; i < bestFrogsTemp.length; i++) {
        for (var j = 0; j < initPopulation / recordedBestSize; j++) {
            bestFrogs.push(bestFrogsTemp[i]);
        }
    }
    this.deadFrogs = [];
}
function sortBest(frogList) {
    return frogList.sort(function (a, b) { return (a.padNumber < b.padNumber) ? 1 : -1; });
}
function getBest() {
    return bestFrogs[0];
}
function initializeNextGen() {
    currentGeneration += 1;
    for (var i = 0; i < initPopulation; i++) {
        var frog = new Frog(currentFrogId);
        frog.setGenesFromParent(bestFrogs[(Math.floor(Math.random() * 100000000)) % initPopulation], bestFrogs[(Math.floor(Math.random() * 100000000)) % initPopulation]);
        frogs.push(frog);
        currentFrogId++;
    }
    bestFrogs = [];
}
function clearCourse() {
    for (var i = 0; i < lilyPads.length; i++) {
        lilyPads[i][0].hasDeadFrog = false;
        lilyPads[i][1].hasDeadFrog = false;
    }
}
function determineMovement(frog, leftPad, rightPad) {
    var totalDesireToMoveLeft = frog.initDesireToMove + (1 - frog.hungerLevel) * frog.motivatedByHunger;
    var totalDesireToMoveRight = frog.initDesireToMove + (1 - frog.hungerLevel) * frog.motivatedByHunger;
    var desireToStayStill = .5;
    if (leftPad.hasFly) {
        totalDesireToMoveLeft += frog.motivatedByFood;
    }
    else
        totalDesireToMoveLeft += .5;
    if (leftPad.hasBird) {
        totalDesireToMoveLeft += frog.motivatedByDeath;
    }
    else
        totalDesireToMoveLeft += .5;
    if (rightPad.hasFly) {
        totalDesireToMoveRight += frog.motivatedByFood;
    }
    else
        totalDesireToMoveRight += .5;
    if (rightPad.hasBird) {
        totalDesireToMoveRight += frog.motivatedByDeath;
    }
    else
        totalDesireToMoveRight += .5;
    if (desireToStayStill >= totalDesireToMoveRight / 4 && desireToStayStill >= totalDesireToMoveLeft / 4) {
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
