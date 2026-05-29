import { getPossibleBishopMoves } from "../services/pieces/BishopRules";
import {
  getCastlingMoves,
  getPossibleKingMoves,
} from "../services/pieces/KingRules";
import { getPossibleKnightMoves } from "../services/pieces/KnightRules";
import { getPossiblePawnMoves } from "../services/pieces/PawnRules";
import { getPossibleQueenMoves } from "../services/pieces/QueenRules";
import { getPossibleRookMoves } from "../services/pieces/RookRules";
import { MoveResult, PieceType, TeamType } from "../services/Types";
import { Move } from "./Move";
import { Pawn } from "./Pawn";
import { Piece } from "./Piece";
import { Position } from "./Position";
import { SimplifiedPiece } from "./SimplifiedPiece";

export class Chessboard {
  pieces: Piece[];
  totalTurns: number;
  winingTeam?: TeamType;
  draw: boolean;
  moves: Move[];
  boardHistory: {[key : string] : number};
  turnsWithNoCapturesOrPawnMoves : number;

  constructor(pieces: Piece[], totalTurns: number, moves: Move[], boardHistory: {[key : string] : number}, turnsWithNoCapturesOrPawnMoves : number) {
    this.pieces =                         pieces;
    this.totalTurns =                     totalTurns;
    this.draw =                           false;
    this.moves =                          moves;
    this.boardHistory =                   boardHistory;
    this.turnsWithNoCapturesOrPawnMoves = turnsWithNoCapturesOrPawnMoves;
  }

  get currentTeam(): TeamType {
    return this.totalTurns % 2 === 0 ? TeamType.OPPONENT : TeamType.OUR;
  }

  clone(): Chessboard {
    return new Chessboard(
      this.pieces.map((p) => p.clone()),
      this.totalTurns,
      this.moves.map(m => m.clone()),
      { ...this.boardHistory },
      this.turnsWithNoCapturesOrPawnMoves,
    );
  }

  toFen(): string {
    const pieceFen: Record<TeamType, Record<PieceType, string>> = {
      [TeamType.OUR]: {
        [PieceType.PAWN]: "P",
        [PieceType.KNIGHT]: "N",
        [PieceType.BISHOP]: "B",
        [PieceType.ROOK]: "R",
        [PieceType.QUEEN]: "Q",
        [PieceType.KING]: "K",
      },
      [TeamType.OPPONENT]: {
        [PieceType.PAWN]: "p",
        [PieceType.KNIGHT]: "n",
        [PieceType.BISHOP]: "b",
        [PieceType.ROOK]: "r",
        [PieceType.QUEEN]: "q",
        [PieceType.KING]: "k",
      },
    };

    const rows: string[] = [];
    for (let y = 7; y >= 0; y--) {
      let row = "";
      let empty = 0;
      for (let x = 0; x < 8; x++) {
        const piece = this.pieces.find((p) =>
          p.position.isSamePosition(new Position(x, y)),
        );

        if (!piece) {
          empty++;
          continue;
        }

        if (empty > 0) {
          row += empty;
          empty = 0;
        }
        row += pieceFen[piece.team][piece.type];
      }

      if (empty > 0) row += empty;
      rows.push(row);
    }

    return [
      rows.join("/"),
      this.currentTeam === TeamType.OUR ? "w" : "b",
      this.getCastlingRightsFen(),
      this.getEnPassantTargetFen(),
      this.turnsWithNoCapturesOrPawnMoves.toString(),
      Math.floor(this.totalTurns / 2) + 1,
    ].join(" ");
  }

  private getCastlingRightsFen(): string {
    const rights: string[] = [];
    const canCastle = (
      team: TeamType,
      row: number,
      rookX: number,
      notation: string,
    ) => {
      const king = this.pieces.find((piece) =>
        piece.team === team &&
        piece.isKing &&
        !piece.hasMoved &&
        piece.position.isSamePosition(new Position(4, row)),
      );
      const rook = this.pieces.find((piece) =>
        piece.team === team &&
        piece.isRook &&
        !piece.hasMoved &&
        piece.position.isSamePosition(new Position(rookX, row)),
      );

      if (king && rook) rights.push(notation);
    };

    canCastle(TeamType.OUR, 0, 7, "K");
    canCastle(TeamType.OUR, 0, 0, "Q");
    canCastle(TeamType.OPPONENT, 7, 7, "k");
    canCastle(TeamType.OPPONENT, 7, 0, "q");

    return rights.length > 0 ? rights.join("") : "-";
  }

