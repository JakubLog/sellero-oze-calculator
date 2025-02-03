import React, { useEffect, useState, useRef } from 'react';
import InputList from '../Components/Input/InputList';
import Airtable from 'airtable';
import MultiListInput from '../Components/Input/MultiListInput';

const table = new Airtable({
  apiKey: 'patrJ0u69TVWKFUff.9c91979b177708e556a8b1d331b71b5c463b3a192ac81e31e7e1ae933fc2543e'
}).base('appkqjNBUA2Ok9LXv');

const zrodlaTable = 'Źródła ciepła';
const buforTable = 'Bufory CO';

const ZrodlaCiepla = ({ handleForm, formValues }) => {
  const [electricalInstallation, setElectricalInstallation] = useState(1);
  const [heatPump, setHeatPump] = useState([]);
  const [buforCOList, setBuforCOList] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [filteredBuforCOList, setFilteredBuforCOList] = useState([]);
  const [availableZasobniki, setAvailableZasobniki] = useState([]);
  const [indexOfHeatPump, setIndexOfHeatPump] = useState(0);
  const [filteredKociolyList, setFilteredKociolyList] = useState([]);
  const selectedFieldOfZasobnikRef = useRef(null);
  const [selectedFieldOfZasobnik, setSelectedFieldOfZasobnik] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [options, setOptions] = useState([]);

  const buildBuforList = (name) => {
    const copyOfList = [...buforCOList];
    const foundBuffor = copyOfList.filter((item) => item === name);
    setFilteredBuforCOList(foundBuffor);
  };

  useEffect(() => {
    if (formValues['Rodzaje źródeł ciepła']) {
      const selectedValue = JSON.parse(formValues['Rodzaje źródeł ciepła']);
      setIndexOfHeatPump(selectedValue.id);

      if (selectedValue.id === 1) {
        // NA pelet
        table('Źródła ciepła - inne')
          .select({ filterByFormula: `{Kategoria} = "Kocioł na pelet"`, sort: [{ field: 'Name', direction: 'asc' }] })
          .firstPage((err, records) => {
            const preparedRecords = records.map((record) => {
              return {
                name: record.fields['Name'],
                moc: record.fields['Moc'],
                value: {
                  name: record.fields['Name'],
                  buforCO: record.fields['Bufor CO'],
                  price: record.fields['Price'],
                  price100: record.fields['Price (100)'],
                  price140: record.fields['Price (140)'],
                  price200: record.fields['Price (200)'],
                  price300: record.fields['Price (300)']
                }
              };
            });
            setFilteredKociolyList(preparedRecords);
          });
      } else if (selectedValue.id === 2) {
        // Zgazujacy
        table('Źródła ciepła - inne')
          .select({ filterByFormula: `{Kategoria} = "Kocioł zgazujący drewno"`, sort: [{ field: 'Name', direction: 'asc' }] })
          .firstPage((err, records) => {
            const preparedRecords = records.map((record) => {
              return {
                name: record.fields['Name'],
                moc: record.fields['Moc'],
                value: {
                  name: record.fields['Name'],
                  buforCO: record.fields['Bufor CO'],
                  price: record.fields['Price'],
                  price100: record.fields['Price (100)'],
                  price140: record.fields['Price (140)'],
                  price200: record.fields['Price (200)'],
                  price300: record.fields['Price (300)']
                }
              };
            });
            setFilteredKociolyList(preparedRecords);
          });
      }
    }
  }, [formValues['Rodzaje źródeł ciepła']]);

  useEffect(() => {
    if (indexOfHeatPump !== 0) {
      selectedFieldOfZasobnikRef.current = formValues['Zasobnik CWu'];
    }
  }, [formValues['Zasobnik CWu']]);

  useEffect(() => {
    if (indexOfHeatPump !== 0 && selectedFieldOfZasobnikRef.current) {
      const selectedValue = JSON.parse(selectedFieldOfZasobnik);

      const readyObj = {
        ...selectedValue,
        name: selectedValue.name,
        price: selectedValue['price' + (selectedFieldOfZasobnikRef.current === 'Brak' ? '' : selectedFieldOfZasobnikRef.current)]
      };

      handleForm({
        target: {
          name: 'Kotły',
          value: JSON.stringify(readyObj)
        }
      });
    }
  }, [selectedFieldOfZasobnik, formValues['Zasobnik CWu']]);

  // const checkIsBuforExtraPrice = (e) => {
  //   const selectedValue = e.target.value;
  //   if (selectedValue) {
  //     if (filteredBuforCOList[0] !== selectedValue) {
  //       handleForm({
  //         target: {
  //           name: "Bufor CO",
  //           value: JSON.stringify({ name: selectedValue, price: 1000 }),
  //         },
  //       });
  //     }
  //   }
  //   return 0;
  // };

  const getZasobniki = (id) => {
    table(zrodlaTable)
      .select({ filterByFormula: `{ID} = ${id}` })
      .firstPage((err, records) => {
        const preparedRecords = records.map((record) => {
          return {
            name: record.fields['Zasobnik CW'],
            value: {
              name: record.fields['Zasobnik CW'],
              price: record.fields['Price Zasobnik CW']
            }
          };
        });
        setAvailableZasobniki(preparedRecords);
      });
  };

  useEffect(() => {
    setLoading(true);
    table(buforTable)
      .select()
      .firstPage((err, records) => {
        const preparedRecords = records.map((record) => {
          return record.fields['Name'];
        });
        setBuforCOList(preparedRecords);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    setFilteredBuforCOList([]);
    table(zrodlaTable)
      .select({ filterByFormula: `{Fazy} = ${electricalInstallation || 1}` })
      .firstPage((err, records) => {
        const preparedRecords = records.map((record) => {
          const { fields } = record;
          return {
            name: fields['Name'],
            value: {
              price: fields['Price'] + fields['Price Bufor'],
              id: fields['ID'],
              name: fields['Name'],
              buforCO: fields['Bufor CO'][0],
              buforCOPrice: fields['Price Bufor'],
              kwValue: fields['Kw'],
              ms: fields['M/S']
            }
          };
        });
        setHeatPump(preparedRecords);
        setLoading(false);
      });
  }, [electricalInstallation]);

  useEffect(() => {
    if (formValues['Pompa ciepła']) {
      const parsedValues = JSON.parse(formValues['Pompa ciepła']);
      const buforCOassigned = parsedValues.buforCO;
      buildBuforList(buforCOassigned);
      getZasobniki(parsedValues.id);
    }
  }, [formValues['Pompa ciepła']]);

  useEffect(() => {
    if (formValues['Kotły']) {
      const parsedValues = JSON.parse(formValues['Kotły']);
      console.log(parsedValues);
      if (parsedValues.buforCO) {
        setFilteredBuforCOList([parsedValues.buforCO]);
      } else {
        setFilteredBuforCOList([]);
      }
    }
  }, [formValues['Kotły']]);

  return (
    <>
      <InputList
        Title={'Rodzaje źródeł ciepła'}
        Items={[
          { name: 'Pompa ciepła', value: JSON.stringify({ id: 0 }) },
          { name: 'Kocioł na pelet', value: JSON.stringify({ id: 1 }) },
          { name: 'Kocioł zgazujący drewno', value: JSON.stringify({ id: 2 }) },
          { name: 'Klimatyzacja', value: JSON.stringify({ id: 3 }) }
        ]}
        handleForm={handleForm}
      />
      <InputList Title={'Rodzaj finansowania'} Items={['Prefinansowanie', 'Gotówka', 'Kredyt', 'Leasing']} handleForm={handleForm} />
      {indexOfHeatPump === 0 ? (
        <>
          <InputList
            Title={'Rodzaj instalacji elektrycznej'}
            Items={[
              { name: '1 FAZOWA', value: 1 },
              { name: '3 FAZOWA', value: 3 }
            ]}
            changeFunction={(e) => setElectricalInstallation(e.target.value)}
            handleForm={handleForm}
            defaultItem={1}
          />
          <InputList Title={'Rodzaj pompy'} Items={['Powietrze - Woda', 'Grunt']} handleForm={handleForm} />
          <InputList
            Title={'Pompa ciepła'}
            Items={heatPump.map((item) => ({
              name: `(${item.value.ms}) (${item.value.kwValue} kW) ${item.name}`,
              value: JSON.stringify(item.value)
            }))}
            isLoading={isLoading}
            handleForm={handleForm}
          />
        </>
      ) : (
        <InputList
          Title={'Kotły'}
          Items={
            filteredKociolyList.length > 0
              ? filteredKociolyList.map(({ name, moc, value }) => ({ name: `${name} (${moc})`, value: JSON.stringify({ ...value, moc }) }))
              : ['Wybierz kocioł']
          }
          isLoading={isLoading}
          changeFunction={(e) => {
            setSelectedFieldOfZasobnik(e.target.value);
          }}
          handleForm={handleForm}
        />
      )}
      <InputList
        Title={'Bufor CO'}
        Items={filteredBuforCOList.length > 0 ? filteredBuforCOList : ['Wybierz inną opcję']}
        selectedItem={filteredBuforCOList[0]}
        parameters={{ isFormHandled: true, isDisabled: true }}
        isLoading={isLoading}
        handleForm={handleForm}
      />
      <InputList
        Title={'Zasobnik CWu'}
        Items={
          indexOfHeatPump !== 0
            ? ['Brak', '100', '140', '200', '300']
            : availableZasobniki.map(({ name, value }, i) => ({
                name: name[i],
                value: JSON.stringify({ name: value.name[i], price: value.price[i] })
              }))
        }
        defaultItem={1}
        isLoading={isLoading}
        handleForm={handleForm}
      />
      <MultiListInput options={options} Title={'Dodatkowe opcje'} isCustomOption={true} handleForm={handleForm} />
    </>
  );
};

export default ZrodlaCiepla;
