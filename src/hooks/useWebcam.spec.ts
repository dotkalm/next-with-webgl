import { renderHook, waitFor } from '@testing-library/react';
import { useWebcam } from './useWebcam';

// Mock getUserMedia
const mockGetUserMedia = jest.fn();

Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

describe('useWebcam', () => {
  let mockStream: MediaStream;
  let mockTrack: MediaStreamTrack;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console.error to suppress expected errors
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Create mock track
    mockTrack = {
      stop: jest.fn(),
      kind: 'video',
      id: 'mock-track-id',
      label: 'mock camera',
      enabled: true,
      readyState: 'live',
    } as unknown as MediaStreamTrack;

    // Create mock stream
    mockStream = {
      getTracks: jest.fn(() => [mockTrack]),
      getVideoTracks: jest.fn(() => [mockTrack]),
      getAudioTracks: jest.fn(() => []),
      active: true,
      id: 'mock-stream-id',
    } as unknown as MediaStream;

    mockGetUserMedia.mockResolvedValue(mockStream);
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useWebcam());

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.videoRef.current).toBe(null);
  });

  it('should request webcam access with correct constraints', async () => {
    renderHook(() => useWebcam({ width: 1280, height: 720 }));

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });
    });
  });

  it('should handle custom facing mode', async () => {
    renderHook(() => useWebcam({ facingMode: 'environment' }));

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({
            facingMode: 'environment',
          }),
        })
      );
    });
  });

  it('should set error when getUserMedia fails', async () => {
    const errorMessage = 'Camera access denied';
    mockGetUserMedia.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useWebcam());

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isStreaming).toBe(false);
    });

    // Verify console.error was called with the error
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error accessing webcam:',
      expect.any(Error)
    );
  });

  it('should handle non-Error objects in catch', async () => {
    mockGetUserMedia.mockRejectedValueOnce('string error');

    const { result } = renderHook(() => useWebcam());

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to access webcam');
    });

    // Verify console.error was called
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error accessing webcam:',
      'string error'
    );
  });

  it('should not throw on unmount', async () => {
    const { unmount } = renderHook(() => useWebcam());

    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled();
    });

    // Verify unmount doesn't throw
    expect(() => unmount()).not.toThrow();
  });
});