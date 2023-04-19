import { Database, get, ref, set } from 'firebase/database';

import BoardData from '$scripts/board';
import { loadWords } from '$scripts/utils';

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

    static async join(id: string, database: Database): Promise<MultiplayerGame> {
        const gameRef = ref(database, `games/${id}`);
        const snapshot = await get(gameRef);
        if (!snapshot.exists()) {
            throw new Error(`Game ${id} does not exist`);
        }
        const gameData: GameData = snapshot.val();
        const words = loadWords(gameData.minLength);
        const board = new BoardData(
            gameData.size,
            gameData.chars,
            gameData.minLength,
            words,
        );

        return new MultiplayerGame(id, board);
    }

    static async create(board: BoardData, database: Database): Promise<MultiplayerGame> {
        // get a new unique id
        let id = '';
        do {
            id = newRandomId();
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

export function newRandomId() {
    return Math.random().toString(36).substring(2, 15);
}
