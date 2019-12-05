export class Provider {
    constructor(
        public keywordsHex: string, // C# HEX string of the keywords.
        public eventLevel: number,
        public name: string,
        public filterData: string,
    ) { }
}