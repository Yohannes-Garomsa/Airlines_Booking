import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-200 py-4 flex items-center justify-center fixed bottom-0 left-0">
      <div className="text-center text-sm max-w-4xl mx-auto px-4">
        © {new Date().getFullYear()} SkyBound Airlines. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
