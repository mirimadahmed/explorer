import React from "react";
import Logo from "img/logos-solana/logo.png";
import { clusterPath } from "utils/url";
import { Link, NavLink } from "react-router-dom";
import { ClusterStatusButton } from "components/ClusterStatusButton";

export function Navbar() {
  // TODO: use `collapsing` to animate collapsible navbar
  const [collapse, setCollapse] = React.useState(false);

  const openWallet = () => {

  }

  return (
    <nav className="navbar navbar-expand-md navbar-light">
      <div className="container">
        <Link to={clusterPath("/")}>
          <img src={Logo} width="150" alt="Sardis Explorer" style={{width:"50%"}} />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setCollapse((value) => !value)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ml-auto mr-4 ${
            collapse ? "show" : ""
          }`}
        >
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to={clusterPath("/")} exact>
                Network Stats
              </NavLink>
            </li>
            {/* <li className="nav-item">
              <NavLink className="nav-link" to={clusterPath("/supply")}>
                Supply
              </NavLink>
            </li> */}
            <li className="nav-item">
              <NavLink className="nav-link" to={clusterPath("/tx/inspector")}>
              Transaction Auditor
              </NavLink>
            </li>
            <li className="nav-item">
              <a className="nav-link url-link" href="https://sardis-wallet-icccu.ondigitalocean.app/" target="_blank" rel="noreferrer">
              Sardis Wallet
              </a>
            </li>
          </ul>
        </div>

        <div className="d-none d-md-block">
          <ClusterStatusButton />
        </div>
      </div>
    </nav>
  );
}
