// Sound effects using Web Audio API
class SoundEffects {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Initialize audio context on first user interaction
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext || !this.enabled) return null;
    
    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn('Could not resume audio context');
        return null;
      }
    }
    
    return this.audioContext;
  }

  // Create a simple tone
  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    return new Promise<void>(async (resolve) => {
      const ctx = await this.ensureAudioContext();
      if (!ctx) {
        resolve();
        return;
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
      
      oscillator.onended = () => resolve();
    });
  }

  // Chip drop sound - descending tone
  async playChipDrop() {
    if (!this.enabled) return;
    
    try {
      // Create a falling sound effect
      await this.createTone(800, 0.1, 'sine');
      await new Promise(resolve => setTimeout(resolve, 50));
      await this.createTone(600, 0.1, 'sine');
      await new Promise(resolve => setTimeout(resolve, 50));
      await this.createTone(400, 0.15, 'sine');
    } catch (e) {
      console.warn('Could not play chip drop sound');
    }
  }

  // Win sound - ascending celebratory tones
  async playWin() {
    if (!this.enabled) return;
    
    try {
      const notes = [523, 659, 784, 1047]; // C, E, G, C (major chord)
      for (let i = 0; i < notes.length; i++) {
        this.createTone(notes[i], 0.3, 'triangle');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (e) {
      console.warn('Could not play win sound');
    }
  }

  // Draw sound - neutral tone
  async playDraw() {
    if (!this.enabled) return;
    
    try {
      await this.createTone(440, 0.5, 'square');
    } catch (e) {
      console.warn('Could not play draw sound');
    }
  }

  // Button click sound
  async playClick() {
    if (!this.enabled) return;
    
    try {
      await this.createTone(1000, 0.05, 'square');
    } catch (e) {
      console.warn('Could not play click sound');
    }
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

// Export singleton instance
export const soundEffects = new SoundEffects();
