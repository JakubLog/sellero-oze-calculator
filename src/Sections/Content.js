import ClientInfo from "./ClientInfo";
import Configurator from "./Configurator";
import "./Styles/Content.css";
import logo from "../cropped-logo-320x37.png";

function Content() {
  return (
    <div>
      <ClientInfo />
      <Configurator />
      <div>
        <img src={logo} style={{position: "absolute", right: 15, top: 15}} width="200" />
      </div>
    </div>
  );
}

export default Content;