  private getEnPassantTargetFen(): string {
    const cols = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const pawn = this.pieces.find(
      (piece) => piece.isPawn && (piece as Pawn).enPassant,
    );

    if (!pawn) return "-";

    const targetY = pawn.team === TeamType.OUR
      ? pawn.position.y - 1
      : pawn.position.y + 1;
    return `${cols[pawn.position.x]}${targetY + 1}`;
  }

  getValidMove(piece: Piece, boardState: Piece[]): Position[] {
    switch (piece.type) {
      case PieceType.PAWN:
        return getPossiblePawnMoves(piece, boardState);
      case PieceType.BISHOP:
        return getPossibleBishopMoves(piece, boardState);
      case PieceType.ROOK:
        return getPossibleRookMoves(piece, boardState);
      case PieceType.KING:
        return getPossibleKingMoves(piece, boardState);
      case PieceType.KNIGHT:
        return getPossibleKnightMoves(piece, boardState);
      case PieceType.QUEEN:
        return getPossibleQueenMoves(piece, boardState);
      default:
        return [];
    }
  }

  calculateMoveNotationBeforeMove(piece: Piece, destination: Position, moveType: MoveResult): string | null {
    if(moveType === MoveResult.INVALID) return null;

    const cols : string[] = ['a','b','c','d','e','f','g','h'];
    const rows: string[] = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const dest = `${cols[destination.x]}${rows[destination.y]}`
    const sufix = moveType === MoveResult.CHECK ? '+' :
    moveType === MoveResult.CHECKMATE ? '#' : ''; 
    
    let notation : string = '';

    const getAmbiguousPieces = (): Piece[] => {
      return this.pieces.filter(p =>
        p.type === piece.type &&
        p.team === piece.team &&
        !p.position.isSamePosition(piece.position) &&
        this.getValidMove(p, this.pieces).some(m => m.isSamePosition(destination))
      );
    }

    const getDisambiguation = (): string => {
      const ambiguous = getAmbiguousPieces();
      if (ambiguous.length === 0) return '';

      const otherPiecesInSameCol = ambiguous.filter(p => p.position.x === piece.position.x);
      const otherPiecesInSameRow = ambiguous.filter(p => p.position.y === piece.position.y);

      if (otherPiecesInSameCol.length === 0) return cols[piece.position.x];
      if (otherPiecesInSameRow.length === 0) return rows[piece.position.y];
      return `${cols[piece.position.x]}${rows[piece.position.y]}`;
    }

    if(moveType === MoveResult.CHECKMATE)  notation = dest;
    if(moveType === MoveResult.CHECK)      notation = dest;
    if(moveType === MoveResult.EN_PASSANT) notation = dest;
    if(moveType === MoveResult.STALEMATE)  notation = dest;

    if(moveType === MoveResult.MOVE){
      if(piece.type === PieceType.PAWN){
        notation = dest;
      } else {
        notation = `${getDisambiguation()}${dest}`
      }
    }

    if(moveType === MoveResult.CASTLE){
      notation = destination.x > piece.position.x ? '0-0' : '0-0-0';
    }

    if(moveType === MoveResult.CAPTURE){
      if(piece.type === PieceType.PAWN){
        notation = `${cols[piece.position.x]}x${dest}`
      } else {
        notation = `${getDisambiguation()}x${dest}`
      }
    }

    


    return notation + sufix;
  }

  calculateAllMoves(): void {
    for (const piece of this.pieces) {
      piece.possibleMoves = this.getValidMove(piece, this.pieces);
    }

    //catling move logic
    for (const king of this.pieces.filter((p) => p.isKing)) {
      if(this.isKingInAttack()) continue;
      if (!king.possibleMoves) continue;
      king.possibleMoves = [
        ...king.possibleMoves,
        ...getCastlingMoves(king, this.pieces),
      ];
    }

    this.checkCurrentTeamMoves();


    //clean moves of the team that is not playing
    for (const piece of this.pieces.filter(
      (p) => p.team !== this.currentTeam,
    )) {
      piece.possibleMoves = [];
    }
  }

  checkmate(): boolean {
    if(this.isKingInAttack() && !this.pieces.filter(p => p.team === this.currentTeam)
      .some(p => p.possibleMoves !== undefined && p.possibleMoves.length > 0)) return true;
    return false;
  }

  stalemate(): boolean {
    if(!this.isKingInAttack() && !this.pieces.filter(p => p.team === this.currentTeam)
      .some(p => p.possibleMoves !== undefined && p.possibleMoves.length > 0)) return true;
    return false;
  }

