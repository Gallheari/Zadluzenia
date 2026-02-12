import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Panel główny</Link>
        </li>
        <li>
          <Link to="/add">Dodaj dług</Link>
        </li>
        <li>
          <Link to="/repay">Spłać dług</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
