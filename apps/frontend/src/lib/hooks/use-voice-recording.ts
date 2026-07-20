"use client";

import { useState, useCallback } from "react";

export interface VoiceRecordingState {
  isRecording: boolean;
  audioBlob: Blob | null;
  error: string | null;
}

export function useVoiceRecording() {
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    audioBlob: null,
    error: null,
  });

  const startRecording = useCallback(async () => {
    setState((prev) => ({ ...prev, isRecording: true, error: null }));
  }, []);

  const stopRecording = useCallback(async () => {
    setState((prev) => ({ ...prev, isRecording: false }));
  }, []);

  const clearAudio = useCallback(() => {
    setState((prev) => ({ ...prev, audioBlob: null }));
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    clearAudio,
  };
}