  drawByInsuficientMaterial() : boolean {
    const ourPieces = this.pieces.filter(p => p.team === TeamType.OUR);
    const opponentPieces = this.pieces.filter(p => p.team === TeamType.OPPONENT);

    const onlyKingOrSingleMinor = (pieces: Piece[]) =>
      pieces.length === 1 ||
      (
        pieces.length === 2 &&
        pieces.some(p => p.isKing) &&
        pieces.some(p => p.isKnight || p.isBishop)
      );

    const ourTeamEligibleForDraw = onlyKingOrSingleMinor(ourPieces);
    const opponentTeamEligibleForDraw = onlyKingOrSingleMinor(opponentPieces);

    if(ourTeamEligibleForDraw && opponentTeamEligibleForDraw) return true; 

    //2 knights
    if(ourPieces.length === 3 &&
        ourPieces.filter(p => p.isKnight).length === 2 &&
          opponentPieces.length === 1) return true;

    if(opponentPieces.length === 3 &&
        opponentPieces.filter(p => p.isKnight).length === 2 &&
          ourPieces.length === 1) return true;


    return false;
  }

  drawByRepetition() : boolean {
    const simplifiedPieces : SimplifiedPiece[] = this.pieces.map(p => new SimplifiedPiece(p))
    const simplifiedPiecesJson : string = JSON.stringify(simplifiedPieces)

    if(this.boardHistory[simplifiedPiecesJson] === undefined){
      this.boardHistory[simplifiedPiecesJson] = 1;
    } else {
      this.boardHistory[simplifiedPiecesJson] += 1;
    }

    if(this.boardHistory[simplifiedPiecesJson] === 3){
      return true;
    }
    return false;
  }

  isKingInAttack(): boolean {
    const king = this.pieces.find(
      (p) => p.team === this.currentTeam && p.isKing,
    );
    for (const piece of this.pieces) {
      if (king && piece.possibleMoves) {
        if (piece.team === king.team) continue;
        if (piece.possibleMoves.some((m) => m.isSamePosition(king.position))) {
          return true;
        }
      }
    }
    return false;
  }

  checkCurrentTeamMoves() {
    for (const piece of this.pieces.filter(
      (p) => p.team === this.currentTeam,
    )) {
      if (piece.possibleMoves === undefined) continue;

      for (const move of piece.possibleMoves) {
        const simulatedBoard = this.clone();

        simulatedBoard.pieces = simulatedBoard.pieces.filter(
          (p) => !p.isSamePosition(move),
        );

        const simulatedPiece = simulatedBoard.pieces.find((p) =>
          p.isSamePiecePosition(piece),
        )!;
        simulatedPiece.position = move.clone();
        const simulatedKing = simulatedBoard.pieces.find(
          (p) => p.team === simulatedBoard.currentTeam && p.isKing,
        )!;

        for (const enemy of simulatedBoard.pieces.filter(
          (p) => p.team !== simulatedBoard.currentTeam,
        )) {
          enemy.possibleMoves = simulatedBoard.getValidMove(
            enemy,
            simulatedBoard.pieces,
          );

          if (enemy.isPawn) {
            if (
              enemy.possibleMoves.some(
                (m) =>
                  m.x !== enemy.position.x &&
                  m.isSamePosition(simulatedKing.position),
              )
            ) {
              piece.possibleMoves = piece.possibleMoves?.filter(
                (m) => !m.isSamePosition(move),
              );
            }
          } else {
            if (
              enemy.possibleMoves.some((m) =>
                m.isSamePosition(simulatedKing.position),
              )
            ) {
              piece.possibleMoves = piece.possibleMoves?.filter(
                (m) => !m.isSamePosition(move),
              );
            }
          }
        }
      }
    }
  }

  promotePawn(piece: Piece, type: PieceType): void {
    this.pieces = this.pieces.map((p) => {
      if (!p.position.isSamePosition(piece.position)) return p;
      const promoted = new Piece(p.position, type, p.team, true);
      promoted.possibleMoves = [];
      return promoted;
    });

    this.updateLastMovePromotionNotation(type);
  }

