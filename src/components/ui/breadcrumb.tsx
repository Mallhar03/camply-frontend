import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navItems } from '../Navigation';

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex space-x-2">
        <li>
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const navItem = navItems.find((item) => item.href === to);
          const label = navItem ? navItem.label : value;
          const isLast = index === pathnames.length - 1;

          return isLast ? (
            <li key={to} className="text-gray-800 font-semibold">
              / {label}
            </li>
          ) : (
            <li key={to}>
              <Link to={to} className="text-gray-500 hover:text-gray-700">
                / {label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;