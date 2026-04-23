import { getMoveSFXPath, getBattleSFXPath } from './audio-sync';
import { isSoundEnabled } from '../../utils/audio-settings';

// Module-level registry so a single `visibilitychange` listener can silence
// every live AudioManager when the user switches tabs / backgrounds the app.
// Using a Set of WeakRefs prevents the registry from keeping managers alive.
const liveManagers = new Set<AudioManager>();

if (typeof document !== 'undefined') {
	document.addEventListener('visibilitychange', () => {
		if (document.hidden) {
			liveManagers.forEach(mgr => mgr.stopAll());
		}
	});
	// Some mobile browsers fire pagehide instead of visibilitychange.
	window.addEventListener('pagehide', () => {
		liveManagers.forEach(mgr => mgr.stopAll());
	});
}

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
		liveManagers.add(this);
	}

	/** Release this manager from the visibility-pause registry. Call when the battle ends. */
	dispose(): void {
		this.stopAll();
		liveManagers.delete(this);
	}

	async play(path: string): Promise<void> {
		// Respect the user's global sound preference.
		if (!isSoundEnabled()) return;
		// Don't queue audio while the page is hidden; battle SFX for a
		// backgrounded game is noise pollution.
		if (typeof document !== 'undefined' && document.hidden) return;

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
