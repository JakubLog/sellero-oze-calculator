import React, { useEffect, useState } from 'react';
import './Styles/MultiListInput.css';
import ListOption from './ListOption';

const MultiListInput = ({ options, Title, handleForm, isCustomOption = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customOption, setCustomOption] = useState('');
  const [allOptions, setAllOptions] = useState(options);

  useEffect(() => {
    setAllOptions(options);
  }, [options]);

  const handleFormChange = (option, value) => {
    const readyObject = {
      name: `Opcja-${option}`,
      value
    };
    if (readyObject && Object.keys(readyObject).length > 0) handleForm({ target: { ...readyObject } });
  };

  return (
    <div className="multi-list-input">
      <div className="selected-title" style={{ marginBottom: 10 }} onClick={() => setIsOpen(!isOpen)}>
        {Title}
      </div>
      <ul className="options-list">
        {allOptions.map((option) => (
          <ListOption key={option} option={option} handleFormChange={handleFormChange} />
        ))}
        {isCustomOption && (
          <div className="customOptionItem">
            <input type="text" value={customOption} onChange={(e) => setCustomOption(e.target.value)} />
            <button
              type="button"
              onClick={() => {
                setAllOptions((r) => {
                  const newArray = [...r, customOption];
                  return newArray;
                });
                setCustomOption('');
              }}
            >
              Dodaj
            </button>
          </div>
        )}
      </ul>
    </div>
  );
};

export default MultiListInput;
