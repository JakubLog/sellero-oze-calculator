import InputList from '../Components/Input/InputList';
import InputNumber from '../Components/Input/InputNumber';
import Installation from './Installation';
import './Styles/Configurator.css';
import { useEffect, useState, useRef } from 'react';
import Ocieplenie from './Ocieplenie';
import ZrodlaCiepla from './ZrodlaCiepla';

const defaultFormData = {
  'Typ instalacji': 'Instalacja PV + magazyn energii'
};

const menuOptions = ['PV i Magazyny energii', 'Źródła ciepła'];

// Funkcja do konwersji liczby na słowa
const Slownie = (number) => {
  const ones = ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć'];
  const teens = [
    'dziesięć',
    'jedenaście',
    'dwanaście',
    'trzynaście',
    'czternaście',
    'piętnaście',
    'szesnaście',
    'siedemnaście',
    'osiemnaście',
    'dziewiętnaście'
  ];
  const tens = [
    '',
    '',
    'dwadzieścia',
    'trzydzieści',
    'czterdzieści',
    'pięćdziesiąt',
    'sześćdziesiąt',
    'siedemdziesiąt',
    'osiemdziesiąt',
    'dziewięćdziesiąt'
  ];
  const hundreds = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset'];

  const getThousandsWord = (num) => {
    if (num === 1) return 'tysiąc';
    if (num >= 2 && num <= 4) return 'tysiące';
    return 'tysięcy';
  };

  const getMillionsWord = (num) => {
    if (num === 1) return 'milion';
    if (num >= 2 && num <= 4) return 'miliony';
    return 'milionów';
  };

  if (number === 0) return 'zero';

  const convertChunk = (n) => {
    let result = '';
    if (n >= 100) {
      result += hundreds[Math.floor(n / 100)] + ' ';
      n %= 100;
    }
    if (n >= 10 && n < 20) {
      result += teens[n - 10] + ' ';
    } else {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    result += ones[n] + ' ';
    return result.trim();
  };

  const millions = Math.floor(number / 1000000);
  const thousands = Math.floor((number % 1000000) / 1000);
  const remainder = number % 1000;

  let words = '';

  if (millions > 0) {
    words += convertChunk(millions) + ' ' + getMillionsWord(millions) + ' ';
  }

  if (thousands > 0) {
    words += convertChunk(thousands) + ' ' + getThousandsWord(thousands) + ' ';
  }

  if (remainder > 0) {
    words += convertChunk(remainder);
  }

  return words.trim();
};

const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (error) {
    return false;
  }
};

