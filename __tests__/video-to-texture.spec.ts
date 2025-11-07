import { createTestContext } from '../src/webgl/createContext';
import { MockVideoFrameExtractor } from '../__mocks__/videoFrameExtractor';

describe('Video frame to WebGL texture pipeline', () => {
    it('processes video frames into textures', async () => {
        const gl = createTestContext();
        const extractor = new MockVideoFrameExtractor();
        
        await extractor.load('test.mp4');
        
        const frame = extractor.extractFrame(0.5);
        expect(frame.data).toBeInstanceOf(Uint8Array);
        expect(frame.width).toBeGreaterThan(0);
        expect(frame.height).toBeGreaterThan(0);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA,
            frame.width, frame.height, 0,
            gl.RGBA, gl.UNSIGNED_BYTE, frame.data
        );

        expect(gl.getError()).toBe(gl.NO_ERROR);
    });
});