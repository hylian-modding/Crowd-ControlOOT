// Critically damped spring interpolator by Drahsid

class Interpolator
{
  dampening = 1.0;
  lastUpdate = 0;
  currentPosition = 0;
  targetPosition = 0
  velocity = 0;

  Interpolator() : void {
    this.dampening = 1.0;
    this.lastUpdate = 0.0;
    this.currentPosition = 0.0;
    this.targetPosition = 0.0;
    this.velocity = 0.0;
  }

  Step(newTime: number, logger: any = false): void {
    let dt = newTime - this.lastUpdate;
    let f = this.velocity - (this.currentPosition - this.targetPosition) * (this.dampening * this.dampening * dt);
    let e = 1 + this.dampening * dt;
    this.velocity = f / (e * e);
    this.currentPosition = this.currentPosition + this.velocity * dt;

    this.lastUpdate = newTime;

    if (isNaN(this.currentPosition)) {
      this.currentPosition = 0.0;
      this.velocity = 0.0;
      this.targetPosition = 0.0;
      if (logger) {
        logger.warn("Final position at time " + newTime.toString() + " resulted in NaN, setting positions to 0.0");
      }
    }
  }

  GetPosition(newTime: number, logger: any = false): number{
    this.Step(newTime, logger);
    return this.currentPosition;
  }

  GetTarget(newTime: number, logger: any = false): number{
    this.Step(newTime, logger);
    return this.targetPosition;
  }

  GetVelocity(newTime: number, logger: any = false): number{
    this.Step(newTime, logger);
    return this.velocity;
  }
}

export { Interpolator };


