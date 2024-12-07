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

  const buildBuforList = (name) => {
    const copyOfList = [...buforCOList];
    const firstItem = copyOfList.filter((item) => item === name);
    const restItems = copyOfList.filter((item) => item !== name);
    const readyArray = [firstItem[0], ...restItems];
    setFilteredBuforCOList(readyArray);
  };

  const checkIsBuforExtraPrice = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
      if (filteredBuforCOList[0] !== selectedValue) {
        handleForm({
          target: {
            name: "Bufor CO",
            value: JSON.stringify({ name: selectedValue, price: 1000 }),
          },
        });
      }
    }
    return 0;
  };

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
    table(zrodlaTable)
      .select()
      .firstPage((err, records) => {
        const preparedRecords = records.map((record) => {
          const { fields } = record;
          return {
            name: fields["Name"],
            value: JSON.stringify({
              price: fields["Price"],
              buforCO: fields["Bufor CO"][0],
            }),
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
        Items={["1 FAZOWA", "3 FAZOWA"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Rodzaj pompy"}
        Items={["Powietrze - Woda", "Grunt"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Pompa ciepła"}
        Items={heatPump}
        isLoading={isLoading}
        handleForm={handleForm}
      />
      <InputList
        Title={"Bufor CO"}
        Items={filteredBuforCOList}
        selectedItem={filteredBuforCOList[0]}
        changeFunction={checkIsBuforExtraPrice}
        parameters={{ isFormHandled: true }}
        isLoading={isLoading}
        handleForm={handleForm}
      />
    </>
  );
};

export default ZrodlaCiepla;
