import React from 'react'
import { Link } from 'react-router-dom';

const Riding = () => {
  return (
    <div>
      <Link to={'/home'}>
        <h3>
          <i class="ri-home-line"></i>
        </h3>
      </Link>
    </div>
  );
}

export default Riding