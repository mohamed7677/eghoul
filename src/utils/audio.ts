// Cinematic Horror Web Audio API Sound Generator
class DarkAmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private pulseOsc: OscillatorNode | null = null;
  private pulseGain: GainNode | null = null;
  private isDroneActive: boolean = false;

  private initContext() {
    if (!this.ctx) {
      // @ts-ignore
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public startAmbientDrone() {
    if (this.isDroneActive) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const ctx = this.ctx;
      
      // 1. Low pass filter for heavy bass rumble
      this.filter = ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.setValueAtTime(80, ctx.currentTime);
      this.filter.Q.setValueAtTime(5, ctx.currentTime);

      // 2. Main low drone oscillator (Sub-bass, 45Hz)
      this.droneOsc1 = ctx.createOscillator();
      this.droneOsc1.type = "sawtooth";
      this.droneOsc1.frequency.setValueAtTime(45, ctx.currentTime);

      // 3. Second detuned drone oscillator (45.8Hz for slow beating effect)
      this.droneOsc2 = ctx.createOscillator();
      this.droneOsc2.type = "sine";
      this.droneOsc2.frequency.setValueAtTime(45.8, ctx.currentTime);

      // 4. Drone Gain (keeps volume low and safe)
      this.droneGain = ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.0, ctx.currentTime);
      this.droneGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 3.0); // gradual fade in

      // 5. Connect drone
      this.droneOsc1.connect(this.filter);
      this.droneOsc2.connect(this.filter);
      this.filter.connect(this.droneGain);
      this.droneGain.connect(ctx.destination);

      // 6. Slow ambient volume modulator (LFO) for wave effect
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // very slow, 12 seconds per cycle
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.1, ctx.currentTime);
      
      lfo.connect(lfoGain);
      if (this.droneGain.gain) {
        // @ts-ignore
        lfoGain.connect(this.droneGain.gain);
      }

      // Start oscillators
      this.droneOsc1.start();
      this.droneOsc2.start();
      lfo.start();

      this.isDroneActive = true;
    } catch (err) {
      console.warn("Could not start ambient drone synth:", err);
    }
  }

  public stopAmbientDrone() {
    if (!this.isDroneActive) return;
    try {
      const ctx = this.ctx;
      if (ctx && this.droneGain) {
        const currentGain = this.droneGain.gain.value;
        this.droneGain.gain.setValueAtTime(currentGain, ctx.currentTime);
        this.droneGain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + 1.0); // Fades out in 1 sec
        
        const osc1 = this.droneOsc1;
        const osc2 = this.droneOsc2;
        setTimeout(() => {
          try {
            osc1?.stop();
            osc2?.stop();
          } catch (e) {}
        }, 1100);
      }
      this.isDroneActive = false;
    } catch (err) {
      console.warn("Could not stop ambient drone synth:", err);
    }
  }

  // Heartbeat pulse effect
  public playHeartbeat() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const ctx = this.ctx;

      const playPulse = (delay: number, pitch: number, vol: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filt = ctx.createBiquadFilter();

        filt.type = "lowpass";
        filt.frequency.setValueAtTime(60, ctx.currentTime + delay);

        osc.type = "sine";
        osc.frequency.setValueAtTime(pitch, ctx.currentTime + delay);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + delay + 0.3);

        gain.gain.setValueAtTime(0.0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.35);

        osc.connect(filt);
        filt.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.4);
      };

      // Double beat: Thump-thump
      playPulse(0, 55, 0.7);
      playPulse(0.22, 50, 0.5);
    } catch (e) {}
  }

  // Sizzle when item is added to cart
  public playSizzle() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const ctx = this.ctx;

      // Generate a quick splash of high-frequency white noise + a minor high tone
      const bufferSize = ctx.sampleRate * 0.15; // 150ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(1200, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(2, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.12, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      // High crisp tone
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);

      oscGain.gain.setValueAtTime(0.05, ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      noise.start();
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }

  // Glitch effect on successful order
  public playGlitchSound() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const ctx = this.ctx;

      // Low frequency wave mixed with static glitch bursts
      const time = ctx.currentTime;
      const duration = 0.8;

      const mainOsc = ctx.createOscillator();
      mainOsc.type = "sawtooth";
      mainOsc.frequency.setValueAtTime(110, time);
      mainOsc.frequency.setValueAtTime(30, time + 0.2);
      mainOsc.frequency.setValueAtTime(180, time + 0.4);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300, time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.setValueAtTime(0.02, time + 0.15);
      gain.gain.setValueAtTime(0.12, time + 0.2);
      gain.gain.linearRampToValueAtTime(0.001, time + duration);

      mainOsc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      // Random noise bursts
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Create bitcrushed digital white noise
        const val = Math.random() * 2 - 1;
        data[i] = Math.round(val * 4) / 4; 
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, time);
      noiseGain.gain.setValueAtTime(0.01, time + 0.1);
      noiseGain.gain.setValueAtTime(0.06, time + 0.2);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      mainOsc.start(time);
      mainOsc.stop(time + duration);
      noise.start(time);
    } catch (e) {}
  }
}

export const audioSynth = new DarkAmbientSynthesizer();
