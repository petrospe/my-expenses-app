import React, { useState, useRef, useEffect } from 'react';

function AutocompleteInput({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  required = false,
  allowNew = true 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [inputValue, setInputValue] = useState(value || '');
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    if (inputValue) {
      const filtered = options.filter(opt =>
        opt.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [inputValue, options]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    onChange(e);
  };

  const handleSelect = (option) => {
    setInputValue(option);
    setIsOpen(false);
    onChange({ target: { value: option } });
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredOptions.length > 0 && isOpen) {
      e.preventDefault();
      handleSelect(filteredOptions[0]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className="form-input autocomplete-input"
        autoComplete="off"
      />
      {isOpen && filteredOptions.length > 0 && (
        <div className="autocomplete-dropdown">
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              className="autocomplete-option"
              onClick={() => handleSelect(option)}
              onMouseEnter={(e) => e.target.classList.add('hovered')}
              onMouseLeave={(e) => e.target.classList.remove('hovered')}
            >
              {option}
            </div>
          ))}
          {allowNew && inputValue && !filteredOptions.includes(inputValue) && (
            <div
              className="autocomplete-option autocomplete-new"
              onClick={() => handleSelect(inputValue)}
            >
              + Προσθήκη "{inputValue}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AutocompleteInput;





