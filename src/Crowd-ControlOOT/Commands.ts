import { Interpolator } from './Interpolator'

export function hurtPlayer(emulator: any): void {
    let currentHp = emulator.rdramRead16(0x801EF6A6);
    let maxHp = emulator.rdramRead16(0x801EF6A4)
    let damage = Math.round(maxHp / 4) + 1
    emulator.rdramWrite16(0x801EF6A6, currentHp - damage);
}

export function healPlayer(emulator: any): void {
    let currentHp = emulator.rdramRead16(0x801EF6A6);
    emulator.rdramWrite16(0x801EF6A6, currentHp + 4);
}

export function addBankRupees(emulator: any, money: number = 500) {
    let currentRupees = emulator.rdramRead16(0x801F054E)
    emulator.rdramWrite16(0x801F054E, currentRupees + money) // Potential overflow Kappa
}

export function addRupees(emulator: any, money: number = 100): void {
    let currentRupees = emulator.rdramRead16(0x801F0688)
    emulator.rdramWrite16(0x801F0688, currentRupees + money) // Potential overflow Kappa
}

// export function swapZStyle(emulator: any): void {
//     let currentStyle = emulator.rdramRead8(0x801F35B5);
//     emulator.rdramWrite8(0x801F35B5, currentStyle == 1 ? 0 : 1);
// }

// export function scaleScreenStep(emulator: any): void {
//     emulator.rdramWrite8(0x801F35D0, 1);
//     let currentScale = emulator.rdramReadF32(0x801F35D4)
//     emulator.rdramWriteF32(0x801F35D4, currentScale * 0.95)

//     if (currentScale <= 0.1) {
//         //@ts-ignore
//         global.ModLoader["updateFunc"] = undefined;
//         emulator.rdramWriteF32(0x801F35D4, 1000)
//     }
// }

// export function scaleScreen(emulator: any): Function {
//     emulator.rdramWrite8(0x801F35D0, 1);
//     let currentScale = emulator.rdramReadF32(0x801F35D4)
//     emulator.rdramWriteF32(0x801F35D4, currentScale * 0.9)
//     return scaleScreenStep;
// }

// export function scaleModelStep(emulator: any, rtime: number, deltaTime: number): void {
//     global.ModLoader["updateVars"][1].Step(rtime)
//     global.ModLoader["updateVars"][2].Step(rtime)
//     global.ModLoader["updateVars"][3].Step(rtime)

//     emulator.rdramWriteF32(0x803FFE08, global.ModLoader["updateVars"][1].currentPosition);
//     emulator.rdramWriteF32(0x803FFE0C, global.ModLoader["updateVars"][2].currentPosition);
//     emulator.rdramWriteF32(0x803FFE10, global.ModLoader["updateVars"][3].currentPosition);

//     if (rtime - global.ModLoader["updateVars"][0] > 30) {
//         //@ts-ignore
//         global.ModLoader["updateFunc"] = undefined;
//         emulator.rdramWriteF32(0x803FFE08, 0x3C23);
//         emulator.rdramWriteF32(0x803FFE0C, 0x3C23);
//         emulator.rdramWriteF32(0x803FFE10, 0x3C23);
//     }
// }

// export function scaleModel(emulator: any, rtime: number): Function {
//     global.ModLoader["updateVars"][0] = rtime;
//     global.ModLoader["updateVars"][1] = new Interpolator();
//     global.ModLoader["updateVars"][1].dampening = 2;
//     global.ModLoader["updateVars"][2] = new Interpolator();
//     global.ModLoader["updateVars"][2].dampening = 2;
//     global.ModLoader["updateVars"][3] = new Interpolator();
//     global.ModLoader["updateVars"][3].dampening = 2;

//     let cx = emulator.rdramReadF32(0x803FFE08);
//     let cy = emulator.rdramReadF32(0x803FFE0C);
//     let cz = emulator.rdramReadF32(0x803FFE10);

//     global.ModLoader["updateVars"][1].targetPosition = 0.01;
//     global.ModLoader["updateVars"][2].targetPosition = 0.01;
//     global.ModLoader["updateVars"][3].targetPosition = 0.01;

//     return scaleModelStep;
// }

// export function motionBlurStep(emulator: any, rtime: number, deltaTime: number): void {
//     global.ModLoader["updateVars"][1].Step(rtime)

//     let newBlur = Math.round(global.ModLoader["updateVars"][1].currentPosition);

//     if (rtime - global.ModLoader["updateVars"][0] > 20) {
//         global.ModLoader["updateVars"][1].targetPosition = 0;
//     }

//     emulator.rdramWrite8(0x80382659, newBlur);
//     emulator.rdramWrite8(0x8038265A, 0xFF);

//     if (rtime - global.ModLoader["updateVars"][0] > 30) {
//         //@ts-ignore
//         global.ModLoader["updateFunc"] = undefined;
//         emulator.rdramWrite8(0x80382659, 0);
//         emulator.rdramWrite8(0x8038265A, 0x00);
//     }
// }

// export function motionBlur(emulator: any, rtime: number): Function {
//     global.ModLoader["updateVars"][0] = rtime;
//     global.ModLoader["updateVars"][1] = new Interpolator();
//     global.ModLoader["updateVars"][1].dampening = 10;
//     global.ModLoader["updateVars"][1].targetPosition = 230;
//     return motionBlurStep
// }

// export function highFovStep(emulator: any, rtime: number, deltaTime: number): void {
//     global.ModLoader["updateVars"][1].Step(rtime)

//     let pos = global.ModLoader["updateVars"][1].currentPosition;

//     if (rtime - global.ModLoader["updateVars"][0] > 20) {
//         global.ModLoader["updateVars"][1].targetPosition = 60;
//     }

//     emulator.rdramWriteF32(0x803E6BF0, pos);

//     if (rtime - global.ModLoader["updateVars"][0] > 30) {
//         //@ts-ignore
//         global.ModLoader["updateFunc"] = undefined;
//         emulator.rdramWriteF32(0x803E6BF0, 60);
//     } 
// }

// export function highFov(emulator: any, rtime: number): Function {
//     global.ModLoader["updateVars"][0] = rtime;
//     global.ModLoader["updateVars"][1] = new Interpolator();
//     global.ModLoader["updateVars"][1].dampening = 12;
//     global.ModLoader["updateVars"][1].targetPosition = 123;
//     return highFovStep
// }

// export function stopClockStep(emulator: any, rtime: number, deltaTime: number): void {
//     let TimeSpeed = 0;
//     let cdt = rtime - global.ModLoader["updateVars"][0];
//     if (cdt > 1) {
//         TimeSpeed = -1;
//     }
//     if (cdt > 2) {
//         TimeSpeed = -2
//     }
//     if (cdt > 3) {
//         TimeSpeed = -3
//     }

//     emulator.rdramWrite32(0x801EF684, TimeSpeed);

//     if (cdt > 30) {
//         //@ts-ignore
//         global.ModLoader["updateFunc"] = undefined;
//         emulator.rdramWrite32(0x801EF684, 0);
//     }
// }

// export function stopClock(emulator: any, rtime: number): Function {
//     global.ModLoader["updateVars"][0] = rtime;
//     return stopClockStep;
// }