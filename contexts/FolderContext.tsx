import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Folder {
  title: string;
  tasks: number;
  image: any;
}

interface FolderContextProps {
  folders: Folder[];
  addFolder: (folder: Folder) => void;
}

const FolderContext = createContext<FolderContextProps | null>(null); // safer than undefined

export const FolderProvider = ({ children }: { children: ReactNode }) => {
  const [folders, setFolders] = useState<Folder[]>([
    {
      title: 'Daily Tasks',
      tasks: 2,
      image: require('../app/assets/images/folder1.png'),
    },
    {
      title: 'Hydration Goals',
      tasks: 1,
      image: require('../app/assets/images/folder2.png'),
    },
    {
      title: 'Outdoor Fun',
      tasks: 1,
      image: require('../app/assets/images/folder3.png'),
    },
    {
      title: 'Indoor Activities',
      tasks: 1,
      image: require('../app/assets/images/folder4.png'),
    },
    {
      title: 'Goals',
      tasks: 0,
      image: require('../app/assets/images/folder1.png'),
    },
    {
      title: 'School Activities',
      tasks: 0,
      image: require('../app/assets/images/folder2.png'),
    },
  ]);

  const addFolder = (folder: Folder) => {
    setFolders(prev => [...prev, folder]);
  };

  return (
    <FolderContext.Provider value={{ folders, addFolder }}>
      {children}
    </FolderContext.Provider>
  );
};

// Safe custom hook
export const useFolderContext = (): FolderContextProps => {
  const context = useContext(FolderContext);
  if (!context) {
    throw new Error('useFolderContext must be used within a FolderProvider');
  }
  return context;
};