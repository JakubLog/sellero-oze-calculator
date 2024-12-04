import InputList from "../Components/Input/InputList";
import InputNumber from "../Components/Input/InputNumber";
import Installation from "./Installation";
import "./Styles/Configurator.css";
import { useEffect, useState, useRef } from "react";

const defaultFormData = {
  "Typ instalacji": "Instalacja + magazyn energii",
};

const menuOptions = ["PV i Magayny energii", "Ocieplenie", "Pompy ciepła"];

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
  const [expand, setExpand] = useState(false);
  const [narzut, setNarzut] = useState(0);
  const [falownikCategory, setFalownikCategory] = useState(null);
  const menuRef = useRef(null);

  const setTypeOfFalownik = (formData) => {
    if(formData["Falownik"]) {
      const falownik = formData["Falownik"];
      const {category} = JSON.parse(falownik);
      setFalownikCategory(category);
    }
  }

  const countCosts = (formData) => {
    if(formData["Narzut"]) {
      const narzutString = formData["Narzut"];
      const narzutJSON = JSON.parse(narzutString);
      setNarzut(narzutJSON.price);
    }

    const priceArray = Object.values(formData).map((objectInString) => {
      if (isValidJSON(objectInString)) {
        const objectInJSON = JSON.parse(objectInString);
        if (objectInJSON.price) {
          return objectInJSON.price;
        }
      }
    });

    const sum = priceArray.reduce((acc, current) => {
      if (typeof current == "number") {
        return acc + current;
      }
      return acc + 0;
    }, 0);

    const readyObject = {
      vat: Math.ceil(sum * 0.23),
      netto: sum - sum * 0.23,
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
                  Items={["Instalacja + magazyn energii", "Magazyn energii", "Instalacja"]}
                  defaultItem={1}
                  changeFunction={onOptionChange}
                />
                  <Installation handleForm={handleFormChange} formValues={formData} option={option} falownikCategory={falownikCategory} />
              </>
            )}
            {menuIndex === 1 && (
              <p>Sekcja ocieplenia już wkrótce!</p>
            )}
            {menuIndex === 2 && (
              <p>Sekcja pomp ciepła już wkrótce!</p>
            )}
          </div>
          <div className="BoxItem BoxItem-2">
            <div className={`BoxInner BoxInnerToggle ${expand && "BoxInnerToggle-active"}`}>
              <h2 onClick={() => setExpand((prev) => prev ? false : true)} className="BoxInnerHeader">PV i magazyn</h2>
              <div className={`BoxInnerContent ${expand && "BoxInnerContent-active"}`}>
                <p>Zobacz i edytuj dodatkowe infomracje!</p>
                {advanceMode && <InputNumber handleForm={handleFormChange} Title={"Narzut"} />}
              </div>
            </div>
            <div className="BoxInner">
              <div className="BoxInnerHeader">Podsumowanie</div>
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
                {advanceMode && <div className="CostElement">
                  <div className="CostHeader">Narzut</div>
                  <div className="CostContent">{narzut} zł</div>
                </div>}
              </div>
            </div>
            <button className="SendButton" type="submit">
              Zapisz ofertę! 
            </button>
            <div className="ProffButton" onClick={() => setAdvanceMode((last) => last ? false : true)}>{advanceMode ? "Zamknij" : "Uruchom"} tryb zaawansowany</div>

          </div>
        </div>
      </div>
    </form>
  );
}

export default Configurator;
