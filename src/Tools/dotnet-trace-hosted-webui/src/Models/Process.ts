export class Process {
    constructor(id: number, name: string, mainModule: string) {
        this.id = id;
        this.name = name;
        this.mainModule = mainModule;
    }
    
    public id: number;
    public name: string;
    public mainModule: string;
}