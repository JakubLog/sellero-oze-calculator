import React, { useEffect, useState } from "react";
import "./Styles/MultiListInput.css";

const ListOption = ({ option, handleFormChange }) => {
  const [inputValue, setInputValue] = useState(0);
  const [isSelected, setSelectedState] = useState(false);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleOptionClick = (option) => {
    setSelectedState((prev) => {
      if (!prev) {
        handleFormChange(option, inputValue);
        return !prev;
      } else {
        handleFormChange(option, 0);
        return !prev;
      }
    });
  };

  useEffect(() => {
    if (isSelected) {
      handleFormChange(option, inputValue);
    } else {
      handleFormChange(option, 0);
    }
  }, [inputValue]);

  return (
    <div className="option">
      <li
        key={option}
        className={isSelected ? "selected" : ""}
        style={{ position: "relative" }}
      >
        <div
          onClick={() => handleOptionClick(option)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "85%",
            cursor: "pointer",
            height: "100%",
          }}
        ></div>
        <div>{option}</div>
        <input
          type="number"
          onChange={handleInputChange}
          defaultValue={0}
          value={inputValue}
          name={option}
        ></input>
      </li>
    </div>
  );
};

export default ListOption;
