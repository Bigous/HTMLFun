import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Injectable } from '@angular/core';

export interface IPosition {
  x: number;
  y: number;
}

export interface IWin {
  time: number;
  moves: number;
  pushes: number;
}

export interface IMove {
  oldPos: IPosition;
  newPos: IPosition;
}

@Injectable()
export class Levels {
  private levels = levels;
  private currentLevel = 0;
  private board: Array<Array<number>>;
  private maxColumn: number;
  private numOfGoals: number;
  private numOfTreasures: number;
  private manPos: IPosition;
  private moveCount: number;
  private pushCount: number;
  private startTime: number;
  private wonTime: number;

  public onLevelChanged: BehaviorSubject<number> = new BehaviorSubject<number>(undefined);
  public onLevelFinished: BehaviorSubject<IWin> = new BehaviorSubject<IWin>(undefined);
  public onManMove: BehaviorSubject<IMove> = new BehaviorSubject<IMove>(undefined);
  public onObjMove: BehaviorSubject<IMove> = new BehaviorSubject<IMove>(undefined);

  constructor() {
    this.undefineAll();
  }

  private undefineAll() {
    this.board = undefined;
    this.maxColumn = undefined;
    this.numOfGoals = undefined;
    this.numOfTreasures = undefined;
    this.manPos = undefined;
    this.moveCount = 0;
    this.pushCount = 0;
    this.startTime = undefined;
    this.wonTime = undefined;
  }

  get CurrentLevel() {
    return this.currentLevel;
  }

  set CurrentLevel(level: number) {
    if (this.levels.length > level && level >= 0) {
      this.currentLevel = level;
      this.undefineAll();
      this.onLevelChanged.next(this.currentLevel);
    }
  }

  get Level(): Array<string> {
    return this.levels[this.currentLevel];
  }

  public toNextLevel() {
    this.CurrentLevel = this.CurrentLevel + 1;
  }

  public toPriorLevel() {
    this.CurrentLevel = this.CurrentLevel - 1;
  }

  get IsFirstLevel(): boolean {
    return this.currentLevel === 0;
  }

  get IsLastLevel(): boolean {
    return this.currentLevel === this.levels.length - 1;
  }

  get LastLevel(): number {
    return this.levels.length - 1;
  }

  get MaxColumn(): number {
    if (this.maxColumn) {
      return this.maxColumn;
    }
    let ret = 0;
    for (const line of this.Level) {
      ret = Math.max(ret, line.length);
    }
    return (this.maxColumn = ret);
  }

  get MaxRow(): number {
    return this.Level.length;
  }

  get ManPos(): IPosition {
    const board = this.Board;
    return this.manPos;
  }

