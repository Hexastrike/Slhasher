import React, { useEffect, useState } from 'react';
import { IconContext } from "react-icons";
import { IoMoon, IoSunny } from "react-icons/io5";

function Header() {
  // Initialize state based on localStorage value
  const [HXDarkMode, setHXDarkMode] = useState(() => 
    localStorage.getItem('HXTheme') === 'HXThemeDark');

  useEffect(() => {
    // Apply dark mode class on mount if HXTheme is 'HXThemeDark'
    if (HXDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [HXDarkMode]); // Only run when HXDarkMode changes

  const handleColorTheme = () => {
    const newTheme = HXDarkMode ? 'HXThemeLight' : 'HXThemeDark';
    setHXDarkMode(!HXDarkMode); // Toggle the state
    localStorage.setItem('HXTheme', newTheme); // Update localStorage
    document.body.classList.toggle('dark'); // Toggle the class
  };

  return (
    <header className='grid w-full'>
      <div className='hx-header-theme-toggle justify-self-end'>
        <button onClick={handleColorTheme}>
          {
            HXDarkMode ? 
            <IconContext.Provider value={{ color: '#a1a1aa', className: 'text-xl' }}>
              <IoMoon />
            </IconContext.Provider>
            : 
            <IconContext.Provider value={{ className: 'text-xl' }}>
              <IoSunny />
            </IconContext.Provider>
          }
        </button>
      </div>
    </header>
  );
}

export default Header;