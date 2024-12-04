import "./Styles/ClientInfo.css";

function ClientInfo() {
  return (
    <div className="ClientHeader">
      <h1>Informacje o kliencie</h1>
      <div className="ClientContent">
        <div className="ClientOptions">
          <b>Status:</b>
          <p>Połączony z systemem Bitrix24 {`(Klient #ID)`} ✅</p>
        </div>
        <div className="ClientOptions">
          <b>Nazwa klienta:</b>
          <p>Jakub Fedoszczak</p>
        </div>
        <div className="ClientOptions">
          <b>Adres:</b>
          <p>Środa Śląska ul. Wrocławska 63/4, 55-300</p>
        </div>
        <div className="ClientOptions">
          <b>Budżet:</b>
          <p>50 000 zł</p>
        </div>
      </div>
    </div>
  );
}

export default ClientInfo;
