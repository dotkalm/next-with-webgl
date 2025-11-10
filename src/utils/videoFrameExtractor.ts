import type { TVideoFrame } from "@/types";

export class VideoFrameExtractor {
    private video: HTMLVideoElement | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;

    async load(videoUrl: string): Promise<void> {
        if (typeof window === 'undefined') {
            throw new Error('VideoFrameExtractor requires browser environment');
        }

        this.video = document.createElement('video');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        return new Promise((resolve, reject) => {
            this.video!.onloadedmetadata = () => {
                this.canvas!.width = this.video!.videoWidth;
                this.canvas!.height = this.video!.videoHeight;
                resolve();
            };
            this.video!.onerror = reject;
            this.video!.src = videoUrl;
        });
    }

    extractFrame(timestamp?: number): TVideoFrame {
        if (!this.video || !this.canvas || !this.ctx) {
            throw new Error('Video not loaded');
        }

        if (timestamp !== undefined) {
            this.video.currentTime = timestamp;
        }

        this.ctx.drawImage(this.video, 0, 0);
        const imageData = this.ctx.getImageData(
            0, 0, 
            this.canvas.width, 
            this.canvas.height
        );

        return {
            data: new Uint8Array(imageData.data),
            width: this.canvas.width,
            height: this.canvas.height,
            timestamp: this.video.currentTime
        };
    }
}