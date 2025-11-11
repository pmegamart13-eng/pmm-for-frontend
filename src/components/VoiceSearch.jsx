import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const VoiceSearch = ({ onSearch, onFilterClick }) => {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.lang = i18n.language === 'gu' ? 'gu-IN' : 'en-US';
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        onSearch(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [i18n.language]);

  const toggleListening = () => {
    if (!recognition) {
      console.log('Speech recognition not supported');
      return;
    }

    if (isListening) {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsListening(false);
      }
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsListening(false);
      }
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <form onSubmit={handleSearch} className="w-full" data-testid="voice-search-form">
      <div className="relative flex items-center gap-2 bg-white rounded-full border-2 border-gray-200 focus-within:border-lime-500 transition-colors shadow-sm">
        <Search className="absolute left-4 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={i18n.t('searchPlaceholder')}
          className="flex-1 pl-12 pr-32 h-12 border-0 focus-visible:ring-0 rounded-full text-sm"
          data-testid="search-input"
        />
        <div className="absolute right-2 flex items-center gap-1">
          {searchQuery && (
            <Button
              type="button"
              onClick={handleClear}
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-600" />
            </Button>
          )}
          {onFilterClick && (
            <Button
              type="button"
              onClick={onFilterClick}
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-gray-100"
              data-testid="filter-button"
            >
              <SlidersHorizontal className="w-4 h-4 text-gray-600" />
            </Button>
          )}
          {recognition && (
            <Button
              type="button"
              onClick={toggleListening}
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-full ${isListening ? 'bg-red-100 hover:bg-red-200' : 'hover:bg-gray-100'}`}
              data-testid="voice-search-button"
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-red-600" />
              ) : (
                <Mic className="w-4 h-4 text-gray-600" />
              )}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};