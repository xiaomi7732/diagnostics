export class TraceSession {
    constructor(
        public processId: number,
        public sessionId: number,
        public type: number,
    ) { };
}