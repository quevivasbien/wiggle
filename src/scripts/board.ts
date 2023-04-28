import { loadWords, CharDist } from "$scripts/utils";

export default class BoardData {
    size: number;
    chars: string;
    minLength: number;
    words: string[];

    constructor(size: number, chars: string, minLength: number, words?: string[]) {
        if (chars.length !== size * size) {
            throw new Error('Board size does not match number of characters');
        }
        this.size = size;
        this.chars = chars;
        this.minLength = minLength;
        this.words = words ?? loadWords(minLength);
    }

    static random(size: number, minLength: number): BoardData {
        const words = loadWords(minLength);
        const charDist = CharDist.fromWords(words);
        const chars = [];
        for (let i = 0; i < size * size; i++) {
            chars.push(charDist.sample());
        }
        return new BoardData(size, chars.join(''), minLength, words);
    }

    getRow(y: number): string {
        return this.chars.slice(y * this.size, (y + 1) * this.size);
    }

    getRows(): string[] {
        const rows = [];
        for (let y = 0; y < this.size; y++) {
            rows.push(this.getRow(y));
        }
        return rows;
    }

    toIndex(x: number, y: number): number {
        return y * this.size + x;
    }

    toCoords(i: number): [number, number] {
        return [i % this.size, Math.floor(i / this.size)];
    }

    private getNeighbors(i: number, visited: number[]): number[] {
        const [x, y] = this.toCoords(i);
        const neighbors = [
            [x - 1, y - 1],
            [x, y - 1],
            [x + 1, y - 1],
            [x - 1, y],
            [x + 1, y],
            [x - 1, y + 1],
            [x, y + 1],
            [x + 1, y + 1],
        ]
            .filter(([x, y]) => x >= 0 && x < this.size && y >= 0 && y < this.size)
            .map(([x, y]) => this.toIndex(x, y))
            .filter((i) => !visited.includes(i));
        // console.log(`neighbors of ${i} with visited ${visited} are`, neighbors);
        return neighbors;
    }

    // check if a word is on the board, starting at a given index (i)
    private hasWordFrom(word: string, i: number, visited: number[]): boolean {
        if (word[0] === this.chars[i]) {
            let tail = word.slice(1);
            if (tail.length === 0) {
                return true;
            }
            visited.push(i);
            for (const j of this.getNeighbors(i, visited)) {
                if (this.hasWordFrom(tail, j, [...visited])) {
                    return true;
                }
            }
        }
        return false;
    }

    // check if a word is on the board
    hasWord(word: string): boolean {
        word = word.toLowerCase();
        for (let i = 0; i < this.size * this.size; i++) {
            if (this.hasWordFrom(word, i, [])) {
                return true;
            }
        }
        return false;
    }

    // like hasWordFrom, but returns the path taken (or null if the word isn't found)
    private getPathFrom(word: string, i: number, visited: number[]): number[] | null {
        if (word[0] === this.chars[i]) {
            let tail = word.slice(1);
            visited.push(i);
            if (tail.length === 0) {
                return visited;
            }
            for (const j of this.getNeighbors(i, visited)) {
                const path = this.getPathFrom(tail, j, [...visited]);
                if (path) {
                    return path;
                }
            }
        }
        return null;
    }

    getPath(word: string): number[] | null {
        word = word.toLowerCase();
        for (let i = 0; i < this.size * this.size; i++) {
            const path = this.getPathFrom(word, i, []);
            if (path !== null) {
                return path;
            }
        }
        return null;
    }

    findAllWords(): string[] {
        const found = [];
        for (const word of this.words) {
            if (this.hasWord(word)) {
                found.push(word);
            }
        }
        return found;
    }

    checkWord(word: string): string {
        if (word.length < this.minLength) {
            return 'too-short';
        }
        if (!this.words.includes(word)) {
            return 'not-word';
        }
        if (!this.hasWord(word)) {
            return 'not-found';
        }
        return 'ok';
    }
}