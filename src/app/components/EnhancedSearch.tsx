import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { debounce } from 'lodash';

interface SearchComponentProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    darkMode?: boolean;
    placeholder?: string;
}

const EnhancedSearch: React.FC<SearchComponentProps> = ({
    searchTerm,
    setSearchTerm,
    darkMode = false,
    placeholder = "Search users..."
}) => {
    const [inputFocused, setInputFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

    // Create a debounced search function to prevent too many updates
    const debouncedSearch = useRef(
        debounce((term: string) => {
            setSearchTerm(term);
        }, 300)
    ).current;

    // Update local state when the prop changes
    useEffect(() => {
        setLocalSearchTerm(searchTerm);
    }, [searchTerm]);

    // Clean up debounce on unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalSearchTerm(value);
        debouncedSearch(value);
    };

    const handleClearSearch = () => {
        setLocalSearchTerm('');
        setSearchTerm('');
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Handle keyboard shortcut (Ctrl/Cmd + F or /)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if Ctrl+F or Cmd+F or / was pressed
            if ((e.key === 'f' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && document.activeElement === document.body)) {
                e.preventDefault();
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <div className="relative w-full max-w-md">
            <div
                className={`flex items-center rounded-lg border transition-colors ${inputFocused
                        ? darkMode
                            ? 'border-blue-400 bg-gray-800'
                            : 'border-blue-500 bg-white'
                        : darkMode
                            ? 'border-gray-600 bg-gray-800'
                            : 'border-gray-300 bg-white'
                    }`}
            >
                <div className="flex-shrink-0 pl-3">
                    <Search
                        size={18}
                        className={`${darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                    />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={localSearchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    className={`w-full px-3 py-2 outline-none rounded-lg ${darkMode
                            ? 'bg-gray-800 text-white placeholder-gray-400'
                            : 'bg-white text-gray-800 placeholder-gray-500'
                        }`}
                    aria-label="Search users"
                />
                {localSearchTerm && (
                    <button
                        type="button"
                        onClick={handleClearSearch}
                        className={`flex-shrink-0 p-1 mr-1 rounded-full ${darkMode
                                ? 'text-gray-300 hover:bg-gray-700'
                                : 'text-gray-500 hover:bg-gray-100'
                            }`}
                        aria-label="Clear search"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Search keyboard shortcut hint */}
            <div
                className={`absolute right-3 top-2 hidden md:flex items-center text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'
                    } ${inputFocused || localSearchTerm ? 'hidden' : ''}`}
            >
                <span className="px-1.5 py-0.5 border rounded">
                    Ctrl+F
                </span>
            </div>
        </div>
    );
};

export default EnhancedSearch;