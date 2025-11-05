import { useState, useEffect, useCallback } from 'react';
import { VoiceRecognitionState } from '../../../shared/types';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const useVoiceRecognition = () => {
  const [state, setState] = useState<VoiceRecognitionState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    interimTranscript: '',
    error: undefined
  });

  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setState(prev => ({ ...prev, isSupported: false }));
      return;
    }

    const newRecognition = new SpeechRecognition();
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    newRecognition.lang = 'en-US';

    newRecognition.onstart = () => {
      setState(prev => ({
        ...prev,
        isListening: true,
        error: undefined
      }));
    };

    newRecognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setState(prev => ({
        ...prev,
        transcript: prev.transcript + finalTranscript,
        interimTranscript
      }));
    };

    newRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'Speech recognition error';

      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access to use voice input.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone found. Please ensure a microphone is connected.';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition was aborted.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }

      setState(prev => ({
        ...prev,
        isListening: false,
        error: errorMessage
      }));
    };

    newRecognition.onend = () => {
      setState(prev => ({
        ...prev,
        isListening: false,
        interimTranscript: ''
      }));
    };

    setRecognition(newRecognition);
    setState(prev => ({ ...prev, isSupported: true }));

    return () => {
      if (newRecognition) {
        newRecognition.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognition || state.isListening) return;

    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      error: undefined
    }));

    try {
      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to start speech recognition'
      }));
    }
  }, [recognition, state.isListening]);

  const stopListening = useCallback(() => {
    if (!recognition || !state.isListening) return;

    recognition.stop();
  }, [recognition, state.isListening]);

  const resetTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      error: undefined
    }));
  }, []);

  const clearInterimTranscript = useCallback(() => {
    setState(prev => ({ ...prev, interimTranscript: '' }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
    clearInterimTranscript
  };
};