import React, { createContext, useContext, useState, useCallback } from 'react';
import { Note } from '../types';

interface NotesContextType {
  notes: Note[];
  folders: string[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addFolder: (name: string) => void;
  deleteFolder: (name: string) => void;
  getNotesByFolder: (folder: string) => Note[];
  getNotesByTag: (tag: string) => Note[];
  searchNotes: (query: string) => Note[];
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

// Sample note for testing
const sampleNote: Note = {
  id: '1',
  title: 'JavaScript Closures',
  content: '# Closures in JavaScript\n\nA closure is the combination of a function and the lexical environment within which that function was declared.\n\n```javascript\nfunction createCounter() {\n  let count = 0;\n  return function() {\n    return ++count;\n  }\n}\n\nconst counter = createCounter();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2\n```\n\nClosures are useful for:\n- Data privacy\n- Function factories\n- Module pattern',
  tags: ['javascript', 'fundamentals'],
  folder: 'JavaScript',
  createdAt: new Date(),
  updatedAt: new Date(),
  formatting: {
    fontSize: 16,
    fontFamily: 'System',
    textColor: '#000000',
    backgroundColor: '#ffffff',
  },
};

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([sampleNote]);
  const [folders, setFolders] = useState<string[]>(['JavaScript']);

  const addNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setNotes(prev => [...prev, newNote]);
  }, []);

  const updateNote = useCallback((id: string, noteUpdate: Partial<Note>) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, ...noteUpdate, updatedAt: new Date() }
          : note
      )
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, []);

  const addFolder = useCallback((name: string) => {
    setFolders(prev => [...new Set([...prev, name])]);
  }, []);

  const deleteFolder = useCallback((name: string) => {
    setFolders(prev => prev.filter(folder => folder !== name));
    // Move notes from deleted folder to 'Uncategorized'
    setNotes(prev =>
      prev.map(note =>
        note.folder === name
          ? { ...note, folder: 'Uncategorized', updatedAt: new Date() }
          : note
      )
    );
  }, []);

  const getNotesByFolder = useCallback(
    (folder: string) => notes.filter(note => note.folder === folder),
    [notes]
  );

  const getNotesByTag = useCallback(
    (tag: string) => notes.filter(note => note.tags.includes(tag)),
    [notes]
  );

  const searchNotes = useCallback(
    (query: string) => {
      const lowercaseQuery = query.toLowerCase();
      return notes.filter(
        note =>
          note.title.toLowerCase().includes(lowercaseQuery) ||
          note.content.toLowerCase().includes(lowercaseQuery) ||
          note.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
    },
    [notes]
  );

  return (
    <NotesContext.Provider
      value={{
        notes,
        folders,
        addNote,
        updateNote,
        deleteNote,
        addFolder,
        deleteFolder,
        getNotesByFolder,
        getNotesByTag,
        searchNotes,
      }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
