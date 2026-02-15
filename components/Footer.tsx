import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-muted text-muted-foreground p-4 mt-auto">
      <div className="container mx-auto text-center text-sm">
        © {new Date().getFullYear()} TachyonX. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer; 