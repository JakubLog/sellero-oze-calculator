import { useEffect, useState } from "react";
import "./Styles/Configurator.css";
import Airtable from "airtable";
import InputList from "../Components/Input/InputList";
import MultiListInput from "../Components/Input/MultiListInput";

const table = new Airtable({
  apiKey:
    "patrJ0u69TVWKFUff.9c91979b177708e556a8b1d331b71b5c463b3a192ac81e31e7e1ae933fc2543e",
}).base("appkqjNBUA2Ok9LXv");

// Nazwy baz danych w AirTable
const modulesBase = "Moduły Main";
const modulesNextBase = "Moduły";
const falownikiBase = "Falowniki";

function Installation({ handleForm, formValues, option, falownikCategory }) {
  const [modules, setModules] = useState([]);
  const [falowniki, setFalowniki] = useState([]);
  const [modulesValues, setModulesValues] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [isFalownikiLoading, setFalownikiLoading] = useState(false);

  // Po zmianie modułu
  const onModuleChange = (event) => {
    const { value } = event.target;

    table(modulesNextBase)
      .select()
      .firstPage((err, records) => {
        if (err) console.error(err);
        else {
          setLoading(true);
          let moduleDetails = records.filter(
            ({ fields }) => fields["Module Name"][0] === value
          );
          const moduleDetailsSorted = moduleDetails.sort(
            (a, b) => a.fields["kW Value"] - b.fields["kW Value"]
          );
          const moduleDetailsProcessed = moduleDetailsSorted.map(
            ({ fields }) => ({
              name: `${fields["Ilość paneli"]} - ${
                fields["kW Value"] / 100
              } kW (${fields["Ile faz"]})`,
              value: JSON.stringify({
                kw: fields["kW Value"] / 100,
                fazy: fields["Ile faz"],
                price:
                  formValues["Konstrukcja"] &&
                  formValues["Konstrukcja"] === "Grunt"
                    ? fields["Price Grunt"]
                    : fields["Price"],
                howMuch: fields["Ilość paneli"],
              }),
            })
          );
          setModulesValues(moduleDetailsProcessed);
          setLoading(false);
        }
      });
  };

  const onModuleValuesChange = (event) => {
    const { value } = event.target;

    const { kw } = JSON.parse(value);

    setFalownikiLoading(true);

    table(falownikiBase)
      .select()
      .firstPage((err, records) => {
        let foundFalowniki = [];
        if (option === "Instalacja PV + magazyn energii") {
          foundFalowniki = records.filter(
            (record) =>
              (record.fields["Moc falownika min"] / 100 <= kw &&
                record.fields["Moc falownika max"] / 100 >= kw &&
                record.fields["Kategoria"] === "Hybryda") ||
              record.fields["Kategoria"] === "Zestaw"
          );
        } else if (option === "Instalacja PV") {
          foundFalowniki = records.filter(
            (record) =>
              record.fields["Moc falownika min"] / 100 <= kw &&
              record.fields["Moc falownika max"] / 100 >= kw &&
              record.fields["Kategoria"] === "Zwykły"
          );
        } else {
          foundFalowniki = records.filter(
            (record) =>
              record.fields["Moc falownika min"] / 100 <= kw &&
              record.fields["Moc falownika max"] / 100 >= kw
          );
        }

        const namesOfFalowniki = foundFalowniki.map(({ fields }) => ({
          name: fields.Name,
          price: fields.Price,
          category: fields["Kategoria"],
        }));

        setFalowniki(namesOfFalowniki);
        setFalownikiLoading(false);
      });
  };

  // Pobranie nazw modułów z bazy danych
  const fetchModulesData = async () => {
    await table(modulesBase)
      .select()
      .firstPage((err, records) => {
        if (err) console.error(err);
        else {
          const modulesData = records.map(({ fields: { Name } }) => Name);
          setModules(modulesData);
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
    if (modules.length > 0) {
      setLoading(false);
    }
  }, [modules]);

  return (
    <>
      {option === "Instalacja PV + magazyn energii" ||
      option === "Instalacja PV" ? (
        <InputList
          Title={"Status instalacji"}
          Items={["Nowa instalacja", "Rozbudowa istniejącej instalacji"]}
          handleForm={handleForm}
        />
      ) : null}
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
      {option === "Instalacja PV + magazyn energii" ||
      option === "Instalacja PV" ? (
        <>
          <InputList
            Title={"Konstrukcja"}
            Items={["Grunt", "Dach"]}
            handleForm={handleForm}
          />
          <InputList
            Title={"Moduły"}
            Items={modules}
            SubItems={modulesValues}
            handleForm={handleForm}
            changeFunction={onModuleChange}
            changeSubFunction={onModuleValuesChange}
            isLoading={isLoading}
          />
          <InputList
            Title={"Falownik"}
            Items={falowniki.map(({ name, price, category }) => ({
              name,
              value: JSON.stringify({ price, category }),
            }))}
            PlaceholderEmpty={"Wybierz ilość modułów"}
            Placeholder={"Wybierz opcję"}
            isLoading={isFalownikiLoading}
            replaceSubType={"number"}
            handleForm={handleForm}
          />
        </>
      ) : null}
      {(option === "Magazyn energii" ||
        option === "Instalacja PV + magazyn energii") &&
      falownikCategory !== "Zestaw" ? (
        <>
          <InputList
            Title={"Magazyn energii"}
            Items={["Magazyn 1", "Magazyn 2"]}
            handleForm={handleForm}
          />
          <InputList
            Title={"Magazyn ciepła"}
            Items={["Mag 1", "Mag 2"]}
            handleForm={handleForm}
          />
        </>
      ) : null}
      <MultiListInput
        Title={"Opcje"}
        options={["Ładowarka elektyczna", "Uchwyt na kabel", "Optymalizator"]}
        handleForm={handleForm}
        isCustomOption={true}
      />
    </>
  );
}

export default Installation;