  updateLastMovePromotionNotation(type: PieceType): MoveResult | null {
    const lastMove = this.moves[this.moves.length - 1];
    if (!lastMove || lastMove.piece !== PieceType.PAWN || !lastMove.notation) {
      return null;
    }

    const promotionNotation: Record<PieceType, string> = {
      [PieceType.PAWN]: "",
      [PieceType.BISHOP]: "B",
      [PieceType.KNIGHT]: "N",
      [PieceType.ROOK]: "R",
      [PieceType.KING]: "K",
      [PieceType.QUEEN]: "Q",
    };

    const baseNotation = lastMove.notation.replace(/[+#]?$/, "");
    lastMove.notation = `${baseNotation}=${promotionNotation[type]}`;

    for (const piece of this.pieces) {
      piece.possibleMoves = this.getValidMove(piece, this.pieces);
    }

    this.checkCurrentTeamMoves();

    if (this.checkmate()) {
      lastMove.notation += "#";
      lastMove.moveType = MoveResult.CHECKMATE;
      return MoveResult.CHECKMATE;
    }

    if (this.stalemate()) {
      lastMove.moveType = MoveResult.STALEMATE;
      return MoveResult.STALEMATE;
    }

    if (this.drawByInsuficientMaterial()) {
      lastMove.moveType = MoveResult.DRAW;
      return MoveResult.DRAW;
    }

    if (this.isKingInAttack()) {
      lastMove.notation += "+";
      lastMove.moveType = MoveResult.CHECK;
      return MoveResult.CHECK;
    }

    return lastMove.moveType;
  }

  drawByFiftyMoveRule(): boolean {
    return this.turnsWithNoCapturesOrPawnMoves >= 100;
  }

  calculateMoveNotation(move : Move, board : Chessboard): string | null{
    if(!move) return null;
    if(move.moveType === MoveResult.INVALID) return null;

    const cols : string[] = ['a','b','c','d','e','f','g','h'];
    const rows: string[] = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const dest = `${cols[move.toPosition.x]}${rows[move.toPosition.y]}`
    const sufix = move.moveType === MoveResult.CHECK || (this.isKingInAttack() && !this.checkmate()) ? '+' :
    move.moveType === MoveResult.CHECKMATE ? '#' : ''; 
    
    let notation : string = '';

    function getAmbiguousPieces(): Piece[] {
      const allSameTypePieces = board.pieces.filter(p =>
        p.type === move.piece &&
        p.team === move.team &&
        !p.position.isSamePosition(move.toPosition)
      );
      
      return allSameTypePieces.filter(p =>
        board.getValidMove(p, board.pieces).some(m => m.isSamePosition(move.toPosition))
      );
    }

    function getDisambiguation(): string {
    const ambiguous = getAmbiguousPieces();
    if (ambiguous.length === 0) return '';

    const otherPiecesInSameCol = ambiguous.filter(p => p.position.x === move.fromPosition.x);
    const otherPiecesInSameRow = ambiguous.filter(p => p.position.y === move.fromPosition.y);

    if (otherPiecesInSameCol.length === 0) return cols[move.fromPosition.x];
    if (otherPiecesInSameRow.length === 0) return rows[move.fromPosition.y];
    return `${cols[move.fromPosition.x]}${rows[move.fromPosition.y]}`;

    }

    if(move.moveType === MoveResult.CHECKMATE)  notation = dest;
    if(move.moveType === MoveResult.CHECK)      notation = dest;
    if(move.moveType === MoveResult.EN_PASSANT) notation = dest;
    if(move.moveType === MoveResult.STALEMATE)  notation = dest;

    if(move.moveType === MoveResult.MOVE){
      if(move.piece === PieceType.PAWN){
        notation = dest;
      } else {
        notation = `${getDisambiguation()}${dest}`
      }
    }

    if(move.moveType === MoveResult.CASTLE){
      notation = move.toPosition.x > move.fromPosition.x ? '0-0' : '0-0-0';
    }

    if(move.moveType === MoveResult.CAPTURE){
      if(move.piece === PieceType.PAWN){
        notation = `${cols[move.fromPosition.x]}x${dest}`
      } else {
        notation = `${getDisambiguation()}x${dest}`
      }
    } 
    return notation + sufix;
  }

  playMove(
    enPassantMove: boolean,
    isValidMove: boolean,
    playedPiece: Piece,
    destination: Position,
  ): MoveResult {

    if (!enPassantMove && !isValidMove) return MoveResult.INVALID;

    let moveType = MoveResult.MOVE;
    const targetPiece = this.pieces.find((p) =>
      p.position.isSamePosition(destination),
    );
    const isCapture = !!targetPiece && targetPiece.team !== playedPiece.team;

    // Atualiza a contagem para a regra dos 50 movimentos
    if (isCapture || playedPiece.isPawn) {
      this.turnsWithNoCapturesOrPawnMoves = 0;
    } else {
      this.turnsWithNoCapturesOrPawnMoves++;
    }

    if (playedPiece.isKing && Math.abs(destination.x - playedPiece.position.x) > 1) {
      moveType = MoveResult.CASTLE;
    } else if (isCapture || enPassantMove) {
      moveType = MoveResult.CAPTURE;
    }
    
    let notation = this.calculateMoveNotationBeforeMove(playedPiece, destination, moveType) || undefined;

    if (
      playedPiece.isKing &&
      Math.abs(destination.x - playedPiece.position.x) > 1
    ) {
      const rook =
        destination.x > playedPiece.position.x
          ? this.pieces.find((p) =>
              p.isSamePosition(new Position(7, playedPiece.position.y)),
            )
          : this.pieces.find((p) =>
              p.isSamePosition(new Position(0, playedPiece.position.y)),
            );

      const direction = destination.x > playedPiece.position.x ? 1 : -1;

      this.pieces.map((p) => {
        if (p.isPawn) {
          (p as Pawn).enPassant = false;
        }

        if (p.isSamePiecePosition(playedPiece)) {
          p.position = destination;
          p.hasMoved = true;
        }

        if (p.isSamePiecePosition(rook!)) {
          p.position.x = destination.x - direction;
          p.hasMoved = true;
        }
        return p;
      });
      this.totalTurns++;
      this.moves.push(new Move(playedPiece.team, playedPiece.type, MoveResult.CASTLE,
        playedPiece.position.clone(), destination.clone(), notation))
      return MoveResult.CASTLE;
    }

    const from = playedPiece.position;
    const pawnDirection = playedPiece.team === TeamType.OUR ? 1 : -1;
    const enPassantCapturedPosition = new Position(
      destination.x,
      destination.y - pawnDirection,
    );
    const isDoublePawnMove =
      playedPiece.isPawn && Math.abs(destination.y - from.y) === 2;

    this.pieces = this.pieces.reduce((results, p) => {
      if (p.position.isSamePosition(from)) {
        if (p.isPawn) {
          results.push(new Pawn(destination, p.team, true, isDoublePawnMove));
        } else {
          results.push(new Piece(destination, p.type, p.team, true));
        }
      } else if (
        !p.position.isSamePosition(destination) &&
        !(enPassantMove && p.position.isSamePosition(enPassantCapturedPosition))
      ) {
        if (p.isPawn) {
          (p as Pawn).enPassant = false;
        }
        results.push(p);
      }
      return results;
    }, [] as Piece[]);

    this.totalTurns++;

    for (const piece of this.pieces) {
      piece.possibleMoves = this.getValidMove(piece, this.pieces);
    }

    this.checkCurrentTeamMoves();


    if(this.checkmate()) {
      notation = notation ? notation.replace(/\+?$/, '#') : 'x#';
      this.moves.push(new Move(playedPiece.team, playedPiece.type, MoveResult.CHECKMATE,
        playedPiece.position.clone(), destination.clone(), notation))
      return MoveResult.CHECKMATE;
    }
    if(this.stalemate()){
      this.moves.push(new Move(playedPiece.team, playedPiece.type, MoveResult.STALEMATE,
        playedPiece.position.clone(), destination.clone(), notation))
     return MoveResult.STALEMATE;
    }  

    if(this.drawByInsuficientMaterial()){
      this.moves.push(new Move(playedPiece.team, playedPiece.type, MoveResult.DRAW,
        playedPiece.position.clone(), destination.clone(), notation))
      return MoveResult.DRAW;
    }

    if(this.drawByRepetition()){
      this.moves.push(new Move(playedPiece.team, playedPiece.type, MoveResult.DRAW,
        playedPiece.position.clone(), destination.clone(), notation))
      return MoveResult.DRAW;
    }

    if(this.drawByFiftyMoveRule()){
      this.moves.push(new Move(playedPiece.team, playedPiece.type, MoveResult.DRAW,
        playedPiece.position.clone(), destination.clone(), notation))
      return MoveResult.DRAW;
    }

    if (this.isKingInAttack()){
      notation = notation + '+';
      this.moves.push(new Move(playedPiece.team, playedPiece.type, MoveResult.CHECK,
        playedPiece.position.clone(), destination.clone(), notation))
      return MoveResult.CHECK;
    } 
    if (isCapture || enPassantMove) {
      this.moves.push(new Move(playedPiece.team, playedPiece.type, MoveResult.CAPTURE,
        playedPiece.position.clone(), destination.clone(), notation))
      return MoveResult.CAPTURE;
    }
    
    this.moves.push(new Move(playedPiece.team, playedPiece.type, MoveResult.MOVE,
        playedPiece.position.clone(), destination.clone(), notation))
    return MoveResult.MOVE;
  }
}
