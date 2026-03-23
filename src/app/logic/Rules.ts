import { PieceType, TeamType, Piece, Position, isSamePosition } from "./Constants";

export default class Rules {
  isEnPassantMove(
    initialPosition : Position,
    desiredPosition : Position,
    boardState: Piece[],
    type: PieceType,
    team: TeamType,
  ): boolean {
    const pawnDirection = team === TeamType.OUR ? 1 : -1;

    if (type === PieceType.PAWN) {
      if ((desiredPosition.x - initialPosition.x === -1 || desiredPosition.x - initialPosition.x === 1) && desiredPosition.y - initialPosition.y === pawnDirection) {
        const piece = boardState.find(
          (p) =>
            p.position.x === desiredPosition.x &&
            p.position.y === desiredPosition.y - pawnDirection &&
            p.enPassant,
        );
        if (piece) {
          return true;
        }
      }
    }
    return false;
  }

  isTileOccupied(position : Position, boardState: Piece[]): boolean {
    const piece = boardState.find(
      (p) => isSamePosition(p.position, position)
    );
    if (piece) {
      return true;
    }
    return false;
  }

  isTileOccupiedByOpponent(
    position : Position,
    boardState: Piece[],
    team: TeamType,
  ): boolean {
    const piece = boardState.find(
      (p) => isSamePosition(p.position, position) && p.team !== team,
    );
    if (piece) {
      return true;
    }
    return false;
  }

  isTileEmptyOrOccupiedByOpponent(position: Position, boardState: Piece[], team: TeamType): boolean{
    return !this.isTileOccupied(position, boardState) || this.isTileOccupiedByOpponent(position, boardState, team)
  }

  isValidMove(
    initialPosition : Position,
    desiredPosition : Position,
    type: PieceType,
    team: TeamType,
    boardState: Piece[],
  ): boolean {
    // console.log("refree is checking the move...")
    // console.log(`Previous Location(${px},${py}) | Atempt position(${x},${y}) | PieceType(${type}) | TeamType(${team})`)

    //PAWN
    if (type === PieceType.PAWN) {
      const specialRow = team === TeamType.OUR ? 1 : 6;
      const pawnDirection = team === TeamType.OUR ? 1 : -1;
      
      //MOVMENT LOGIC
      if (initialPosition.x === desiredPosition.x && initialPosition.y === specialRow && desiredPosition.y - initialPosition.y === 2 * pawnDirection) {
        if (
          !this.isTileOccupied(desiredPosition, boardState) &&
          !this.isTileOccupied({x:desiredPosition.x, y: desiredPosition.y - pawnDirection}, boardState)
        ) {
          return true;
        }
      } else if (initialPosition.x === desiredPosition.x && desiredPosition.y - initialPosition.y === pawnDirection) {
        if (!this.isTileOccupied(desiredPosition, boardState)) {
          return true;
        }
      }

      //ATTACK LOGIC
      if (desiredPosition.x - initialPosition.x === -1 && desiredPosition.y - initialPosition.y === pawnDirection) {
        if (this.isTileOccupiedByOpponent(desiredPosition, boardState, team)) {
          return true;
        }
      } else if (desiredPosition.x - initialPosition.x === 1 && desiredPosition.y - initialPosition.y === pawnDirection) {
        if (this.isTileOccupiedByOpponent(desiredPosition, boardState, team)) {
          return true;
        }
      }
    }

    //BISHOP
    if (type === PieceType.BISHOP){
      //Movment and attack logic
      for(let i: number = 1; i < 8; i++){

        //top right
        if (desiredPosition.x > initialPosition.y && desiredPosition.y > initialPosition.y){
          const passedPosition : Position = {x: initialPosition.x + i, y: initialPosition.y + i};
          if(this.isTileOccupied(passedPosition,boardState)){
            if(this.isTileOccupiedByOpponent(passedPosition,boardState,team) && isSamePosition(desiredPosition,passedPosition)){
              return true;
            } else {
              break;
            }
          }
          if(isSamePosition(passedPosition, desiredPosition)){
            return true;
          }
        }

        //top left
        if (desiredPosition.x < initialPosition.x && desiredPosition.y > initialPosition.y){
          const passedPosition : Position = {x: initialPosition.x - i, y: initialPosition.y + i};
          if(this.isTileOccupied(passedPosition,boardState)){
            if(this.isTileOccupiedByOpponent(passedPosition,boardState,team) && isSamePosition(desiredPosition,passedPosition)){
              return true;
            } else {
              break;
            }
          }
          if (isSamePosition(passedPosition, desiredPosition)){
            return true;
          }
        }
  

        //botom right
        if(desiredPosition.x > initialPosition.x && desiredPosition.y < initialPosition.y){
          const passedPosition : Position = {x: initialPosition.x + i, y: initialPosition.y - i};
          if(this.isTileOccupied(passedPosition,boardState)){
            if(this.isTileOccupiedByOpponent(passedPosition,boardState,team) && isSamePosition(desiredPosition,passedPosition)){
              return true;
            } else {
              break;
            }
          }
          if (isSamePosition(passedPosition, desiredPosition)){
            return true;
          }
        }

         //bottom left
        if(desiredPosition.x < initialPosition.x && desiredPosition.y < initialPosition.y){
          const passedPosition : Position = {x: initialPosition.x - i, y: initialPosition.y - i};
          if(this.isTileOccupied(passedPosition,boardState)){
            if(this.isTileOccupiedByOpponent(passedPosition,boardState,team) && isSamePosition(desiredPosition,passedPosition)){
              return true;
            } else {
              break;
            }
          }
          if (isSamePosition(passedPosition, desiredPosition)){
            return true;
          }
        }
      }
    }

    //KNIGHT
    if(type === PieceType.KNIGHT){
      //MOVMENT AND ATTACK LOGIC
      for (let i:number = -1; i < 2 ; i += 2){
        for (let j:number = -1; j < 2 ; j += 2){
          if(desiredPosition.y - initialPosition.y === 2*i){
            if (desiredPosition.x - initialPosition.x === j){
              if(this.isTileEmptyOrOccupiedByOpponent(desiredPosition,boardState,team)){
                return true;
              }
            }
          }
          
          if(desiredPosition.x - initialPosition.x === 2*i){
            if (desiredPosition.y - initialPosition.y === j){
              if(this.isTileEmptyOrOccupiedByOpponent(desiredPosition,boardState,team)){
                return true;
              }
            }
          }
        }
      }
    }

    return false;
  }
}
