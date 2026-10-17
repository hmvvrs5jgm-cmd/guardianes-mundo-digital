import Phaser from 'phaser';
import { PHYSICS, PLAYER } from '../config.js';
import { input } from './InputManager.js';
import { audio } from './AudioManager.js';
import { reducedMotion } from '../ui/helpers.js';

const approach = (value, target, step) => (value < target ? Math.min(value + step, target) : Math.max(value - step, target));

// Alex: movimiento lateral, carrera, salto con margen de tolerancia,
// interacción y retroceso suave al tocar obstáculos de aventura.
export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'alex_idle_0');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.setDepth(10);
    this.body.setSize(30, 74);
    this.body.setOffset(27, 106 - 74);
    this.body.setMaxVelocityY(PHYSICS.maxFallSpeed);
    this.facing = 1;
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.moveHeldMs = 0;
    this.jumpCut = false;
    this.wasOnGround = true;
    this.invulnerableUntil = 0;
    this.hurtUntil = 0;
    this.interactUntil = 0;
    this.controlsEnabled = true;
    this.play('alex_idle');

    this.shadow = scene.add.image(x, y, 'shadow').setDepth(9).setAlpha(0.6);
    this.dust = scene.add.particles(0, 0, 'p_dot', {
      lifespan: 380, speed: { min: 30, max: 90 }, angle: { min: 200, max: 340 },
      scale: { start: 0.9, end: 0 }, alpha: { start: 0.7, end: 0 }, tint: 0xe8ffe0, emitting: false
    }).setDepth(9);
  }

  get onGround() {
    return this.body.blocked.down || this.body.touching.down;
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000;
    const body = this.body;
    const hurt = time < this.hurtUntil;
    const canControl = this.controlsEnabled && !hurt;

    let dir = 0;
    if (canControl) dir = (input.isDown('right') ? 1 : 0) - (input.isDown('left') ? 1 : 0);
    if (dir !== 0) {
      this.facing = dir;
      this.moveHeldMs += delta;
    } else {
      this.moveHeldMs = 0;
    }

    const onGround = this.onGround;
    const running = dir !== 0 && (input.isDown('run') || this.moveHeldMs > PHYSICS.runAfterMs);
    const target = dir * (running ? PHYSICS.runSpeed : PHYSICS.walkSpeed);
    if (!hurt) {
      const accel = dir === 0 && onGround ? PHYSICS.dragGround : onGround ? PHYSICS.accelGround : PHYSICS.accelAir;
      body.setVelocityX(approach(body.velocity.x, target, accel * dt));
    }

    // Salto con "coyote time" y búfer de salto
    if (onGround) {
      this.coyote = PHYSICS.coyoteMs;
      if (!this.wasOnGround && body.velocity.y >= 0) this.onLand();
    } else {
      this.coyote -= delta;
    }
    if (canControl && input.justPressed('jump')) this.jumpBuffer = PHYSICS.jumpBufferMs;
    else this.jumpBuffer -= delta;

    if (this.jumpBuffer > 0 && this.coyote > 0 && canControl) {
      body.setVelocityY(-PHYSICS.jumpVelocity);
      this.jumpBuffer = 0;
      this.coyote = 0;
      this.jumpCut = false;
      audio.sfx('jump');
      this.dust.explode(6, this.x, this.y - 4);
      if (!reducedMotion()) this.scene.tweens.add({ targets: this, scaleX: 0.88, scaleY: 1.12, duration: 90, yoyo: true });
    }
    if (!this.jumpCut && body.velocity.y < 0 && !input.isDown('jump')) {
      body.setVelocityY(body.velocity.y * PHYSICS.jumpCutMultiplier);
      this.jumpCut = true;
    }
    this.wasOnGround = onGround;

    this.setFlipX(this.facing < 0);
    this.updateAnimation(time, onGround, hurt);

    // Sombra en el suelo
    this.shadow.setPosition(this.x, this.y - 4).setVisible(onGround).setScale(Math.abs(body.velocity.x) > 200 ? 0.8 : 0.7, 0.7);
    if (time < this.invulnerableUntil) this.setAlpha(Math.floor(time / 90) % 2 ? 0.45 : 1);
    else this.setAlpha(1);
  }

  updateAnimation(time, onGround, hurt) {
    const vx = Math.abs(this.body.velocity.x);
    let anim;
    if (hurt) anim = 'alex_hurt';
    else if (!onGround) anim = this.body.velocity.y < 0 ? 'alex_jump' : 'alex_fall';
    else if (time < this.interactUntil) anim = 'alex_interact';
    else if (this.cheering) anim = 'alex_cheer';
    else if (vx > PHYSICS.walkSpeed + 25) anim = 'alex_run';
    else if (vx > 25) anim = 'alex_walk';
    else anim = 'alex_idle';
    if (this.anims.currentAnim?.key !== anim) this.play(anim, true);
  }

  onLand() {
    audio.sfx('land');
    this.dust.explode(8, this.x, this.y - 4);
    if (!reducedMotion()) this.scene.tweens.add({ targets: this, scaleX: 1.12, scaleY: 0.9, duration: 80, yoyo: true });
  }

  playInteract() {
    this.interactUntil = this.scene.time.now + 420;
    this.play('alex_interact', true);
  }

  // Devuelve true si el golpe se aplicó.
  hurt(fromX) {
    const now = this.scene.time.now;
    if (now < this.invulnerableUntil) return false;
    this.invulnerableUntil = now + PLAYER.invulnerableMs;
    this.hurtUntil = now + 380;
    const dir = this.x < fromX ? -1 : 1;
    this.body.setVelocity(dir * 260, -380);
    audio.sfx('hurt');
    if (!reducedMotion()) this.scene.cameras.main.shake(140, 0.004);
    return true;
  }

  stop() {
    this.body.setVelocity(0, this.body.velocity.y);
    this.moveHeldMs = 0;
  }

  respawn(x, y) {
    this.setPosition(x, y);
    this.body.reset(x, y);
    this.body.setVelocity(0, 0);
    this.invulnerableUntil = this.scene.time.now + 1000;
  }

  destroy(fromScene) {
    this.shadow?.destroy();
    this.dust?.destroy();
    super.destroy(fromScene);
  }
}
