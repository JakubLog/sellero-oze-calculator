import React, { useEffect, useState } from "react";
import InputList from "../Components/Input/InputList";
import Airtable from "airtable";

const table = new Airtable({
  apiKey:
    "patrJ0u69TVWKFUff.9c91979b177708e556a8b1d331b71b5c463b3a192ac81e31e7e1ae933fc2543e",
}).base("appkqjNBUA2Ok9LXv");

const zrodlaTable = "Źródła ciepła";
const buforTable = "Bufory CO";

const ZrodlaCiepla = ({ handleForm, formValues }) => {
  const [electricalInstallation, setElectricalInstallation] = useState(1);
  const [heatPump, setHeatPump] = useState([]);
  const [buforCOList, setBuforCOList] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [filteredBuforCOList, setFilteredBuforCOList] = useState([]);
  const [availableZasobniki, setAvailableZasobniki] = useState([]);

  const buildBuforList = (name) => {
    const copyOfList = [...buforCOList];
    const foundBuffor = copyOfList.filter((item) => item === name);
    setFilteredBuforCOList(foundBuffor);
  };

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
    table(zrodlaTable).select({ filterByFormula: `{ID} = ${id}` }).firstPage((err, records) => {
      const preparedRecords = records.map((record) => {
        return {
          name: record.fields["Zasobnik CW"],
          value: {
            name: record.fields["Zasobnik CW"],
            price: record.fields["Price Zasobnik CW"],
          },
        }});
      setAvailableZasobniki(preparedRecords);
    });
  }

  useEffect(() => {
    setLoading(true);
    table(buforTable)
      .select()
      .firstPage((err, records) => {
        const preparedRecords = records.map((record) => {
          return record.fields["Name"];
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
            name: fields["Name"],
            value: {
              price: fields["Price"] + fields["Price Bufor"],
              id: fields["ID"],
              name: fields["Name"],
              buforCO: fields["Bufor CO"][0],
              buforCOPrice: fields["Price Bufor"], 
              kwValue: fields["Kw"],
              ms: fields["M/S"],
            },
          };
        });
        setHeatPump(preparedRecords);
        setLoading(false);
      });
  }, [electricalInstallation]);

  useEffect(() => {
    if (formValues["Pompa ciepła"]) {
      const parsedValues = JSON.parse(formValues["Pompa ciepła"]);
      const buforCOassigned = parsedValues.buforCO;
      buildBuforList(buforCOassigned);
      getZasobniki(parsedValues.id);
    }
  }, [formValues["Pompa ciepła"]]);

  return (
    <>
      <InputList
        Title={"Rodzaj finansowania"}
        Items={["Prefinansowanie", "Gotówka"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Rodzaj instalacji elektrycznej"}
        Items={[{name: "1 FAZOWA", value: 1}, {name: "3 FAZOWA", value: 3}]}
        changeFunction={(e) => setElectricalInstallation(e.target.value)}
        handleForm={handleForm}
        defaultItem={1}
      />
      <InputList
        Title={"Rodzaj pompy"}
        Items={["Powietrze - Woda", "Grunt"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Pompa ciepła"}
        Items={heatPump.map(item => ({name: `(${item.value.ms}) (${item.value.kwValue} kW) ${item.name}`, value: JSON.stringify(item.value)}))}
        isLoading={isLoading}
        handleForm={handleForm}
      />
      <InputList
        Title={"Bufor CO"}
        Items={filteredBuforCOList.length > 0 ? filteredBuforCOList : ["Wybierz pompę ciepła"]}
        selectedItem={filteredBuforCOList[0]}
        parameters={{ isFormHandled: true, isDisabled: true }}
        isLoading={isLoading}
        handleForm={handleForm}
      />
      <InputList
        Title={"Zasobnik CW"}
        Items={availableZasobniki.map(({ name, value }, i) => ({ name: name[i], value: JSON.stringify({name: value.name[i], price: value.price[i]}) }))}
        defaultItem={1}
        isLoading={isLoading}
        handleForm={handleForm}
      />
    </>
  );
};

export default ZrodlaCiepla;
