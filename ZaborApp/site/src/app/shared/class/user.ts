export class User {
    constructor(
        public id: number,
        public name: string,
        public email: string,
        public address: string,
        public city: string,
        public phone: string,
        public role: string,
        public status: number,
        public profilepic: string
    ) { }
}
