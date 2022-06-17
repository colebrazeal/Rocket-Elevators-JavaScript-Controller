    let elevatorID = 1
    let floorRequestButtonID = 1
    let callButtonID = 1

 //----------------------------COLUMN----------------------------//

class Column {
    constructor(_id, _amountOfFloors, _amountOfElevators) {
        this.ID = _id
        this.status = "0"    
        this.amountOfFloors = _amountOfFloors;
        this.amountOfElevators = _amountOfElevators;
        this.elevatorList = []   
        this.callButtonList = []
        
        this.createElevators(_amountOfFloors, _amountOfElevators);
        this.createCallButtons(_amountOfFloors);
    }

 //-----------Methods-----------//

    createCallButtons(_amountOfFloors) {
        let buttonFloor = 1;
        for (let i = 0; i < _amountOfFloors; i++) {
            if (buttonFloor < _amountOfFloors){
                let callUpButton = new CallButton(callButtonID, "off", buttonFloor, "up");
                this.callButtonList.push(callUpButton);
                callButtonID++;
            };
    
            if (buttonFloor > 1){
                let callDownButton = new CallButton(callButtonID, "off", buttonFloor, "down");
                this.callButtonList.push(callDownButton);
                callButtonID++;
            };
            buttonFloor++
        };
        
    };

    createElevators(_amountOfFloors, _amountOfElevators){

        for (let i = 0; i < _amountOfElevators; i++) {
            let elevator = new Elevator(elevatorID, _amountOfFloors);
            this.elevatorList.push(elevator);
            elevatorID++;
        };
    };
    
    //Simulate when a user press a button outside the elevator

    requestElevator(floor, direction){

       let elevator = this.findElevator(floor, direction)
    
        elevator.floorRequestList.push(floor);
        elevator.sortFloorList();
        elevator.move();
        elevator.operateDoors();
    
        return elevator
    };

    //We use a score system depending on the current elevators state. Since the bestScore and the referenceGap are 
    //higher values than what could be possibly calculated, the first elevator will always become the default bestElevator, 
    //before being compared with to other elevators. If two elevators get the same score, the nearest one is prioritized.

    findElevator(requestedFloor, requestedDirection){
        let bestElevatorInformations = {
            bestElevator: null,
            bestScore: 5,
            referenceGap: 10000000
        }

        this.elevatorList.forEach(elevator => {
            //The elevator is at my floor and going in the direction I want
            if (requestedFloor == elevator.currentFloor && elevator.status == "stopped" && requestedDirection == elevator.direction){
                bestElevatorInformations = this.checkIfElevatorIsBetter(1, elevator, bestElevatorInformations, requestedFloor)
                //The elevator is lower than me, is coming up and I want to go up
            } else if (requestedFloor > elevator.currentFloor && elevator.direction == "up" && requestedDirection == elevator.direction){
                bestElevatorInformations = this.checkIfElevatorIsBetter(2, elevator, bestElevatorInformations, requestedFloor)
                //The elevator is higher than me, is coming down and I want to go down
            } else if (requestedFloor < elevator.currentFloor && elevator.direction == "down" && requestedDirection == elevator.direction){
                bestElevatorInformations = this.checkIfElevatorIsBetter(2, elevator, bestElevatorInformations, requestedFloor)
                //The elevator is idle
            } else if (elevator.status == "idle"){
                bestElevatorInformations = this.checkIfElevatorIsBetter(3, elevator, bestElevatorInformations, requestedFloor)
                //The elevator is not available, but still could take the call if nothing better is found
            } else {
                bestElevatorInformations = this.checkIfElevatorIsBetter(4, elevator, bestElevatorInformations, requestedFloor)
            }
            
        })
        return bestElevatorInformations.bestElevator;
    };

    checkIfElevatorIsBetter(scoreToCheck, newElevator, bestElevatorInformations, floor){
        if (scoreToCheck < bestElevatorInformations.bestScore){
            bestElevatorInformations.bestScore = scoreToCheck;
            bestElevatorInformations.bestElevator = newElevator;
            bestElevatorInformations.referenceGap = Math.abs(newElevator.currentFloor - floor);
        } else if (bestElevatorInformations.bestScore == scoreToCheck){
            let gap = Math.abs(newElevator.currentFloor - floor);
            if (bestElevatorInformations.referenceGap > gap){
                bestElevatorInformations.bestScore = scoreToCheck;
                bestElevatorInformations.bestElevator = newElevator
                bestElevatorInformations.referenceGap = gap
            }
        }
        return bestElevatorInformations; 
    };
    
}
//----------------------------COLUMN----------------------------//

//----------------------------ELEVATOR----------------------------//

class Elevator {
    constructor(_id, _amountOfFloors) {
        this.ID = _id;
        this.status = "";
        this.amountOfFloors = _amountOfFloors
        this.currentfloor = 1;
        this.direction = null;
        this.door = new Door (_id, "closed");
        this.floorRequestButtonList = [];
        this.floorRequestList = [];

        this.createFloorRequestButton(_amountOfFloors);
    }

    createFloorRequestButton(_amountOfFloors){
        let buttonFloor = 1;
        for (let i = 0; i < _amountOfFloors; i++){
            let floorRequestButton = new FloorRequestButton(floorRequestButtonID, "off", buttonFloor)
            this.floorRequestButtonList.push(floorRequestButton);
            buttonFloor++;
            floorRequestButtonID++;
        }
           
    };

    //Simulate when a user press a button inside the elevator

    requestFloor(floor){
        this.floorRequestList.push(floor)
        this.sortFloorList();
        this.move();
        this.operateDoors();
    };

    move(){
        while(this.floorRequestList.length){
            let destination = this.floorRequestList[0];
            let screenDisplay = 0;
            this.status = "moving";
            if (this.currentFloor < destination){
                this.direction = "up";

                while (this.currentFloor < destination){
                this.currentFloor++;
                screenDisplay = this.currentFloor;
                }

            } else if (this.currentFloor > destination){
                    this.direction = "down";

                

                while (this.currentFloor > destination){
                    this.currentFloor--;
                    screenDisplay = this.currentFloor;
                }
            }
                this.status = "stopped"
                this.floorRequestList.shift();

            }
            this.status = "idle"
        }
       

    

    sortFloorList(){
        if (this.direction == "up"){
            this.floorRequestList.sort(function(a, b) { return a - b });
        } else {
             this.floorRequestList.sort(function (a, b) { return b - a}) 
        }

    }

    operateDoors(){
        let door = new Door();
        door.status = "opened";
    }
        
}

//----------------------------ELEVATOR----------------------------//

//---------------------CALL BUTTON---------------------//

class CallButton {
    constructor(_id, _floor, _direction, _status) {
        this.ID = _id
        this.floor = _floor
        this.direction = _direction
        this.status = _status
    }
}

//---------------------CALL BUTTON---------------------//

//---------------------FLOOR REQUEST BUTTON---------------------//

class FloorRequestButton {
    constructor(_id, _floor, _status) {
        this.ID = _id;
        this.floor = _floor;
        this.status = _status
    }
}

//---------------------FLOOR REQUEST BUTTON---------------------//

//---------------------DOOR---------------------//

class Door {
    constructor(_id, _status) {
        this.ID = _id
        this.status = _status
    }
}

//---------------------DOOR---------------------//

module.exports = { Column, Elevator, CallButton, FloorRequestButton, Door }