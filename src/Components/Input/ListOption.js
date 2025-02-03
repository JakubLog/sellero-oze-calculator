import React, { useEffect, useState } from 'react';
import './Styles/MultiListInput.css';

const ListOption = ({ option, handleFormChange }) => {
  const [inputValue1, setInputValue1] = useState(1);
  const [inputValue2, setInputValue2] = useState(0);
  const [isSelected, setSelectedState] = useState(false);

  const handleInputChange1 = (e) => {
    const value = Number(e.target.value);
    setInputValue1(value);
  };

  const handleInputChange2 = (e) => {
    const value = Number(e.target.value);
    setInputValue2(value);
  };

  const handleOptionClick = () => {
    setSelectedState((prev) => !prev);
  };

  useEffect(() => {
    console.log(option);
    if (isSelected) {
      handleFormChange(option?.name || option, { value: inputValue1, price: option?.price || inputValue2 });
    } else {
      handleFormChange(option?.name || option, {});
    }
  }, [isSelected, inputValue1, inputValue2]);

  return (
    <div className="option">
      <li key={option} className={isSelected ? 'selected' : ''} style={{ position: 'relative' }}>
        <div
          onClick={handleOptionClick}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            cursor: 'pointer',
            height: '100%'
          }}
        ></div>
        <div>{option?.name || option}</div>
        <div style={{ display: isSelected ? 'block' : 'none' }}>
          <label htmlFor={option?.name || option}>Sztuki</label>
          <input type="number" id={option?.name || option} min={1} onChange={handleInputChange1} value={inputValue1} name={option?.name || option} />
          <label htmlFor={`price-${option?.name || option}`}>{`Cena [zł]`}</label>
          <input
            id={`price-${option?.name || option}`}
            min={0}
            type="number"
            onChange={handleInputChange2}
            disabled={option?.price ? true : false}
            value={option?.price || inputValue2}
            name={'price-' + option?.name || option}
          />
        </div>
      </li>
    </div>
  );
};

export default ListOption;
