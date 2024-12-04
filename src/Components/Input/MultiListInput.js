import React, { useState } from 'react';
import './Styles/MultiListInput.css';
import InputNumber from './InputNumber';

const MultiListInput = ({ options, Title, handleForm }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const handleOptionClick = (option) => {
        const newSelectedOptions = selectedOptions.includes(option)
            ? selectedOptions.filter((item) => item !== option)
            : [...selectedOptions, option];
        setSelectedOptions(newSelectedOptions);
        handleForm({target: { name: Title, value: JSON.stringify(newSelectedOptions)}});
    };

    return (
        <div className="multi-list-input">
            <div className="selected-title" onClick={() => setIsOpen(!isOpen)}>
                {Title}
            </div>
            <div className="selected-options"><b>Wybrano</b>: {selectedOptions.join(", ") || "brak"}</div>
                <ul className="options-list">
                    {options.map((option) => (
                        <div className="option">
                        <li
                            key={option}
                            className={selectedOptions.includes(option) ? 'selected' : ''}
                            style={{position: "relative"}}
                        >
                            <div onClick={() => handleOptionClick(option)} style={{position: "absolute", top: 0, left: 0, width: "85%", cursor: "pointer", height: "100%"}}></div>
                            <div>{option}</div>
                            <input type="number"></input>
                        </li>
                        </div>
                    ))}
                </ul>
        </div>
    );
};

export default MultiListInput;