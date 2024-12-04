import "./Styles/InputNumber.css";

const InputNumber = ({
  Title,
  handleForm = null,
  changeInputFunction = null
}) => {
  const changeFunction = (e) => {
    const value = e.target.value;

    if (changeInputFunction) changeInputFunction(e);
    if (handleForm) handleForm({ target: { value: JSON.stringify({price: Number(value)}), name: Title }});
  };

  return (
    <div className="Container">
      <div className="Header">
        <p>{Title}</p>
      </div>
      <div className="Content">
        <div className="InputStylesBox">
            <input
              type="number"
              name={`${Title}`} 
              onChange={changeFunction} 
              required
              className="InputStyles"  
            />
            </div>
       </div>
    </div>
  );
};

export default InputNumber;
