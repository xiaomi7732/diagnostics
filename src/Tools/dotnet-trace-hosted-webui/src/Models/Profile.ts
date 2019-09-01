import { Provider } from "./Provider";

export class Profile {
    constructor(
        public name: string,
        public description: string,
        public providers: Provider[]
    ) { }
}