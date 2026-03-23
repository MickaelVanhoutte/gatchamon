import { getMoveSFXPath, getBattleSFXPath } from './audio-sync';

export class AudioManager {
	private audioPool: HTMLAudioElement[];
	private currentIndex: number = 0;
	private volume: number;

	constructor(poolSize: number = 4, volume: number = 0.5) {
		this.volume = volume;
		this.audioPool = [];
		for (let i = 0; i < poolSize; i++) {
			const audio = new Audio();
			audio.volume = volume;
			this.audioPool.push(audio);
		}
	}

	async play(path: string): Promise<void> {
		const audio = this.audioPool[this.currentIndex];
		this.currentIndex = (this.currentIndex + 1) % this.audioPool.length;

		try {
			audio.src = path;
			audio.currentTime = 0;
			audio.volume = this.volume;
			await audio.play();
		} catch {
			// Silently skip — browser may block or file may not exist
		}
	}

	async playMoveSound(moveSlug: string): Promise<void> {
		const path = getMoveSFXPath(moveSlug);
		if (path) {
			await this.play(path);
		}
	}

	async playBattleSound(key: string): Promise<void> {
		const path = getBattleSFXPath(key);
		if (path) {
			await this.play(path);
		}
	}

	setVolume(v: number): void {
		this.volume = Math.max(0, Math.min(1, v));
		this.audioPool.forEach((audio) => {
			audio.volume = this.volume;
		});
	}

	stopAll(): void {
		this.audioPool.forEach((audio) => {
			audio.pause();
			audio.currentTime = 0;
		});
	}
}
