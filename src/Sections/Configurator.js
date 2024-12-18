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

const menuOptions = ["PV i Magazyny energii", "Źródła ciepła"];

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
  const [isModalOpen, setModalState] = useState(false);
  const [modalContent, setModalContent] = useState({title: "Test", content: "Test"});
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


  const openModal = ({title, content}) => {
      setModalState(true);
      setModalContent({title, content});
  };

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

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  const eraseFormData = () => {
    setFormData(() => {
      const obj = {...defaultFormData};
      return obj;
    });
  }

  const onOptionChange = (event) => {
    const selectedOption = event.target.value;
    setOption(selectedOption);
  };

  function convertToQueryString(baseURL, formDataObject, title) {
    // Start with the base URL
    let queryString = baseURL + `?entityTypeId=1060&fields[Title]=Oferta%20-%20${title}&fields[parentId2]=${window.BitrixUserID}&`;
  
    // Iterate over the keys of the object
    for (const key in formDataObject) {
      if (formDataObject.hasOwnProperty(key)) {
        const value = formDataObject[key]?.value;
        if (value !== undefined) {
          // Append the key and value in the required format
          queryString += `fields[${key}]=${encodeURIComponent(value)}&`;
        }
      }
    }
  
    // Remove the trailing '&' and return the final URL
    return queryString.slice(0, -1);
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const readyFormData = {
      "ufCrm19_1734092712114": {
        name: "Cena netto",
        value: prices.netto
      },
      "ufCrm19_1734092725302": {
        name: "Cena brutto",
        value: prices.brutto
      },
      "ufCrm19_1734092750158": {
        name: "VAT",
        value: prices.vat
      },
      "ufCrm19_1734093565018": {
        name: "PV Rodzaj finansowania",
        value: formData["Rodzaj finansowania"]
      },
      "ufCrm19_1734093595366": {
        name: "Status instalacji",
        value: formData["Status instalacji"]
      }
    }

    let preapredReadyObject = {};
    if(menuIndex === 0) {
      const falownikData = JSON.parse(formData["Falownik"]);
      const modulesData = JSON.parse(formData["sub-Moduły"]);

      preapredReadyObject = {
        ...readyFormData,
        "ufCrm19_1734093614566": {
          name: "System rozliczenia",
          value: formData["System rozliczania"]
        },
        "ufCrm19_1734093629086": {
          name: "Typ instalacji",
          value: formData["Typ instalacji"]
        },
        "ufCrm19_1734093232322": {
        name: "Falownik - nazwa",
        value: falownikData.name
      },
      "ufCrm19_1734093267498": {
        name: "Falownik - cena",
        value: falownikData.price
      },
      "ufCrm19_1734093288078": {
        name: "Falwonik - kategoria",
        value: falownikData.category
      },
      "ufCrm19_1734093309086": {
        name: "Konstrukcja",
        value: formData["Konstrukcja"]
      },
      "ufCrm19_1734093323254": {
        name: "Magazyn ciepła",
        value: formData["Magazyn ciepła"]
      },
      "ufCrm19_1734093345622": {
        name: "Magazyn energii",
        value: formData["Magazyn energii"]
      },
      "ufCrm19_1734093383135": {
        name: "Moduły - nazwa",
        value: formData["Moduły"]
      },
      "ufCrm19_1734093430394": {
        name: "Moduły - KW",
        value: modulesData.kw
      },
      "ufCrm19_1734093455162": {
        name: "Moduły - Ilość paneli",
        value: modulesData.howMuch
      },
      "ufCrm19_1734093509546": {
        name: "Moduły - fazy",
        value: modulesData.fazy
      },
      "ufCrm19_1734093541530": {
        name: "Moduły - Cena modułu",
        value: modulesData.price
      }};

    } else if(menuIndex === 1) {
      const heatPumpData = JSON.parse(formData["Pompa ciepła"]);
      const zasobnikCWData = JSON.parse(formData["Zasobnik CW"]);

      preapredReadyObject = {
        ...readyFormData,
      "ufCrm19_1734093989098": {
        name: "Pompa ciepła - nazwa",
        value: "Pompa ciepła"
      },
      "ufCrm19_1734094017834": {
        name: "Pompa ciepła - cena",
        value: heatPumpData.price
      },
      "ufCrm19_1734094043667": {
        name: "Bufor CO - nazwa",
        value: heatPumpData.buforCO
      },
      "ufCrm19_1734094087739": {
        name: "Bufor CO - cena",
        value: heatPumpData.buforCOPrice
      },
      "ufCrm19_1734094106660": {
        name: "Pompa ciepła - KW",
        value: heatPumpData.kwValue
      },
      "ufCrm19_1734094130334": {
        name: "Pompa ciepła - M/S",
        value: heatPumpData.ms
      },
      "ufCrm19_1734094161006": {
        name: "Zasobnik CW - nazwa",
        value: zasobnikCWData.name
      },
      "ufCrm19_1734094180750": {
        name: "Zasobnik CW - cena",
        value: zasobnikCWData.price
      }};
    }

      const readyUrl = convertToQueryString("https://opalpower.bitrix24.pl/rest/87/n9jz2bhymt5cw72t/crm.item.add.json", preapredReadyObject, menuIndex === 0 ? "Instalacje PV" : "Źródła ciepła");
      fetch(readyUrl).then(res => res.json()).then(data => console.log(data));

      console.log("Zapisano!", readyFormData, preapredReadyObject);
      console.log(readyUrl);

      setModalState(false);
      window.location.reload();
      eraseFormData();
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
              onClick={() => {
                setMenuIndex(index); 
                eraseFormData();
              }}
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
            {menuIndex === 2 && <Ocieplenie />}
            {menuIndex === 1 && (
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

            <button className="SendButton" type="button" onClick={() => openModal({title: "Potwierdź wysłanie", content: "Kliknij i potwierdź wysłanie kalkulacji"})}>
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
      {isModalOpen && <><div style={{width: "100vw", height: "100vh", position: "fixed", left: 0, top: 0, backgroundColor: "rgb(0, 0, 0, 0.2)"}}></div>
      <div style={{position: "fixed", margin: "auto", top: "0", left: "0", right:0, bottom: 0,  width: "500px", height: "300px", backgroundColor: "white", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "black" }}>
        <h1>{modalContent.title}</h1>
        <p>{modalContent.content}</p>
        <button className="SendButton" type="submit" style={{color: "black"}} onClick={handleFormSubmit}>
          Stwórz ofertę
        </button>
        <p style={{cursor: "pointer"}} onClick={() => setModalState(false)}>Zamknij</p> 
      </div></>}
    </form>
  );
}

export default Configurator;
