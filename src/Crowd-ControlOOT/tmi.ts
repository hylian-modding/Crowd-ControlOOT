import { IPlugin, IModLoaderAPI, ILogger } from "modloader64_api/IModLoaderAPI";
import { Client, Options } from 'tmi.js';
import fs from 'fs';
import { bus, EventHandler } from "modloader64_api/EventHandler";

class tmi implements IPlugin {

    ModLoader!: IModLoaderAPI;
    pluginName?: string | undefined;
    client!: Client;
    optsFile = "./TMI.json";
    dbFile = "./TMI_db.json";
    opts!: TwitchOpts;
    database: any = {};
    lastSpoke: Map<string, number> = new Map<string, number>();

    preinit(): void {
    }

    init(): void {
    }

    @EventHandler("TMI:onMessage")
    onMessage(evt: any) {
        if (evt.msg === "!points") {
            evt.reply("@" + evt.tags.username + ": You have " + this.database[evt.tags["username"]!] + " points.");
        }
    }

    generateEvt(message: string, channel: string, tags: any, evtname: string, ext: any = {}) {
        if (!this.database.hasOwnProperty(tags["username"]!)) {
            this.database[tags["username"]!] = 0;
        }
        const evt: any = {
            msg: message.toLowerCase(), tags, points: 1,
            reply: (msg: string) => {
                global.ModLoader["TMIClient"].say(channel, msg);
            },
            whisper: (msg: string) => {
                global.ModLoader["TMIClient"].whisper(tags["username"]!, msg);
            },
            balance: this.database[tags["username"]!],
            ext
        };
        bus.emit(evtname, evt);
        this.database[evt.tags["username"]!] += evt.points;
        this.lastSpoke.set(evt.tags["username"]!, Date.now());
        return evt;
    }

    postinit(): void {
        if (fs.existsSync(this.dbFile)) {
            this.database = JSON.parse(fs.readFileSync(this.dbFile).toString());
        } else {
            fs.writeFileSync(this.dbFile, JSON.stringify(this.database, null, 2));
        }
        setInterval(() => {
            this.lastSpoke.forEach(
                (value: number, key: string, map: Map<string, number>) => {
                    this.database[key] += 10;
                }
            );
            fs.writeFileSync(this.dbFile, JSON.stringify(this.database, null, 2));
        }, 60 * 1000);
        setInterval(() => {
            this.lastSpoke.clear();
        }, (60 * 1000) * 15);
        if (fs.existsSync(this.optsFile)) {
            this.opts = JSON.parse(fs.readFileSync(this.optsFile).toString());
            this.client = Client(this.opts);
            this.client.connect();
            global.ModLoader["TMIClient"] = this.client;
            bus.emit("TMI:onConfig", {
                say: (msg: string) => {
                    for (let i = 0; i < this.opts.channels.length; i++) {
                        global.ModLoader["TMIClient"].say(this.opts.channels[i], msg);
                    }
                },
                reply: (msg: string) => {
                    for (let i = 0; i < this.opts.channels.length; i++) {
                        global.ModLoader["TMIClient"].say(this.opts.channels[i], msg);
                    }
                },
                whisper: (username: string, msg: string) => {
                    global.ModLoader["TMIClient"].whisper(username, msg);
                }
            });
            this.client.on('message', (channel, tags, message, self) => {
                if (self) return;
                this.generateEvt(message, channel, tags, "TMI:onMessage");
            });
            this.client.on("cheer", (channel, tags, message) => {
                this.generateEvt(message, channel, tags, "TMI:onCheer");
            });
            this.client.on("resub", (channel, username, months, message, tags, methods) => {
                this.generateEvt(message, channel, tags, "TMI:onResub", { months });
            });
            this.client.on("subgift", (channel, username, streakMonths, recipient, methods, tags) => {
                this.generateEvt("", channel, tags, "TMI:onGiftsub", { streakMonths, recipient });
            });
            this.client.on("submysterygift", (channel, username, numbOfSubs, methods, tags) => {
                this.generateEvt("", channel, tags, "TMI:onMysterysub", { numbOfSubs });
            });
            this.client.on("subscription", (channel, username, method, message, tags) => {
                this.generateEvt(message, channel, tags, "TMI:onSub");
            });
            this.client.on("hosted", (channel, username, viewers, autohost) => {
                this.generateEvt("", channel, { username }, "TMI:onHost", { viewers, autohost });
            });
            this.client.on("raided", (channel, username, viewers) => {
                this.generateEvt("", channel, { username }, "TMI:onRaid", { viewers });
            });
        } else {
            this.ModLoader.logger.error("[TMI]: THIS MOD WILL NOT FUNCTION UNTIL YOU CLOSE MODLOADER AND EDIT TMI.JSON!");
            fs.writeFileSync(this.optsFile, JSON.stringify(new TwitchOpts("", "", []), null, 2));
        }
    }

    onTick(frame?: number | undefined): void {
    }

}

module.exports = tmi;

class TwitchOpts implements Options {
    options: any = { debug: true };
    identity: any = {
        username: "",
        password: ""
    };
    channels: string[] = [];

    constructor(username: string, password: string, channel: string[]) {
        this.identity["username"] = username;
        this.identity["password"] = password;
        this.channels = channel;
    }
}