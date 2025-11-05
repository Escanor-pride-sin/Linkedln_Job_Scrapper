import React, { useState } from 'react';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscriptComplete: (transcript: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptComplete,
  placeholder = 'Tap the microphone to speak',
  disabled = false,
  className = ''
}) => {
  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceRecognition();

  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleListening = () => {
    if (!isSupported || disabled || isProcessing) return;

    if (isListening) {
      stopListening();
      // If we have a transcript, send it to parent
      if (transcript.trim()) {
        handleTranscriptComplete();
      }
    } else {
      startListening();
    }
  };

  const handleTranscriptComplete = async () => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    try {
      await onTranscriptComplete(transcript.trim());
      resetTranscript();
    } catch (error) {
      console.error('Error processing transcript:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = () => {
    if (transcript.trim()) {
      handleTranscriptComplete();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && transcript.trim()) {
      e.preventDefault();
      handleTranscriptComplete();
    }
  };

  if (!isSupported) {
    return (
      <div className={`p-4 border border-yellow-200 bg-yellow-50 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2 text-yellow-800">
          <Volume2 size={20} />
          <p className="text-sm">
            Voice input is not supported in your browser. Please try Chrome or Edge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Microphone Button */}
      <div className="flex justify-center">
        <button
          onClick={handleToggleListening}
          disabled={disabled || isProcessing}
          className={`
            relative w-20 h-20 rounded-full flex items-center justify-center
            transition-all duration-200 transform hover:scale-105
            focus:outline-none focus:ring-4 focus:ring-blue-200
            ${disabled || isProcessing
              ? 'bg-gray-300 cursor-not-allowed'
              : isListening
                ? 'bg-red-500 hover:bg-red-600 voice-recording'
                : 'bg-blue-500 hover:bg-blue-600'
            }
            text-white shadow-lg
          `}
          aria-label={isListening ? 'Stop recording' : 'Start recording'}
        >
          {isProcessing ? (
            <Loader2 size={32} className="animate-spin" />
          ) : isListening ? (
            <MicOff size={32} />
          ) : (
            <Mic size={32} />
          )}
        </button>
      </div>

      {/* Status Text */}
      <div className="text-center">
        {error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : isListening ? (
          <p className="text-blue-600 text-sm font-medium animate-pulse">
            Listening... Speak now!
          </p>
        ) : isProcessing ? (
          <p className="text-gray-600 text-sm font-medium">
            Processing your expense...
          </p>
        ) : (
          <p className="text-gray-600 text-sm">{placeholder}</p>
        )}
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="min-h-[60px]">
            <p className="text-gray-800 whitespace-pre-wrap">
              {transcript}
              {interimTranscript && (
                <span className="text-gray-400 italic">{interimTranscript}</span>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 mt-3">
            {transcript && !isProcessing && (
              <>
                <button
                  onClick={resetTranscript}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear
                </button>
                {isListening && (
                  <button
                    onClick={() => {
                      stopListening();
                      handleManualSubmit();
                    }}
                    className="px-4 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Done
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Voice Input Tips */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>Try saying things like:</p>
        <p className="italic">"I spent $25 at Starbucks for coffee"</p>
        <p className="italic">"Paid $50 for gas yesterday"</p>
        <p className="italic">"Bought groceries for $120 this morning"</p>
      </div>

      {/* Accessibility */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isListening && 'Voice recording is active'}
        {error && `Error: ${error}`}
        {isProcessing && 'Processing voice input'}
      </div>
    </div>
  );
};