  get Board(): Array<Array<number>> {
    if (this.board) {
      return this.board;
    }
    const board = new Array<Array<number>>(this.MaxRow);
    this.numOfGoals = 0;
    this.numOfTreasures = 0;

    for (let nRow = 0; nRow < this.MaxRow; ++nRow) {
      board[nRow] = new Array<number>(this.MaxColumn);
      for (let nCol = 0; nCol < this.MaxColumn; ++nCol) {
        // 0: outside, 1: inside, 2: border, 3: goal, 4: object, 5: man, 6: object on goal, 7: man on goal
        const boardElement =
          nCol < this.Level[nRow].length ? this.Level[nRow].charAt(nCol) : '!';
        switch (boardElement) {
          case ' ':
            board[nRow][nCol] = 1;
            break;
          case '#':
            board[nRow][nCol] = 2;
            break;
          case '.':
            board[nRow][nCol] = 3;
            ++this.numOfGoals;
            break;
          case '$':
            board[nRow][nCol] = 4;
            break;
          case '@':
            board[nRow][nCol] = 5;
            this.manPos = { x: nCol, y: nRow };
            break;
          case '*':
            board[nRow][nCol] = 6;
            this.numOfGoals++;
            this.numOfTreasures++;
            break;
          case '+':
            board[nRow][nCol] = 7;
            this.numOfGoals++;
            this.manPos = { x: nCol, y: nRow };
            break;
          default:
            board[nRow][nCol] = 0;
        }
      }
    }
    // create outside area
    // FIXME: find a better algorithm for this
    for (let nRow = 0; nRow < this.MaxRow; ++nRow) {
      for (
        let nCol = 0;
        nCol < this.MaxColumn && board[nRow][nCol] === 1;
        ++nCol
      ) {
        board[nRow][nCol] = 0;
      }
      for (
        let nCol = this.MaxColumn - 1;
        nCol >= 0 && board[nRow][nCol] === 1;
        --nCol
      ) {
        board[nRow][nCol] = 0;
      }
    }
    for (let nCol = 0; nCol < this.MaxColumn; ++nCol) {
      for (let nRow = 0; nRow < this.MaxRow && board[nRow][nCol] < 2; ++nRow) {
        board[nRow][nCol] = 0;
      }
      for (
        let nRow = this.MaxRow - 1;
        nRow >= 0 && board[nRow][nCol] < 2;
        --nRow
      ) {
        board[nRow][nCol] = 0;
      }
    }
    this.startTime = Date.now();
    return (this.board = board);
  }

  get ElapsedTime(): number {
    return (this.wonTime ? this.wonTime : Date.now()) - this.startTime;
  }

  get MoveCount(): number {
    return this.moveCount;
  }

  get PushCount(): number {
    return this.pushCount;
  }

  changeManPos(newPos: IPosition) {
    const oldPos = this.manPos;
    this.board[newPos.y][newPos.x] += 4;
    this.board[oldPos.y][oldPos.x] -= 4;
    this.manPos = newPos;
    this.moveCount++;
    this.onManMove.next({oldPos, newPos});
  }

  changeObjPos(
    oldPos: IPosition,
    newPos: IPosition
  ) {
    const oldLocation = this.board[oldPos.y][oldPos.x];
    if (oldLocation === 6) {
      this.numOfTreasures--;
    }
    this.board[oldPos.y][oldPos.x] -= 3;
    this.board[newPos.y][newPos.x] += 3;
    const newLocation = this.board[newPos.y][newPos.x];
    if (newLocation === 6) {
      this.numOfTreasures++;
    }
    this.pushCount++;
    this.onObjMove.next({ oldPos, newPos });
  }

  moveMan(deltaX: number, deltaY: number) {
    const oldPos = this.manPos;
    const newPos = { ...oldPos };
    newPos.x += deltaX;
    newPos.y += deltaY;
    const newLocation = this.board[newPos.y][newPos.x];
    const newLocation2 = this.board[oldPos.y + 2 * deltaY][
      oldPos.x + 2 * deltaX
    ];
    if (newLocation === 1 || newLocation === 3) {
      // Inside or goal
      this.changeManPos(newPos);
    } else if (
      (newLocation === 4 || newLocation === 6) &&
      (newLocation2 === 1 || newLocation2 === 3)
    ) {
      const newPos2 = { ...newPos };
      newPos2.x += deltaX;
      newPos2.y += deltaY;
      this.changeObjPos(newPos, newPos2);
      this.changeManPos(newPos);
    }
    this.testLevelWon();
  }

  testLevelWon() {
    if (this.wonTime === undefined && this.numOfGoals === this.numOfTreasures) {
      this.wonTime = Date.now();
      const won: IWin = {
        time: this.ElapsedTime,
        moves: this.moveCount,
        pushes: this.pushCount
      };
      this.onLevelFinished.next(won);
    }
  }
}