function Configurator() {
  const [option, setOption] = useState(defaultFormData[Object.keys(defaultFormData)[0]]);
  const [formData, setFormData] = useState(defaultFormData);
  const [menuIndex, setMenuIndex] = useState(0);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const [isModalOpen, setModalState] = useState(false);
  const [modalContent, setModalContent] = useState({ title: 'Test', content: 'Test' });
  const [prices, setPrices] = useState({
    vat: 0,
    netto: 0,
    brutto: 0,
    narzut: 0
  });
  const [advanceMode, setAdvanceMode] = useState(false);
  // const [expand, setExpand] = useState(false);
  const [narzut, setNarzut] = useState(0);
  const [falownikCategory, setFalownikCategory] = useState(null);
  const menuRef = useRef(null);
  const vatSwitch = useRef(null);
  const [vatValue, setVatValue] = useState(8);

  const openModal = ({ title, content }) => {
    setModalState(true);
    setModalContent({ title, content });
  };

  const setTypeOfFalownik = (formData) => {
    if (formData['Falownik']) {
      const falownik = formData['Falownik'];
      const { category } = JSON.parse(falownik);
      setFalownikCategory(category);
    }
  };

  function extractSimilarKeys(obj) {
    const result = [];
    const keys = Object.keys(obj);

    keys.forEach((key) => {
      if (key.endsWith('Value')) {
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
    if (formData['Narzut']) {
      const narzutString = formData['Narzut'];
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
          if (objectInJSON.priceMultiplier && objectInJSON.priceMultiplier > 0) return objectInJSON.price * objectInJSON.priceMultiplier;
          return objectInJSON.price;
        }
      }
    });

    const sum =
      priceArray.reduce((acc, current) => {
        if (typeof current == 'number') {
          return acc + current;
        }
        return acc + 0;
      }, 0) + tempPriceOfSimilarItems;

    const pricesFromOptions = Object.entries(formData).map((value) => {
      if (value[0].includes('Opcja-') && value[1]?.price) {
        const countedValue = value[1].value * value[1].price;
        console.log(countedValue, value[0]);
        return countedValue;
      } else {
        return 0;
      }
    });

    const sumOfOptions = pricesFromOptions.reduce((acc, current) => {
      if (typeof current == 'number') {
        return acc + current;
      }
    });

    const readyObject = {
      vat: Math.ceil((sum + sumOfOptions) * (vatValue === 23 ? 0.23 : 0.08)),
      netto: sum + sumOfOptions,
      brutto: Math.ceil(sum + sumOfOptions + (sum + sumOfOptions) * (vatValue === 23 ? 0.23 : 0.08)),
      narzut: 0
    };

    setPrices(readyObject);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  const eraseFormData = () => {
    setFormData(() => {
      const obj = { ...defaultFormData };
      return obj;
    });
  };

  const onOptionChange = (event) => {
    const selectedOption = event.target.value;
    setOption(selectedOption);
  };

  function convertToQueryString(baseURL, formDataObject, title, category) {
    // Start with the base URL
    let queryString =
      baseURL + `?entityTypeId=1060&fields[Title]=Oferta%20-%20${title}&fields[parentId2]=${window.BitrixUserID}&fields[categoryId]=${category}&`;

    // Iterate over the keys of the object
    for (const key in formDataObject) {
      // eslint-disable-next-line no-prototype-builtins
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

  useEffect(() => {
    if (vatSwitch.current) {
      vatSwitch.current.addEventListener('change', () => {
        if (vatSwitch.current.checked) {
          setVatValue(23);
        } else {
          setVatValue(8);
        }
      });
    }
  }, []);

  useEffect(() => {
    countCosts(formData);
  }, [vatValue]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (menuIndex === 0) if (!formData['Rodzaj finansowania'] || !formData['System rozliczania']) return alert('Brak wymaganych danych');
    if (menuIndex === 1) if (!formData['Rodzaj finansowania'] || !formData['Rodzaje źródeł ciepła']) return alert('Brak wymaganych danych');

    const foundedOptions = Object.entries(formData).map((value) => {
      if (value[0].includes('Opcja-') && value[1]?.price) {
        console.log(value[1].value, value[1].price, value);
        const price = value[1].price;
        const preV = value[1].value;
        const v = preV;
        const name = value[0].replace('Opcja-', '');

        const readyString = `${name} (${v} szt) - ${v * price} zł`;

        return readyString;
      }
      return null;
    });

    const foundedOptionsFiltered = foundedOptions.filter((value) => value !== null);
    const foundefOptionsString = foundedOptionsFiltered.join(' | ');

    const responseAssigned = await fetch(
      `https://opalpower.bitrix24.pl/rest/87/n9jz2bhymt5cw72t/crm.deal.get.json?ID=${window.BitrixUserID || 239}`
    ).then((res) => res.json());

    const readyFormData = {
      ASSIGNED_BY_ID: {
        name: 'Przypisane do',
        value: responseAssigned.result['ASSIGNED_BY_ID']
      },
      ufCrm19_1734092712114: {
        name: 'Cena netto',
        value: prices.netto
      },
      ufCrm19_1734092725302: {
        name: 'Cena brutto',
        value: prices.brutto
      },
      ufCrm19_1734530303873: {
        name: 'Cena netto słownie',
        value: Slownie(prices.netto, { lang: 'pl' }).replace('undefined', '')
      },
      ufCrm19_1734530325809: {
        name: 'Cena brutto słownie',
        value: Slownie(prices.brutto).replace('undefined', '')
      },
      ufCrm19_1734092750158: {
        name: 'VAT',
        value: prices.vat
      },
      ufCrm19_1734530356921: {
        name: 'VAT słownie',
        value: Slownie(prices.vat).replace('undefined', '')
      },
      ufCrm19_1734093565018: {
        name: 'PV Rodzaj finansowania',
        value: formData['Rodzaj finansowania']
      },
      ufCrm19_1736429905360: {
        name: 'Zaliczka - 50%',
        value: prices.brutto * 0.5
      },
      ufCrm19_1736429936367: {
        name: 'Zaliczka - 50% Słownie',
        value: Slownie(prices.brutto * 0.5).replace('undefined', '')
      },
      ufCrm19_1734093595366: {
        name: 'Status instalacji',
        value: formData['Status instalacji']
      },
      ufCrm19_1734379707393: {
        name: 'Opcje',
        value: foundefOptionsString
      }
    };

    let preapredReadyObject = {};
    if (menuIndex === 0) {
      let falownikData;
      let modulesData;
      let parsedMagazine;
      let parsedMagazineCW;

      if (option === 'Instalacja PV + magazyn energii') {
        if (!formData['Falownik'] || !formData['sub-Moduły'] || !formData['Magazyn energii']) {
          console.log('Brak wymaganych danych');
          return alert('Brak wymaganych danych - e1');
        }
        falownikData = JSON.parse(formData['Falownik']);
        modulesData = JSON.parse(formData['sub-Moduły']);
        parsedMagazine = JSON.parse(formData['Magazyn energii'] || '{}');
        parsedMagazineCW = JSON.parse(formData['Magazyn ciepła'] || '{}');

        preapredReadyObject = {
          ...readyFormData,
          ufCrm19_1734093614566: {
            name: 'System rozliczenia',
            value: formData['System rozliczania']
          },
          ufCrm19_1734093629086: {
            name: 'Typ instalacji',
            value: formData['Typ instalacji']
          },
          ufCrm19_1734093232322: {
            name: 'Falownik - nazwa',
            value: falownikData.name
          },
          ufCrm19_1734093267498: {
            name: 'Falownik - cena',
            value: falownikData.price
          },
          ufCrm19_1734530381921: {
            name: 'Falownik - cena słownie',
            value: Slownie(falownikData.price).replace('undefined', '')
          },
          ufCrm19_1734093288078: {
            name: 'Falownik - kategoria',
            value: falownikData.category
          },
          ufCrm19_1734093309086: {
            name: 'Konstrukcja',
            value: formData['Konstrukcja']
          },
          ufCrm19_1734093323254: {
            name: 'Magazyn ciepła',
            value: parsedMagazineCW?.name || 'brak'
          },
          ufCrm19_1734093345622: {
            name: 'Magazyn energii',
            value: parsedMagazine.name
          },
          ufCrm19_1734093383135: {
            name: 'Moduły - nazwa',
            value: formData['Moduły']
          },
          ufCrm19_1734093430394: {
            name: 'Moduły - KW',
            value: modulesData.kw
          },
          ufCrm19_1734093455162: {
            name: 'Moduły - Ilość paneli',
            value: modulesData.howMuch
          },
          ufCrm19_1734093509546: {
            name: 'Moduły - fazy',
            value: modulesData.fazy
          },
          ufCrm19_1734093541530: {
            name: 'Moduły - Cena modułu',
            value: modulesData.price
          },
          ufCrm19_1734530409161: {
            name: 'Moduły - Cena modułu słownie',
            value: Slownie(modulesData.price).replace('undefined', '')
          }
        };
      } else if (option === 'Instalacja PV') {
        if (!formData['Falownik'] || !formData['sub-Moduły']) {
          console.log('Brak wymaganych danych');
          return alert('Brak wymaganych danych - e1');
        }
        falownikData = JSON.parse(formData['Falownik']);
        modulesData = JSON.parse(formData['sub-Moduły']);

        preapredReadyObject = {
          ...readyFormData,
          ufCrm19_1734093614566: {
            name: 'System rozliczenia',
            value: formData['System rozliczania']
          },
          ufCrm19_1734093629086: {
            name: 'Typ instalacji',
            value: formData['Typ instalacji']
          },
          ufCrm19_1734093232322: {
            name: 'Falownik - nazwa',
            value: falownikData.name
          },
          ufCrm19_1734093267498: {
            name: 'Falownik - cena',
            value: falownikData.price
          },
          ufCrm19_1734530381921: {
            name: 'Falownik - cena słownie',
            value: Slownie(falownikData.price).replace('undefined', '')
          },
          ufCrm19_1734093288078: {
            name: 'Falownik - kategoria',
            value: falownikData.category
          },
          ufCrm19_1734093383135: {
            name: 'Moduły - nazwa',
            value: formData['Moduły']
          },
          ufCrm19_1734093430394: {
            name: 'Moduły - KW',
            value: modulesData.kw
          },
          ufCrm19_1734093455162: {
            name: 'Moduły - Ilość paneli',
            value: modulesData.howMuch
          },
          ufCrm19_1734093509546: {
            name: 'Moduły - fazy',
            value: modulesData.fazy
          },
          ufCrm19_1734093541530: {
            name: 'Moduły - Cena modułu',
            value: modulesData.price
          },
          ufCrm19_1734530409161: {
            name: 'Moduły - Cena modułu słownie',
            value: Slownie(modulesData.price).replace('undefined', '')
          }
        };
      } else if (option === 'Magazyn energii') {
        if (!formData['Magazyn energii']) {
          console.log('Brak wymaganych danych');
          return alert('Brak wymaganych danych - e1');
        }
        parsedMagazine = JSON.parse(formData['Magazyn energii'] || '{}');
        parsedMagazineCW = JSON.parse(formData['Magazyn ciepła'] || '{}');

        preapredReadyObject = {
          ...readyFormData,
          ufCrm19_1734093614566: {
            name: 'System rozliczenia',
            value: formData['System rozliczania']
          },
          ufCrm19_1734093629086: {
            name: 'Typ instalacji',
            value: formData['Typ instalacji']
          },
          ufCrm19_1734093323254: {
            name: 'Magazyn ciepła',
            value: parsedMagazineCW?.name || 'brak'
          },
          ufCrm19_1734093345622: {
            name: 'Magazyn energii',
            value: parsedMagazine.name
          }
        };
      }
    } else if (menuIndex === 1) {
      if (JSON.parse(formData['Rodzaje źródeł ciepła'])?.id === 0) {
        if (!formData['Pompa ciepła'] || !formData['Zasobnik CWu']) {
          console.log('Brak wymaganych danych');
          return alert('Brak wymaganych danych - e2');
        }
        console.log('POMPA CIEPŁA');
        const heatPumpData = JSON.parse(formData['Pompa ciepła']);
        const zasobnikCWData = JSON.parse(formData['Zasobnik CWu']);

        preapredReadyObject = {
          ...readyFormData,
          ufCrm19_1734093989098: {
            name: 'Pompa ciepła - nazwa',
            value: heatPumpData.name
          },
          ufCrm19_1734094017834: {
            name: 'Pompa ciepła - cena',
            value: heatPumpData.price
          },
          ufCrm19_1734094043667: {
            name: 'Bufor CO - nazwa',
            value: heatPumpData.buforCO
          },
          ufCrm19_1734094087739: {
            name: 'Bufor CO - cena',
            value: heatPumpData.buforCOPrice
          },
          ufCrm19_1734094106660: {
            name: 'Pompa ciepła - KW',
            value: heatPumpData.kwValue
          },
          ufCrm19_1734094130334: {
            name: 'Pompa ciepła - M/S',
            value: zasobnikCWData.ms
          },
          ufCrm19_1734094215342: {
            name: 'Pompa ciepła - rodzaj finansowania',
            value: formData['Rodzaj finansowania']
          },
          ufCrm19_1734094669202: {
            name: 'Pompa ciepła - rodzaj pompy',
            value: formData['Rodzaj pompy']
          },
          ufCrm19_1734094180750: {
            name: 'Pompa ciepła - zasobnik cw - cena',
            value: zasobnikCWData.price
          },
          ufCrm19_1734094161006: {
            name: 'Pompa ciepła - zasobnik CW - nazwa',
            value: zasobnikCWData.name
          },
          ufCrm19_1738233186942: {
            name: 'Pompa ciepła - instalacja',
            value: formData['Rodzaj instalacji elektrycznej']
          }
        };
      } else if (JSON.parse(formData['Rodzaje źródeł ciepła'])?.id === 1 || JSON.parse(formData['Rodzaje źródeł ciepła'])?.id === 2) {
        if (!formData['Kotły'] || !formData['Zasobnik CWu']) {
          console.log('Brak wymaganych danych');
          return alert('Brak wymaganych danych - e2');
        }
        const kotlyData = JSON.parse(formData['Kotły']);
        const zasobnikCWData = formData['Zasobnik CWu'];
        let typeOfKotly = '';
        switch (JSON.parse(formData['Rodzaje źródeł ciepła'])?.id) {
          case 1:
            typeOfKotly = 'Kocioł na pelet';
            break;
          case 2:
            typeOfKotly = 'Kocioł zgazujący drewno';
            break;
        }

        preapredReadyObject = {
          ...readyFormData,
          ufCrm19_1738232509113: {
            name: 'Kotły - nazwa',
            value: kotlyData.name
          },
          ufCrm19_1738232568095: {
            name: 'Kotły - cena',
            value: kotlyData.price
          },
          ufCrm19_1738232548276: {
            name: 'Kotły - rodzaj',
            value: typeOfKotly
          },
          ufCrm19_1738232594389: {
            name: 'Kotły - buforco',
            value: kotlyData?.buforCO || 'Brak'
          },
          ufCrm19_1734094161006: {
            name: 'Kotły - zasobnik CW - nazwa',
            value: zasobnikCWData
          }
        };
      }
    }

    const readyUrl = convertToQueryString(
      'https://opalpower.bitrix24.pl/rest/87/n9jz2bhymt5cw72t/crm.item.add.json',
      preapredReadyObject,
      menuIndex === 0 ? 'Instalacje PV' : 'Źródła ciepła',
      menuIndex === 0 ? 51 : 61
    );
    fetch(readyUrl);

    setModalState(false);
    alert('Wysłano!');
    window.location.reload();
    eraseFormData();
  };

  useEffect(() => {
    const menuItems = menuRef.current.children;
    const activeItem = menuItems[menuIndex];
    if (activeItem) {
      const { offsetLeft, offsetWidth, offsetTop } = activeItem;
      setUnderlineStyle({
        transform: `translateX(calc(${offsetLeft}px + ${offsetWidth / 2}px - 50%))`,
        width: `${offsetWidth - 15}px`,
        top: `${offsetTop + 45}px`
      });
    }
  }, [menuIndex]);

  useEffect(() => {
    console.log('FORM FINAL: ', formData);
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
              className={`OptionsItem ${index === menuIndex ? 'OptionsItem-active' : ''}`}
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
                  Items={['Instalacja PV + magazyn energii', 'Magazyn energii', 'Instalacja PV']}
                  defaultItem={1}
                  changeFunction={onOptionChange}
                />
                <Installation handleForm={handleFormChange} formValues={formData} option={option} falownikCategory={falownikCategory} />
              </>
            )}
            {menuIndex === 2 && <Ocieplenie />}
            {menuIndex === 1 && <ZrodlaCiepla handleForm={handleFormChange} formValues={formData} />}
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
              <div className="switch-precontainer">
                <div style={{ fontWeight: 'bold' }}>Stawka VAT</div>
                <div>
                  <div className="switch-container">
                    <span className="vat-label">8%</span>
                    <label className="switch" htmlFor="vatSwitch">
                      <input ref={vatSwitch} type="checkbox" id="vatSwitch" />
                      <span className="slider"></span>
                    </label>
                    <span className="vat-label">23%</span>
                  </div>
                </div>
              </div>
              {advanceMode && <InputNumber handleForm={handleFormChange} Title={'Narzut'} />}
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

            <button
              className="SendButton"
              type="button"
              onClick={() => openModal({ title: 'Potwierdź wysłanie', content: 'Kliknij i potwierdź wysłanie kalkulacji' })}
            >
              Zapisz ofertę!
            </button>
            <div className="ProffButton" onClick={() => setAdvanceMode((last) => (last ? false : true))}>
              {advanceMode ? 'Zamknij' : 'Uruchom'} tryb zaawansowany
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          textAlign: 'center',
          padding: '20px 10px',
          backgroundColor: '#eee',
          fontSize: '14px'
        }}
      >
        Created by <a href="https://selleroconsulting.pl">SelleroAutomate</a> team. Part of <a href="https://selleroconsulting.pl/">SelleroGroup.</a>
        <br />© {new Date().getFullYear()} SelleroGroup. All rights reserved. |{' '}
        <a href="https://selleroconsulting.pl/polityka-prywatnosci">Policy of privacy</a> |{' '}
        <a href="https://selleroconsulting.pl/regulamin">Terms and conditions</a>
      </div>
      {isModalOpen && (
        <>
          <div style={{ width: '100vw', height: '100vh', position: 'fixed', left: 0, top: 0, backgroundColor: 'rgb(0, 0, 0, 0.2)' }}></div>
          <div
            style={{
              position: 'fixed',
              margin: 'auto',
              top: '0',
              left: '0',
              right: 0,
              bottom: 0,
              width: '500px',
              height: '300px',
              backgroundColor: 'white',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: 'black'
            }}
          >
            <h1>{modalContent.title}</h1>
            <p>{modalContent.content}</p>
            <button className="SendButton" type="submit" style={{ color: 'black' }} onClick={handleFormSubmit}>
              Stwórz ofertę
            </button>
            <p style={{ cursor: 'pointer' }} onClick={() => setModalState(false)}>
              Zamknij
            </p>
          </div>
        </>
      )}
    </form>
  );
}

export default Configurator;
