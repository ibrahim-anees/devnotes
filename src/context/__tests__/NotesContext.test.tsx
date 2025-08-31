import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { NotesProvider, useNotes } from '../NotesContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotesProvider>{children}</NotesProvider>
);

describe('NotesContext', () => {
  it('should provide initial state', () => {
    const { result } = renderHook(() => useNotes(), { wrapper });
    
    expect(result.current.notes).toHaveLength(1); // Sample note
    expect(result.current.folders).toContain('JavaScript');
    expect(result.current.notes[0].title).toBe('JavaScript Closures');
  });

  it('should add a new note', () => {
    const { result } = renderHook(() => useNotes(), { wrapper });
    
    const newNote = {
      title: 'Test Note',
      content: 'Test content',
      tags: ['test'],
      folder: 'Test Folder',
    };

    act(() => {
      result.current.addNote(newNote);
    });

    expect(result.current.notes).toHaveLength(2);
    expect(result.current.notes[1].title).toBe('Test Note');
    expect(result.current.notes[1].content).toBe('Test content');
  });

  it('should update an existing note', () => {
    const { result } = renderHook(() => useNotes(), { wrapper });
    
    const noteId = result.current.notes[0].id;
    const updatedData = {
      title: 'Updated Title',
      content: 'Updated content',
    };

    act(() => {
      result.current.updateNote(noteId, updatedData);
    });

    const updatedNote = result.current.notes.find(note => note.id === noteId);
    expect(updatedNote?.title).toBe('Updated Title');
    expect(updatedNote?.content).toBe('Updated content');
  });

  it('should delete a note', () => {
    const { result } = renderHook(() => useNotes(), { wrapper });
    
    const initialLength = result.current.notes.length;
    const noteId = result.current.notes[0].id;

    act(() => {
      result.current.deleteNote(noteId);
    });

    expect(result.current.notes).toHaveLength(initialLength - 1);
    expect(result.current.notes.find(note => note.id === noteId)).toBeUndefined();
  });

  it('should add a new folder', () => {
    const { result } = renderHook(() => useNotes(), { wrapper });
    
    act(() => {
      result.current.addFolder('New Folder');
    });

    expect(result.current.folders).toContain('New Folder');
  });

  it('should search notes by title and content', () => {
    const { result } = renderHook(() => useNotes(), { wrapper });
    
    // Add a test note
    act(() => {
      result.current.addNote({
        title: 'React Hooks',
        content: 'useState and useEffect are important hooks',
        tags: ['react'],
        folder: 'React',
      });
    });

    const searchResults = result.current.searchNotes('hooks');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].title).toBe('React Hooks');
  });

  it('should get notes by folder', () => {
    const { result } = renderHook(() => useNotes(), { wrapper });
    
    const jsNotes = result.current.getNotesByFolder('JavaScript');
    expect(jsNotes).toHaveLength(1);
    expect(jsNotes[0].title).toBe('JavaScript Closures');
  });

  it('should get notes by tag', () => {
    const { result } = renderHook(() => useNotes(), { wrapper });
    
    const fundamentalsNotes = result.current.getNotesByTag('fundamentals');
    expect(fundamentalsNotes).toHaveLength(1);
    expect(fundamentalsNotes[0].title).toBe('JavaScript Closures');
  });
});
