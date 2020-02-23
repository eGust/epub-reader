import React, { ReactNode } from 'react';

interface TabPanelProps {
  children: ReactNode
}

const TabPanel = ({ children }: TabPanelProps) => (
  <div className="tab-panel flex column">
    {
      children
    }
  </div>
);

export default TabPanel;
