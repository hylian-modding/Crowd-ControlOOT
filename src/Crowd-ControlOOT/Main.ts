import { EventsClient, EventHandler } from 'modloader64_api/EventHandler';
import { IModLoaderAPI, IPlugin } from 'modloader64_api/IModLoaderAPI';
import { InjectCore } from 'modloader64_api/CoreInjection';
import { Vote, Option } from './Vote';
import { Interpolator } from './Interpolator'
import {
  hurtPlayer, healPlayer, addBankRupees, addRupees, 
  // swapZStyle,
  // scaleScreenStep, scaleScreen, scaleModelStep, scaleModel,
  // motionBlurStep, motionBlur, highFovStep, highFov,
  // stopClockStep, stopClock
} from './Commands'
import * as API from 'modloader64_api/OOT/OOTAPI';

export class CrowdControlMM implements IPlugin {
  @InjectCore() core!: API.IOOTCore;
  ModLoader = {} as IModLoaderAPI;
  name = 'CrowdControlOOT';

  userData: any = [];
  deltaTime = 0;
  runtime = 0;
  voteInterval = 60;
  isVoting = false;
  voteTime = 30;
  lastVoteTime = 0;
  thisVote!: Vote;
  tmiEvt!: any;
  framimetime = 1 / 20;

  constructor() { }

  preinit(): void {
    global.ModLoader["updateFunc"] = undefined;
    global.ModLoader["updateVars"] = [0, new Interpolator(), new Interpolator(), new Interpolator()];
    (this.ModLoader.logger as any)['setLevel']('all');
  }

  init(): void { }
  postinit(): void { }

  onTick(): void {
    this.deltaTime = this.framimetime;
    this.runtime += this.framimetime;

    if (this.runtime % 20 == 0) {
      this.ModLoader.logger.info("time - votetime: " + (this.runtime - this.lastVoteTime).toString() + " votetime: " + this.thisVote.voteTime)
    }

    if (this.runtime - this.lastVoteTime > this.voteInterval && !this.isVoting) {
      let options: Option[] = [];
      options.push(new Option("Hurt", hurtPlayer));
      options.push(new Option("Heal", healPlayer));
      options.push(new Option("Immediate Pay Day", addRupees));
      // options.push(new Option("Pay Day", addBankRupees));
      // options.push(new Option("Swap Z-Target Style", swapZStyle));
      // options.push(new Option("Shrinking Screen", scaleScreen));
      // options.push(new Option("Tiny Lonk", scaleModel));
      // options.push(new Option("Cinematic Motion Blur", motionBlur));
      // options.push(new Option("Quake Pro", highFov));
      // options.push(new Option("stopClock", stopClock));
      this.thisVote = new Vote(options, this.voteTime, "Vote on which effect to apply!", this.tmiEvt);
      this.isVoting = true;
    }

    if (this.thisVote) {
      this.thisVote.update(this.tmiEvt, this.runtime, this.deltaTime);

      if (this.thisVote.voteTime <= 0 || this.thisVote.killMe) {
        let result = this.thisVote.getResult();
        this.tmiEvt.reply("Vote ended! Result is " + result.name)
        global.ModLoader["updateFunc"] = result.func(this.ModLoader.emulator, this.runtime);

        //@ts-ignore
        thisVote = undefined;
        this.isVoting = false;
        this.lastVoteTime = this.runtime;
      }
    }

    if (global.ModLoader["updateFunc"]) global.ModLoader["updateFunc"](this.ModLoader.emulator, this.runtime, this.deltaTime);
  }

  @EventHandler("TMI:onCheer")
  onCheer(evt: any) {
    addRupees(this.ModLoader.emulator, evt.tags.bits);
  }

  @EventHandler("TMI:onMessage")
  onMessage(evt: any) {
    let uId = evt.tags.id;
    let params = evt.msg.split(' ');

    if (params[0] == "!points") {
      evt.reply("You have " + (this.userData[uId] ? this.userData[uId].points : 0).toString() + " points!");
    }

    if (params[0] == "!vote" && this.thisVote) {
      let voteNum = parseInt(params[1]);
      if (!this.thisVote.addVote(uId, voteNum)) {
        evt.reply("Voting failed!")
      }
      else {
        evt.reply("You have successfully voted on " + this.thisVote.options[voteNum].name + "!");
      }
    }

    if (params[0] == "!rvote" && this.thisVote) {
      evt.reply("Removing vote!");
      this.thisVote.removeVote(uId);
    }

    if (params[0] == "!helpvote" && this.thisVote) {
      this.thisVote.redescribe();
    }

    if (params[0] == "!help") {
      evt.reply("Command prefix is !, commands: points, vote, rvote, helpvote")
    }
  }

  @EventHandler("TMI:onConfig")
  onConfig(evt: any) {
    evt.say("Ocarina of Tmie Crowd Control by Drahsid and Denoflions started!");
    this.tmiEvt = evt;
  }

  @EventHandler(EventsClient.ON_INJECT_FINISHED)
  onClient_InjectFinished(evt: any) { }
}
