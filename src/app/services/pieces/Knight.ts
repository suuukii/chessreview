import { Position, TeamType, Piece, PieceType } from "../Constants"
import { isTileEmptyOrOccupiedByOpponent } from "../Rules"
import { kingMove } from "./King";

export function  knightMove(
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
              if(isTileEmptyOrOccupiedByOpponent(desiredPosition,boardState,team)){
                return true;
              }
            }
          }
          
          if(desiredPosition.x - initialPosition.x === 2*i){
            if (desiredPosition.y - initialPosition.y === j){
              if(isTileEmptyOrOccupiedByOpponent(desiredPosition,boardState,team)){
                return true;
              }
            }
          }
        }
      }
      return false;
  }

  export function getPossibleKnightMoves(knight: Piece, boardState: Piece[]): Position[] {
    const possibleMoves: Position[] = [];
    for (let i:number = -1; i < 2 ; i += 2){
        for (let j:number = -1; j < 2 ; j += 2){
          const verticalMove: Position = {x:knight.position.x + j, y: knight.position.y + i * 2};
          const horizontalMove: Position = {x: knight.position.x + i * 2, y:knight.position.y + j};

          if(isTileEmptyOrOccupiedByOpponent(verticalMove,boardState,knight.team)){
            possibleMoves.push(verticalMove);
          }

          if(isTileEmptyOrOccupiedByOpponent(horizontalMove, boardState, knight.team)){
            possibleMoves.push(horizontalMove)
          }
        }
      }
    
    return possibleMoves;
  }