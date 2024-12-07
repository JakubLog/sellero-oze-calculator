import InputList from "../Components/Input/InputList";
import InputNumber from "../Components/Input/InputNumber";
import Installation from "./Installation";
import "./Styles/Configurator.css";
import { useEffect, useState, useRef } from "react";
import Ocieplenie from "./Ocieplenie";
import ZrodlaCiepla from "./ZrodlaCiepla";

const defaultFormData = {
  "Typ instalacji": "Instalacja PV + magazyn energii",
};

const menuOptions = ["PV i Magayny energii", "Ocieplenie", "Źródła ciepła"];

const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
};

function Configurator() {
  const [option, setOption] = useState(
    defaultFormData[Object.keys(defaultFormData)[0]]
  );
  const [formData, setFormData] = useState(defaultFormData);
  const [menuIndex, setMenuIndex] = useState(0);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const [prices, setPrices] = useState({
    vat: 0,
    netto: 0,
    brutto: 0,
    narzut: 0,
  });
  const [advanceMode, setAdvanceMode] = useState(false);
  // const [expand, setExpand] = useState(false);
  const [narzut, setNarzut] = useState(0);
  const [falownikCategory, setFalownikCategory] = useState(null);
  const menuRef = useRef(null);

  const setTypeOfFalownik = (formData) => {
    if (formData["Falownik"]) {
      const falownik = formData["Falownik"];
      const { category } = JSON.parse(falownik);
      setFalownikCategory(category);
    }
  };

  function extractSimilarKeys(obj) {
    const result = [];
    const keys = Object.keys(obj);

    keys.forEach((key) => {
      if (key.endsWith("Value")) {
        const baseKey = key.slice(0, -5);
        if (keys.includes(baseKey)) {
          const item = {};
          item[baseKey] = obj[baseKey];
          item[key] = obj[key];
          result.push(item);
          delete obj[baseKey];
          delete obj[key];
        }
      }
    });

    return result;
  }

  const countCosts = (formData) => {
    if (formData["Narzut"]) {
      const narzutString = formData["Narzut"];
      const narzutJSON = JSON.parse(narzutString);
      setNarzut(narzutJSON.price);
    }

    const copyOfFormData = { ...formData };
    const extractedSimilarItems = extractSimilarKeys(copyOfFormData);
    let tempPriceOfSimilarItems = 0;

    extractedSimilarItems.forEach((item) => {
      const baseKey = Object.keys(item)[0];
      const valueKey = Object.keys(item)[1];
      const baseValue = item[baseKey];
      const valueValue = item[valueKey];

      const extractedJSON = JSON.parse(baseValue);
      if (extractedJSON.price && valueValue > 0) {
        const extractedPrice = extractedJSON.price;
        const extractedValue = Number(valueValue);

        tempPriceOfSimilarItems += extractedPrice * extractedValue;
      } else return 0;
    });

    const priceArray = Object.values(copyOfFormData).map((objectInString) => {
      if (isValidJSON(objectInString)) {
        const objectInJSON = JSON.parse(objectInString);
        if (objectInJSON.price) {
          if (objectInJSON.priceMultiplier && objectInJSON.priceMultiplier > 0)
            return objectInJSON.price * objectInJSON.priceMultiplier;
          return objectInJSON.price;
        }
      }
    });

    const sum =
      priceArray.reduce((acc, current) => {
        if (typeof current == "number") {
          return acc + current;
        }
        return acc + 0;
      }, 0) + tempPriceOfSimilarItems;

    const readyObject = {
      vat: Math.ceil(sum * 0.23),
      netto: Math.ceil(sum - sum * 0.23),
      brutto: sum,
      narzut: 0,
    };

    setPrices(readyObject);
  };

  const onOptionChange = (event) => {
    const selectedOption = event.target.value;
    setOption(selectedOption);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    console.log(formData);
  };

  useEffect(() => {
    const menuItems = menuRef.current.children;
    const activeItem = menuItems[menuIndex];
    if (activeItem) {
      const { offsetLeft, offsetWidth, offsetTop } = activeItem;
      setUnderlineStyle({
        transform: `translateX(calc(${offsetLeft}px + ${
          offsetWidth / 2
        }px - 50%))`,
        width: `${offsetWidth - 15}px`,
        top: `${offsetTop + 45}px`,
      });
    }
  }, [menuIndex]);

  useEffect(() => {
    countCosts(formData);
    setTypeOfFalownik(formData);
  }, [formData]);

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="ConfiguratorContainer">
        <div className="ConfiguratorOptions" ref={menuRef}>
          {menuOptions.map((item, index) => (
            <div
              key={index}
              className={`OptionsItem ${
                index === menuIndex ? "OptionsItem-active" : ""
              }`}
              onClick={() => setMenuIndex(index)}
            >
              {item}
            </div>
          ))}
          <div className="MenuUnderline" style={underlineStyle}></div>
        </div>
        <div className="ConfiguratorBox">
          <div className="BoxItem BoxItem-1">
            {menuIndex === 0 && (
              <>
                <InputList
                  Title={Object.keys(defaultFormData)[0]}
                  handleForm={handleFormChange}
                  Items={[
                    "Instalacja PV + magazyn energii",
                    "Magazyn energii",
                    "Instalacja PV",
                  ]}
                  defaultItem={1}
                  changeFunction={onOptionChange}
                />
                <Installation
                  handleForm={handleFormChange}
                  formValues={formData}
                  option={option}
                  falownikCategory={falownikCategory}
                />
              </>
            )}
            {menuIndex === 1 && <Ocieplenie />}
            {menuIndex === 2 && (
              <ZrodlaCiepla
                handleForm={handleFormChange}
                formValues={formData}
              />
            )}
          </div>
          <div className="BoxItem BoxItem-2">
            {/* <div
              className={`BoxInner BoxInnerToggle ${
                expand && "BoxInnerToggle-active"
              }`}
            >
              <h2
                onClick={() => setExpand((prev) => (prev ? false : true))}
                className="BoxInnerHeader"
              >
                PV i magazyn
              </h2>
              <div
                className={`BoxInnerContent ${
                  expand && "BoxInnerContent-active"
                }`}
              >
                <p>Zobacz i edytuj dodatkowe infomracje!</p>
                {advanceMode && (
                  <InputNumber handleForm={handleFormChange} Title={"Narzut"} />
                )}
              </div>
            </div> */}
            <div className="BoxInner">
              <div className="BoxInnerHeader">Podsumowanie</div>
              {advanceMode && (
                <InputNumber handleForm={handleFormChange} Title={"Narzut"} />
              )}
              <div className="BoxCosts">
                <div className="CostElement">
                  <div className="CostHeader">Suma netto</div>
                  <div className="CostContent">{prices.netto} zł</div>
                </div>
                <div className="CostElement">
                  <div className="CostHeader">VAT</div>
                  <div className="CostContent">{prices.vat} zł</div>
                </div>
                <div className="CostElement">
                  <div className="CostHeader">Suma brutto</div>
                  <div className="CostContent">{prices.brutto} zł</div>
                </div>
                {advanceMode && (
                  <div className="CostElement">
                    <div className="CostHeader">Narzut</div>
                    <div className="CostContent">{narzut} zł</div>
                  </div>
                )}
              </div>
            </div>

            <button className="SendButton" type="submit">
              Zapisz ofertę!
            </button>
            <div
              className="ProffButton"
              onClick={() => setAdvanceMode((last) => (last ? false : true))}
            >
              {advanceMode ? "Zamknij" : "Uruchom"} tryb zaawansowany
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          textAlign: "center",
          padding: "20px 10px",
          backgroundColor: "#eee",
          fontSize: "14px",
        }}
      >
        Created by <a href="https://selleroconsulting.pl">SelleroAutomate</a>{" "}
        team. Part of <a href="https://selleroconsulting.pl/">SelleroGroup.</a>
        <br />© {new Date().getFullYear()} SelleroGroup. All rights reserved. |{" "}
        <a href="https://selleroconsulting.pl/polityka-prywatnosci">
          Policy of privacy
        </a>{" "}
        |{" "}
        <a href="https://selleroconsulting.pl/regulamin">
          Terms and conditions
        </a>
      </div>
    </form>
  );
}

export default Configurator;
