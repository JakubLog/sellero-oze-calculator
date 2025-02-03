import './Styles/ClientInfo.css';

function ClientInfo() {
  return (
    <div className="ClientHeader">
      <h1>Informacje o kliencie</h1>
      <div className="ClientContent">
        <div className="ClientOptions">
          <b>Status:</b>
          <p>Połączony z systemem Bitrix24 ✅</p>
        </div>
      </div>
    </div>
  );
}

export default ClientInfo;