const levels = [
  [
    '    #####',
    '    #   #',
    '    #   #',
    '  ###   ##',
    '  #      #',
    '### # ## #   ######',
    '#   # ## #####    #',
    '# $  $           .#',
    '#####$### #@##  ..#',
    '    #     #########',
    '    #######'
  ],
  [
    '    #####',
    '    #   #',
    '    #   #',
    '  ### $ ##',
    '  #   $  #',
    '### # ## #   ######',
    '#   # ## #####   .#',
    '# $  $          ..#',
    '#####$### #@##  ..#',
    '    #     #########',
    '    #######'
  ],
  [
    '        ########',
    '        #     @#',
    '        # $#  ##',
    '        #     #',
    '        ##  $ #',
    '#########   # ###',
    '#.     ##   $   #',
    '##.             #',
    '#.     ##########',
    '########'
  ],
  [
    '        ########',
    '        #     @#',
    '        # $#  ##',
    '        #     #',
    '        ##  $ #',
    '#########   # ###',
    '#..    ## $$$   #',
    '##.             #',
    '#..    ##########',
    '########'
  ],
  [
    '        ########',
    '        #     @#',
    '        #  #$ ##',
    '        #   $ #',
    '        ##  $ #',
    '#########   # ###',
    '#..    ##   $   #',
    '##.         $   #',
    '#..    ##########',
    '########'
  ],
  [
    '        ########',
    '        #     @#',
    '        # $#$ ##',
    '        #   $ #',
    '        ##  $ #',
    '#########   # ###',
    '#...   ## $ $   #',
    '##..      $ $   #',
    '#...   ##########',
    '########'
  ],
  [
    '           ########',
    '           #      #',
    '############      #',
    '#    #            #',
    '#    #   $$#   ...#',
    '#       $$ #   ...#',
    '#    # $$  ########',
    '#    #     #',
    '##@#########',
    ' ###'
  ],
  [
    '           ########',
    '           #      #',
    '############      #',
    '#    #  $ $       #',
    '#    # $$  #   ...#',
    '#       $ $#   ...#',
    '#    #     ########',
    '#    #     #',
    '##@#########',
    ' ###'
  ],
  [
    '           ########',
    '           #      #',
    '############      #',
    '#    #            #',
    '#    #$    #     .#',
    '#          #     .#',
    '#    #$    ########',
    '#    #     #',
    '##@#########',
    ' ###'
  ],
  [
    '           ########',
    '           #    ..#',
    '############    ..#',
    '#    #          ..#',
    '#    # $$$$#    ..#',
    '#  $$      #    ..#',
    '#    # $$$$########',
    '#    #     #',
    '##@#########',
    ' ###'
  ],
  [
    '           ########',
    '           #      #',
    '############     .#',
    '#    #          ..#',
    '# $$$#     #    ..#',
    '#  $       #    ..#',
    '# $$$#     ########',
    '#    #     #',
    '##@#########',
    ' ###'
  ],
  [
    '           ########',
    '           #      #',
    '############     .#',
    '#    #   $       .#',
    '#    #  $  #     .#',
    '#      $   #     .#',
    '#    #$    ########',
    '#    #     #',
    '##@#########',
    ' ###'
  ],
  [
    '  ####',
    '  #  ###########',
    '  #            #',
    '  #  #   #     #',
    '  #       #    #',
    '###  # #  #### #',
    '#@#$      ##   #',
    '#  $$  # #   # #',
    '#   $  $ $     #',
    '#####  #########',
    '  #      #',
    '  #      #',
    '  #      #',
    '  #      #',
    '  #......#',
    '  ########'
  ],
  [
    '  ####',
    '  #  ###########',
    '  #        $ $ #',
    '  #  #   #  $  #',
    '  #       #    #',
    '###  # #  #### #',
    '#@#       ##   #',
    '#      # #   # #',
    '#              #',
    '#####  #########',
    '  #      #',
    '  #      #',
    '  #      #',
    '  #      #',
    '  #   ...#',
    '  ########'
  ],
  [
    '          #######',
    '          #     #',
    '      #####     #',
    '      #         #',
    '      #  ##    .#',
    '      ## ##    .#',
    '     ### ########',
    '     #     ##',
    ' #####      #####',
    '##   #$    $#   #',
    '#@              #',
    '######      #####',
    '     #      #',
    '     ########'
  ],
  [
    '          #######',
    '          #     #',
    '      #####     #',
    '      #        .#',
    '      #  ##  ...#',
    '      ## ##  ...#',
    '     ### ########',
    '     # $$$ ##',
    ' #####  $   #####',
    '##   #  $   #   #',
    '#@ $          $ #',
    '######      #####',
    '     #      #',
    '     ########'
  ],
  [
    ' ###  #############',
    '##@####       #   #',
    '# $               #',
    '#  $  #       #   #',
    '# $   #       #   #',
    '###   #       #   #',
    '#     #       #   #',
    '#    ###### ###   #',
    '## #  #       #   #',
    '#  ## #       ##  #',
    '#  .# #         # #',
    '# ..# #         # #',
    '##### #       # # #',
    '    # ######### # #',
    '    #           # #',
    '    ###############'
  ],
  [
    ' ###  #############',
    '##@####       #   #',
    '# $$              #',
    '#  $$$#       #   #',
    '# $   #       #   #',
    '###   #      .#   #',
    '#     #      .#   #',
    '#    ###### ###   #',
    '## #  #       #   #',
    '#  ## #       ##  #',
    '# ..# #         # #',
    '# ..# #         # #',
    '##### #       # # #',
    '    # ######### # #',
    '    #           # #',
    '    ###############'
  ],
  [
    '          ####',
    '     #### #  #',
    '   ### @###  #',
    '  ##         #',
    ' ##    $ ## ##',
    ' #  # ##     #',
    ' # #   $  # ###',
    ' # $   #  #   #####',
    '####    #     #   #',
    '#### ##           #',
    '#     ###  ########',
    '#     # ####',
    '#     #',
    '#  ...#',
    '#######'
  ],
  [
    '          ####',
    '     #### #  #',
    '   ### @###$ #',
    '  ##         #',
    ' ##      ## ##',
    ' #  # ##     #',
    ' # #      # ###',
    ' # $   #  #   #####',
    '####    #     #   #',
    '#### ##           #',
    '#     ###  ########',
    '#     # ####',
    '#     #',
    '#   ..#',
    '#######'
  ],
  [
    '          ####',
    '     #### #  #',
    '   ### @###$ #',
    '  ##         #',
    ' ##      ## ##',
    ' #  # ##$    #',
    ' # #    $ # ###',
    ' # $   #  #   #####',
    '####    #     #   #',
    '#### ##           #',
    '#     ###  ########',
    '#     # ####',
    '#     #',
    '# ....#',
    '#######'
  ],
  [
    '          ####',
    '     #### #  #',
    '   ### @###  #',
    '  ##         #',
    ' ##  $   ## ##',
    ' #  #$##     #',
    ' # #      # ###',
    ' #   $ #  #   #####',
    '#### $  #     #   #',
    '#### ##           #',
    '#     ###  ########',
    '#     # ####',
    '#     #',
    '# ....#',
    '#######'
  ],
  [
    '          ####',
    '     #### #  #',
    '   ### @###  #',
    '  ##         #',
    ' ##      ## ##',
    ' #  # ##     #',
    ' # #      # ###',
    ' # $   #  #   #####',
    '####    #     #   #',
    '#### ## $         #',
    '#     ###  ########',
    '#     # ####',
    '#     #',
    '#   ..#',
    '#######'
  ],
  [
    '################',
    '#              #',
    '# # ######     #',
    '# # @$ $ $ $#  #',
    '# #         ## ##',
    '# #       ###   #',
    '# #        ##   #',
    '# ###      ##   #',
    '#     # ## ## ..#',
    '#####   ## ## ..#',
    '    #####     ###',
    '        #     #',
    '        #######'
  ],
  [
    '################',
    '#              #',
    '# # ######     #',
    '# #    $    #  #',
    '# #   $@$   ## ##',
    '# #    $  ###   #',
    '# #        ##   #',
    '# ###      ##   #',
    '#     # ## ## ..#',
    '#####   ## ## ..#',
    '    #####     ###',
    '        #     #',
    '        #######'
  ],
  [
    '################',
    '#              #',
    '# # ######  $  #',
    '# #    $ $  #  #',
    '# #         ## ##',
    '# #       ###   #',
    '# #        ##   #',
    '# ###      ##   #',
    '#     # ## ##  .#',
    '#####@  ## ## ..#',
    '    #####     ###',
    '        #     #',
    '        #######'
  ],
  [
    '       #######',
    ' #######     #',
    ' #     # $@$ #',
    ' #   #   #########',
    ' # ###      ##   #',
    ' #   #..    ## # #',
    ' # ###..       $ #',
    '##   #### ### #$##',
    '#  #    #     # #',
    '#         #  ## #',
    '#       ###   # #',
    '#####         # #',
    '    ### ###   # #',
    '      #     #   #',
    '      ########  #',
    '             ####'
  ],
  [
    '       #######',
    ' #######     #',
    ' #     # $@$ #',
    ' #   #.  #########',
    ' # ###..    ##   #',
    ' #   #..    ## # #',
    ' # ###..       $ #',
    '##   #### ### #$##',
    '#  #    #     # #',
    '#  $      #$ ## #',
    '#       ###   # #',
    '#####      $  # #',
    '    ### ###   # #',
    '      #     #   #',
    '      ########  #',
    '             ####'
  ],
  [
    '       #######',
    ' #######     #',
    ' #     # $@$ #',
    ' #   #   #########',
    ' # ###..    ##   #',
    ' #   #..    ## # #',
    ' # ###..         #',
    '##   #### ### #$##',
    '#  #    #  $  # #',
    '#         #  ## #',
    '#       ###$  # #',
    '#####     $   # #',
    '    ### ###   # #',
    '      #     #   #',
    '      ########  #',
    '             ####'
  ],
  [
    '       #######',
    ' #######     #',
    ' #     # $@$ #',
    ' #   #   #########',
    ' # ###..   .##   #',
    ' #   #..    ## # #',
    ' # ###..         #',
    '##   #### ### # ##',
    '#  #$   #     # #',
    '#  $ $$$  #  ## #',
    '#       ###   # #',
    '#####         # #',
    '    ### ###   # #',
    '      #     #   #',
    '      ########  #',
    '             ####'
  ],
  [
    ' #######',
    ' #  #  #####',
    '##  #  #   ###',
    '#   #  #    .#',
    '#   #$$    ..#',
    '#   #  #   ..#',
    '#   # $########',
    '##            #',
    '##  #     #   #',
    ' ######  ##$$@#',
    '      #      ##',
    '      ########'
  ],
  [
    ' #######',
    ' #  #  #####',
    '##  #  # ..###',
    '#   #  #   ..#',
    '#   #$$    ..#',
    '#   #  #   ..#',
    '#   # $########',
    '##        $   #',
    '##  #  $$ #   #',
    ' ######  ##$$@#',
    '      #      ##',
    '      ########'
  ],
  [
    ' #################',
    ' #      #    #   ##',
    '##.      $## # #  #',
    '#..    #     #    #',
    '#..    #  #  # #  #',
    '######### $  $    #',
    '  #     #$##  ## ##',
    ' ##        # $    #',
    ' #  ## ### #  ##  #',
    ' #                #',
    ' #       ##  ######',
    ' #######  @ ##',
    '       ######'
  ],
  [
    ' #################',
    ' #..    #    #   ##',
    '##..      ## # #$ #',
    '#...   #     #    #',
    '#...   #  #  # #  #',
    '#########         #',
    '  #     #$##  ## ##',
    ' ##   $    #      #',
    ' #  ## ### #  ##$ #',
    ' # $ $$        $  #',
    ' # $    $##  ######',
    ' #######  @ ##',
    '       ######'
  ],
  [
    '         #####',
    '     #####   #',
    '    ##       ####',
    '#####    $   ##.#',
    '#        $  ##..#',
    '#  ###### ###...#',
    '## #  #    #    #',
    '#     #    #    #',
    '#@ #  ## ####   #',
    '####        ##  #',
    '   ##  $$       #',
    '    # $$    #   #',
    '    #        ####',
    '    ######   #',
    '         #####'
  ],
  [
    '         #####',
    '     #####   #',
    '    ##       ####',
    '#####    $   ##.#',
    '#        $  ##..#',
    '#  ###### ###...#',
    '## #  #    #....#',
    '# $   #    #    #',
    '#@ #$ ## ####   #',
    '####        ##  #',
    '   ##  $        #',
    '    # $$  $ #   #',
    '    #   $ $  ####',
    '    ######   #',
    '         #####'
  ],
  [
    '       ###########',
    '       #   #     #',
    '#####  #         #',
    '#   #####  ## # ##',
    '#   ##   # ## $  #',
    '#        # ##$$$ #',
    '## ###   # ##    #',
    '## #   ### ##### #',
    '## #        #    #',
    '#  ### ##   #    ##',
    '#       #   #     #',
    '# @##   #  ##.    #',
    '#####   ######...##',
    '    #####    #####'
  ],
  [
    '  ####',
    '  #  #########',
    ' ##  ##  #   #',
    ' #   #  @    ####',
    ' #      #    #  ##',
    '##   ## #        #',
    '#  #  # #   $$$  #',
    '#          ## ####',
    '#     # #  #  #',
    '##  ###  ###  #',
    ' #  #         #',
    ' ####      ####',
    '   #    ####',
    '   #...##',
    '   #   #',
    '   #####'
  ],
  [
    '  ####',
    '  #  #########',
    ' ##  ##  #   #',
    ' #   #  @    ####',
    ' #      #    #  ##',
    '##   ## #        #',
    '#  #  # #   $$$  #',
    '#      $   ## ####',
    '#     #$#  #  #',
    '##  ###  ###$ #',
    ' #  #         #',
    ' ####      ####',
    '   #... ####',
    '   #...##',
    '   #   #',
    '   #####'
  ],
  [
    '      ####',
    '  #####  #',
    ' ##     $#',
    '## $  ## ###',
    '#@$   # $  #',
    '#### ##   $#',
    ' #.   #$ $ #',
    ' #.   #   $#',
    ' #..       ##',
    ' #....#     #',
    ' ######     #',
    '      #   ###',
    '      #  ###',
    '      #  #',
    '      ####'
  ],
  [
    ' #########',
    ' #....   ##',
    ' #.# #  $ ##',
    '##    # # @##',
    '#     #  #  ##',
    '#     #$ ##$ #',
    '## ###  $    #',
    ' #        #  #',
    ' # #      ## #',
    ' #  ###  ##  #',
    ' #    ## ## ##',
    ' #    #  $  #',
    ' ###      ###',
    '   #  #####',
    '   ####'
  ],
  [
    '############ ######',
    '#   #    # ### ...#',
    '#   $$#   @    ...#',
    '#   # ###   #     #',
    '## ## ###  #      #',
    ' # $ $     # # ####',
    ' #  $ $##  #      #',
    '#### #  #### # ## #',
    '#  # #    ## #    #',
    '#       # ## #   ##',
    '# #        # #   #',
    '#    ## ## # #####',
    '#            #',
    '## ## ###    #',
    ' #    # #    #',
    ' ###### ######'
  ],
  [
    '            #####',
    '#####  ######   #',
    '#   ####        #',
    '#     ## ## ##  ##',
    '#                #',
    '###    ## ##     ##',
    '  # ##### #####   #',
    ' ##$##### @##     #',
    ' # $  ###$### $  ##',
    ' # $  #   ###  ###',
    ' # $  $ #   $$ #',
    ' #     #   ##  #',
    ' #######    ####',
    '    #         #',
    '    #.........#',
    '    ###########'
  ],
  [
    '###########',
    '#....     #########',
    '#....     #  ##   #',
    '#  ### $    $     #',
    '#      $ #   ##   #',
    '#   #$#####    #  #',
    '###    #   #   #  #',
    '  #  $    $   ##  #',
    '  #  $   #$#  ##  #',
    '  ### ## #    ##  #',
    '   #      #  ######',
    '   #          #',
    '   ##   # #   #',
    '    #####@#####',
    '        ###'
  ],
  [
    '      ####',
    '####### @#',
    '#        #',
    '#   $##  #',
    '## # ..# #',
    ' # $ ..  #',
    ' # #   # ##',
    ' #   # #$ #',
    ' #   $    #',
    ' #  #######',
    ' ####'
  ],
  [
    '             ######',
    ' #############....#',
    '##   ##     ##....#',
    '#    ##    @## ...#',
    '#          #      #',
    '#    ##    # #    #',
    '#    ##    #      #',
    '## ##### ### ## ###',
    '##        ##      #',
    '#  ###  # ##### ###',
    '#   $   #       #',
    '#  $ #$ $ $###  #',
    '# $$$# $   # ####',
    '#    #  $$ #',
    '######   ###',
    '     #####'
  ],
  [
    '    ############',
    '    #          ##',
    '    #  # #   $  #',
    '    #  # #  ## @#',
    '   ## ## # $ # ##',
    '   #     #$  # #',
    '   #   # $   # #',
    '   ##   $   ## #',
    '   #  #  ##    #',
    '   #    ##   # #',
    '######     #   #',
    '#..  #  ########',
    '#.     ##',
    '#.      #',
    '#.      #',
    '#########'
  ],
  [
    '           #####',
    '          ##   ##',
    '         ##     #',
    '        ##      #',
    '       ##       #',
    '       #        #',
    '####   #      #####',
    '#  ######## ##    #',
    '#             $$$@#',
    '#.. ####### ##   ##',
    '#.. #######  #$ $##',
    '#..          #    #',
    '##############  $ #',
    '             ##  ##',
    '              ####'
  ],
  [
    '     ########',
    '  ####      ######',
    '  #    ## $ $   @#',
    '  # ## ##$#$ $ $##',
    '###    ...#  $$ ##',
    '#       ..#  #   #',
    '# #     ..#   $  #',
    '# #     ..   #   #',
    '#   ### ###     ##',
    '###             #',
    '  #             #',
    '  ######   ######',
    '       #####'
  ],
  [
    '        #######',
    '    #####  #  ####',
    '    #   #        #',
    ' #### #   ## ##  #',
    '##      # #  ## ###',
    '#  ### $#   $   $ #',
    '#.      # ##  #   #',
    '#.  #    @ # ### ##',
    '#.  #  ###        #',
    '######## ##   #   #',
    '          #########'
  ],
  [
    '        #######',
    '    #####  #  ####',
    '    #   #   $    #',
    ' #### #   ## ##  #',
    '##      # #  ## ###',
    '#  ### $#$  $     #',
    '#.      # ##  #   #',
    '#.. #    @ # ### ##',
    '#.. #  ###  $     #',
    '######## ##   #   #',
    '          #########'
  ],
  [
    ' #####',
    ' #   #',
    ' # # #######',
    ' #       @######',
    ' #   ##$ ###   #',
    ' # #### $      #',
    ' # ##### #  #  ####',
    '##  #### ##       #',
    '#   #     # ## ## #',
    '#         # #   # #',
    '######  ###       #',
    '     #### # # ..# #',
    '          # ### # #',
    '          #       #',
    '          #########'
  ],
  [
    ' #####',
    ' #   #',
    ' # # #######',
    ' #      $@######',
    ' #   ##$ ###   #',
    ' # #### $      #',
    ' # ##### #  #  ####',
    '##  #### ##       #',
    '#   #     # ## ## #',
    '#         # #   # #',
    '######  ###       #',
    '     #### # #...# #',
    '          # ### # #',
    '          #       #',
    '          #########'
  ],
  [
    '##### ####',
    '#.  # #  ####',
    '#.  ###  $  #',
    '#    ## $   ###',
    '##    ##      #',
    '###    ##     #',
    '# ##    #     #',
    '#  ## # ### ####',
    '#   # #        #',
    '#    @         #',
    '#   #        ###',
    '#  ######  ###',
    '# ##    ####',
    '###'
  ],
  [
    '##### ####',
    '#...# #  ####',
    '#...###  $  #',
    '#.   ## $  $###',
    '##    ##   $  #',
    '###    ## $ $ #',
    '# ##    #  $  #',
    '#  ## # ### ####',
    '#   # #        #',
    '#    @         #',
    '#   #        ###',
    '#  ######  ###',
    '# ##    ####',
    '###'
  ],
  [
    '##########',
    '#        ####',
    '# ###### #  ##',
    '# # $ $      #',
    '#       #    #',
    '###   $$#  ###',
    '  #  ## #  ##',
    '  ##$#     @#',
    '   #      ###',
    '   # #   $  #',
    '   # ##   # #',
    '  ##  ##### #',
    '  #         #',
    '  #    ...###',
    '  #    ...#',
    '  #########'
  ],
  [
    '##########',
    '#        ####',
    '# ###### #  ##',
    '# # $ $    $ #',
    '#       #$   #',
    '###$  $$#  ###',
    '  #  ## #  ##',
    '  ##$#   $ @#',
    '   #      ###',
    '   # #   $  #',
    '   # ##   # #',
    '  ##  ##### #',
    '  #         #',
    '  #  .....###',
    '  #  .....#',
    '  #########'
  ],
  [
    '         ####',
    ' #########  ##',
    '##           #####',
    '#   ## ##   ## ..#',
    '# #$$ $ $$#$## ..#',
    '# #   @   #    ..#',
    '#  $# ###$$    ..#',
    '#        $ ##  ..#',
    '###        #######',
    '  #  #######',
    '  ####'
  ],
  [
    '  #########',
    '  #...#...#',
    '  #..###..#',
    '  #..###..#',
    '  #       #',
    '  #       #',
    '  ###   ###',
    '    #   #',
    '###### ######',
    '#           #',
    '#   $ $ $   #',
    '## $ $ $ $ ##',
    ' #$ $ $ $ $#',
    ' #   $@$   #',
    ' #  #####  #',
    ' ####   ####'
  ],
  [
    '       ####',
    '       #  ##',
    '       #   ##',
    '       #    ##',
    '     ###     ##',
    '  ####        #',
    '###  # #####  #',
    '#    # #.  .  #',
    '# #$        # #',
    '#  $ # #.  .# #',
    '###  #### ### #',
    '  #### @$  #####',
    '     ### $     #',
    '       #  ##   #',
    '       #########'
  ],
  [
    '      ############',
    '     ##..    #   #',
    '    ##..         #',
    '   ##..  # # #  ##',
    '   #.   # # #    #',
    '####   #  #    # #',
    '#  ## #          #',
    '# @$ $ ###  #   ##',
    '# $   $   # #   #',
    '###$$   # # # # #',
    '  #   $   # # #####',
    '  #  # #####      #',
    '  #    #   #    # #',
    '  #  ###   ##     #',
    '  #  #      #    ##',
    '  ####      ######'
  ]
];
