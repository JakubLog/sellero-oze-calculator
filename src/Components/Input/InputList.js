import "./Styles/InputList.css";
 
const InputList = ({
  Title,
  isLoading = false,
  Items,
  SubItems,
  Placeholder = "Wybierz opcję",
  PlaceholderEmpty = "Brak / Nie znaleziono",
  defaultItem = null,
  handleForm = null,
  changeFunction = null,
  changeSubFunction = null,
  replaceSubType = null,
}) => {
  const changeFunctionPre = (e) => {
    if (changeFunction) changeFunction(e);
    if (handleForm) handleForm(e);
  };

  const changeFunctionPreSub = (e) => {
    if (changeSubFunction) changeSubFunction(e);
    if (handleForm) handleForm(e);
  };

  return (
    <div className="Container">
      <div className="Header">
        <p>{Title}</p>
      </div>
      <div className="Content">
        <select
          name={Title}
          onChange={changeFunctionPre}
          defaultValue={defaultItem}
          required
          className="FirstSelect"
        >
          {isLoading ? (
            <option>Ładowanie...</option>
          ) : (
            <>
              <option
                value=""
                disabled
                selected
                hidden
                style={{ color: "red" }}
              >
                {Items.length > 1 ? Placeholder : PlaceholderEmpty}
              </option>
              {Items.map((item) =>
                item.name ? (
                  <option
                    key={item.name}
                    value={item.value ? item.value : item.name}
                  >
                    {item.name}
                  </option>
                ) : (
                  <option key={item} value={item}>
                    {item}
                  </option>
                )
              )}
            </>
          )}
        </select>
        {replaceSubType === "number" ? (
          <div className="SubNumberBox">
            <input
              type="number"
              name={`${Title}Value`}
              onChange={changeFunctionPreSub} 
              required
              defaultValue={1}
              className="SubNumber"  
            />
          </div>
        ) : SubItems && (
            <select
              className="SubSelect"
              name={`sub-${Title}`}
              required
              onChange={changeFunctionPreSub}
            >
              {isLoading ? (
                <option>Ładowanie...</option>
              ) : (
                <>
                  <option value="" selected hidden>
                    {SubItems.length > 1 ? Placeholder : PlaceholderEmpty}
                  </option>
                  {SubItems.map((item) =>
                    item.name ? (
                      <option
                        key={item.name}
                        value={item.value ? item.value : item.name}
                      >
                        {item.name}
                      </option>
                    ) : (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    )
                  )}
                </>
              )}
            </select>
        )}
      </div>
    </div>
  );
};

export default InputList;
