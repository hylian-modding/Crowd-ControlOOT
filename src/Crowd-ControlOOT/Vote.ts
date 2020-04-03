export class Option {
    public name: string = "";
    public votes: number[] = [];
    public func: Function;
    public killMe: number = 0;

    public constructor(n: string, f: Function) {
        this.name = n;
        this.func = f;
        this.votes = [];
    }

    addVote(uId: number): number {
        for (let i = 0; i < this.votes.length; i++) {
            if (this.votes[i] == uId) {
                return 0;
            }
        }

        this.votes.push(uId);
        return 1;
    }

    removeVote(uId: number) : number {
        for (let i = 0; i < this.votes.length; i++) {
            if (this.votes[i] == uId) {
                this.votes.splice(i, 1);
                return 1;
            }
        }

        return 0;
    }
}

export class Vote {
    public options: Option[] = [];
    public voters: number[] = [];
    public voteTime: number = 0;
    public voteDescription: string = "";
    public repeatCooldown: number = 0;
    public tmiEvt: any;
    killMe = 0;

    public constructor(opt: Option[], time: number, desc: string, evt: any) {
        this.options = opt;
        this.voters = [];
        this.voteTime = time;
        this.voteDescription = desc;
        this.tmiEvt = evt;
        this.repeatCooldown = 0;
        this.killMe = 0;
        let sayString = this.voteDescription + " You have " + this.voteTime + " second to vote!"
        + "Options: ";
        
        let i = 0;
        for (i; i < this.options.length; i++) {
            sayString = sayString + " " + i.toString() + ": " + this.options[i].name;
        }

        evt.reply(sayString);
    }

    getResult(): Option {
        let bestOption: Option = this.options[0];
        let bestVotes = 0;
        let i = 0;
        for (i; i < this.options.length; i++) {
            if (this.options[i].votes.length > bestVotes) {
                bestOption = this.options[i];
                bestVotes = this.options[i].votes.length;
            }
        }

        return bestOption;
    }

    redescribe() {
        if (this.repeatCooldown <= 0) {
            this.tmiEvt.reply(this.voteDescription + " You have " + this.voteTime + " second to vote!");
            this.repeatCooldown = 5;
        }
    }

    addVote(uId: number, opt: number) : number {
        let i = 0;
        for (i; i < this.voters.length; i++) {
            if (this.voters[i] == uId) {
                this.removeVote(uId);
                break;
            }
        }
        if (this.options[opt]) return this.options[opt].addVote(uId);
        else return 0;
    }

    removeVote(uId: number) {
        let i = 0;
        for (i; i < this.options.length; i++) {
            if (this.options[i].removeVote(uId)) return;
        }
    }

    update(evt: any, time: number, dt: number) {
        this.voteTime -= dt;
        this.repeatCooldown -= dt;
        if (this.voteTime <= 0 || this.killMe == 1) {
            this.killMe = 1;
        }
    }
}