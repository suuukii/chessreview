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

  pawnMove(
    initialPosition : Position,
    desiredPosition : Position,
    team: TeamType,
    boardState: Piece[],
  ): boolean{
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
      return false;
  }

  bishopMove(
    initialPosition : Position,
    desiredPosition : Position,
    team: TeamType,
    boardState: Piece[],
  ):boolean{
    //Movment and attack logic
      for(let i: number = 1; i < 8; i++){
        //top right
        if (desiredPosition.x > initialPosition.x && desiredPosition.y > initialPosition.y){
          const passedPosition : Position = {x: initialPosition.x + i, y: initialPosition.y + i};
          if (isSamePosition(passedPosition, desiredPosition)){
            if (this.isTileEmptyOrOccupiedByOpponent(passedPosition, boardState, team)){
              return true;
            }
          } else {
            if(this.isTileOccupied(passedPosition,boardState)){
              break;
            }
          }
        }

        //top left
        if (desiredPosition.x < initialPosition.x && desiredPosition.y > initialPosition.y){
          const passedPosition : Position = {x: initialPosition.x - i, y: initialPosition.y + i};
          if (isSamePosition(passedPosition, desiredPosition)){
            if (this.isTileEmptyOrOccupiedByOpponent(passedPosition, boardState, team)){
              return true;
            }
          } else {
            if(this.isTileOccupied(passedPosition,boardState)){
              break;
            }
          }
        }

        //botom right
        if(desiredPosition.x > initialPosition.x && desiredPosition.y < initialPosition.y){
          const passedPosition : Position = {x: initialPosition.x + i, y: initialPosition.y - i};
          if (isSamePosition(passedPosition, desiredPosition)){
            if (this.isTileEmptyOrOccupiedByOpponent(passedPosition, boardState, team)){
              return true;
            }
          } else {
            if(this.isTileOccupied(passedPosition,boardState)){
              break;
            }
          }
        }

         //bottom left
        if(desiredPosition.x < initialPosition.x && desiredPosition.y < initialPosition.y){
          const passedPosition : Position = {x: initialPosition.x - i, y: initialPosition.y - i};
          if (isSamePosition(passedPosition, desiredPosition)){
            if (this.isTileEmptyOrOccupiedByOpponent(passedPosition, boardState, team)){
              return true;
            }
          } else {
            if(this.isTileOccupied(passedPosition,boardState)){
              break;
            }
          }
        }
      }
      return false;
  }

  knightMove(
    initialPosition : Position,
    desiredPosition : Position,
    team: TeamType,
    boardState: Piece[],
  ):boolean{
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
      return false;
  }

  rookMove(
    initialPosition : Position,
    desiredPosition : Position,
    team: TeamType,
    boardState: Piece[],
  ):boolean{
    //Move vertical
      if(initialPosition.x === desiredPosition.x){
        for(let i = 1; i < 8; i++){
          const multiplier = (desiredPosition.y < initialPosition.y)? -1 : 1;
          const passedPosition: Position = {x:initialPosition.x, y: initialPosition.y + (i*multiplier)}
          if(isSamePosition(passedPosition, desiredPosition)){
            if(this.isTileEmptyOrOccupiedByOpponent(passedPosition,boardState,team)){
              return true;
            }
          } else {
            if(this.isTileOccupied(passedPosition,boardState)){
              break;
            }
          }
        }
      }

      //Move horizontal
      if(initialPosition.y === desiredPosition.y){
        for(let i = 1; i < 8; i++){
          const multiplier = (desiredPosition.x < initialPosition.x)? -1 : 1;
          const passedPosition: Position = {x:initialPosition.x + (i*multiplier), y: initialPosition.y}
          if(isSamePosition(passedPosition, desiredPosition)){
            if(this.isTileEmptyOrOccupiedByOpponent(passedPosition,boardState,team)){
              return true;
            }
          } else {
            if(this.isTileOccupied(passedPosition, boardState)){
              break;
            }
          }
        }
      }
      return false;
  }
    queenMove(
    initialPosition : Position,
    desiredPosition : Position,
    team: TeamType,
    boardState: Piece[],
  ):boolean{
    return false;
  }

    kingMove(
    initialPosition : Position,
    desiredPosition : Position,
    team: TeamType,
    boardState: Piece[],
  ):boolean{
    return false;
  }

  

  isValidMove(
    initialPosition : Position,
    desiredPosition : Position,
    type: PieceType,
    team: TeamType,
    boardState: Piece[],
  ): boolean {

    let validMove = false;

    switch(type){
      case PieceType.PAWN:
        validMove = this.pawnMove(initialPosition,desiredPosition,team,boardState);
        break;
      case PieceType.BISHOP:
        validMove = this.bishopMove(initialPosition,desiredPosition,team,boardState);
        break;
      case PieceType.KNIGHT:
        validMove = this.knightMove(initialPosition,desiredPosition,team,boardState);
        break;
      case PieceType.ROOK:
        validMove = this.rookMove(initialPosition,desiredPosition,team,boardState);
        break;
      case PieceType.QUEEN:
        validMove = this.queenMove(initialPosition,desiredPosition,team,boardState);
        break;
      case PieceType.KING:
        validMove = this.kingMove(initialPosition,desiredPosition,team,boardState);
    }
    return validMove;
  }
}
