import words from '../data/words.json';

export function loadWords(minLength: number): string[] {
    return words
        .map((w) => compressQu(w))
        .filter((w) => w.length >= minLength);
}

export class CharDist {
    dist: number[];

    constructor(dist: number[]) {
        if (dist.length !== 26) {
            throw new Error('CharDist must have 26 elements');
        }
        this.dist = dist;
    }

    static fromWords(words: string[]): CharDist {
        const dist = new Array(26).fill(0);
        for (const word of words) {
            for (const c of word) {
                dist[c.charCodeAt(0) - 97] += 1;
            }
        }
        const totalChars = dist.reduce((a, b) => a + b, 0);
        return new CharDist(dist.map((n) => n / totalChars));
    }

    sample() {
        const r = Math.random();
        let sum = 0;
        for (let i = 0; i < 26; i++) {
            sum += this.dist[i];
            if (r < sum) {
                return String.fromCharCode(i + 97);
            }
        }
        return 'z';
    }
}

export function compressQu(word: string) {
    return word.replace('qu', 'q');
}

export function expandQu(word: string) {
    return word.replace('q', 'qu');
}
