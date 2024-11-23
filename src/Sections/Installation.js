import { useEffect, useState } from "react";
import "./Styles/Configurator.css";
import Airtable from "airtable";
import InputList from "../Components/Input/InputList";

const table = new Airtable({
  apiKey:
    "patrJ0u69TVWKFUff.9c91979b177708e556a8b1d331b71b5c463b3a192ac81e31e7e1ae933fc2543e",
}).base("appkqjNBUA2Ok9LXv");

// Nazwy baz danych w AirTable
const modulesBase = "Moduły";
const falownikiBase = "Falowniki";
// Ilość panelu dostępnych do wybrania
const countOfModules = 22;

function Installation({ handleForm }) {
  const [modules, setModules] = useState([]);
  const [falowniki, setFalowniki] = useState([]);
  const [modulesValues, setModulesValues] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isFalownikiLoading, setFalownikiLoading] = useState(false);

  // Po zmianie modułu
  const onModuleChange = (event) => {
    const { value } = event.target;

    // Zmiana dostępnych paneli do wyboru
    const list = modules.find((v) => v.name === value).kWoltList;
    setModulesValues(list);
  };

  const onModuleValuesChange = (event) => {
    const { value } = event.target;

    const { kWoltValue } = JSON.parse(value);

    setFalownikiLoading(true);

    table(falownikiBase)
      .select()
      .firstPage((err, records) => {
        const foundFalowniki = records.filter(
          (record) =>
            record.fields["Moc falownika min"] <= kWoltValue &&
            record.fields["Moc falownika max"] >= kWoltValue
        );

        const namesOfFalowniki = foundFalowniki.map(
          ({ fields: { Name } }) => Name
        );

        setFalowniki(namesOfFalowniki);
        setFalownikiLoading(false);
      });
  };

  const fetchModulesData = async () => {
    await table(modulesBase)
      .select()
      .firstPage((err, records) => {
        if (err) console.error(err);
        else {
          records.forEach((record) => {
            const { Name } = record.fields;
            const woltValue = record.fields["Wartość W"];
            const price = record.fields["Price"];

            const kWoltList = [];

            for (let i = 1; i < countOfModules; i++) {
              const resultOfCalculation = (woltValue * i) / 1000;

              const calcPrice = price * i;

              const countedObject = {
                howMany: i,
                kWoltValue: resultOfCalculation,
                price: calcPrice,
              };

              kWoltList.push(countedObject);
            }

            setModules((base) => [...base, { name: Name, kWoltList }]);
          });
        }
      });
  };

  // Uruchomienie po inicjalizacji aplikacji
  useEffect(() => {
    setModules([]);
    fetchModulesData();
  }, []);

  // Uruchomienie po wczytaniu modułów
  useEffect(() => {
    if (modules.length > 0 && modulesValues.length === 0) {
      setLoading(true);
      // Pobranie list możliwości dla modułów
      const list = modules[0].kWoltList;
      setModulesValues(list);

      setLoading(false);
    }
  }, [modules]);

  return (
    <>
      <InputList
        Title={"Status instalacji"}
        Items={["Nowa instalacja", "Rozbudowa istniejącej instalacji"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Rodzaj finansowania"}
        Items={["Prefinansowanie", "Gotówka"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"System rozliczania"}
        Items={["Obceny system rozliczeń", "Inny"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Konstrukcja"}
        Items={["Grunt", "Dach"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Moduły"}
        Items={modules}
        SubItems={modulesValues.map(({ howMany, kWoltValue, price }) => ({
          name: `${howMany} - ${kWoltValue} kW`,
          value: JSON.stringify({ howMany, kWoltValue, price }),
        }))}
        handleForm={handleForm}
        changeFunction={onModuleChange}
        changeSubFunction={onModuleValuesChange}
        isLoading={isLoading}
      />
      <InputList
        Title={"Falownik"}
        Items={falowniki}
        PlaceholderEmpty={"Wybierz ilość modułów"}
        Placeholder={"Wybierz opcję"}
        isLoading={isFalownikiLoading}
        SubItems={["Grunt", "Inne"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Drugi falownik"}
        Items={falowniki}
        PlaceholderEmpty={"Wybierz ilość modułów"}
        Placeholder={"Wybierz opcję"}
        isLoading={isFalownikiLoading}
        SubItems={["Grunt", "Inne"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Magazyn energii"}
        Items={["Test", "Test"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Magazyn ciepła"}
        Items={["Test", "Test"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"System zarządzania energią"}
        Items={["Grunt", "Dach"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Optymalizatory"}
        Items={["Grunt", "Dach"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Rozłącznik prądu stałego"}
        Items={["Grunt", "Dach"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Zasilanie instalacji"}
        Items={["Grunt", "Dach"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Przekop"}
        Items={["Grunt", "Dach"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Ładowarka AC"}
        Items={["Grunt", "Dach"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Ładowarka do samochodów elektrycznych"}
        Items={["Grunt", "Dach"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Słupek montażowy"}
        Items={["Grunt", "Dach"]}
        handleForm={handleForm}
      />
      <InputList
        Title={"Uchwyt na kabel"}
        Items={["Grunt", "Dach"]}
        handleForm={handleForm}
      />
    </>
  );
}

export default Installation;
