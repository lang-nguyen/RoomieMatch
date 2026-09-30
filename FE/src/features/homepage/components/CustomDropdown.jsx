import { useState, useRef, useEffect } from 'react';
import '../Homepage.css';

const CustomDropdown = ({ icon, placeholder, options, value, onChange, name }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`custom-dropdown-container ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
      <div className={`dropdown-trigger ${icon ? 'with-icon' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {icon && <span className="dropdown-icon">{icon}</span>}
        <span className="dropdown-value">{selectedOption ? selectedOption.label : placeholder}</span>
        <svg className="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>

      {isOpen && (
        <div className={`dropdown-menu ${icon ? 'with-icon' : ''}`}>
          {/* If options already include a neutral option (value === ''), don't render the placeholder row to avoid duplicate 'Tất cả' */}
          {!options.some(opt => opt.value === '') && (
            <div className="dropdown-option placeholder" onClick={() => handleSelect('')}>
              {placeholder}
            </div>
          )}
          {options.map((option) => (
            <div
              key={option.value}
              className={`dropdown-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
