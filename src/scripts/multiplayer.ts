import { Database, get, ref, set } from 'firebase/database';

import type BoardData from '$scripts/board';
import { newRandomID } from '$scripts/utils';

export interface GameData {
    // information about the board
    size: number;
    chars: string;
    minLength: number;

    // current game state
    wordsFound: string[][];  // list of words for each player
}

export class MultiplayerGame {
    id: string;
    board: BoardData;

    private constructor(id: string, board: BoardData) {
        this.id = id;
        this.board = board;
    }

    static async create(board: BoardData, database: Database): Promise<MultiplayerGame> {
        // get a new unique id
        let id = '';
        do {
            id = newRandomID();
        } while ((await get(ref(database, 'games/' + id))).exists());
        // add the game to the database
        const gameRef = ref(database, 'games/' + id);
        const gameData: GameData = {
            size: board.size,
            chars: board.chars,
            minLength: board.minLength,
            wordsFound: [],
        };
        await set(gameRef, gameData);
        return new MultiplayerGame(id, board);
    }
}
