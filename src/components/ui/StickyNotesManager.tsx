import React, { useState, useEffect } from 'react';
import { Plus, StickyNote as StickyNoteIcon } from 'lucide-react';
import StickyNote from './StickyNote';
import styles from '../../styles/components/ui/StickyNotesManager.module.css';
import { 
  getStickyNotes, 
  createStickyNote, 
  updateStickyNote, 
  deleteStickyNote, 
  bringToFront 
} from '@/services/stickyNote_service';
import { useAuth } from '@/context/AuthContext';

interface StickyNoteData {
  _id: string;
  content: string;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isVisible: boolean;
}

const StickyNotesManager: React.FC = () => {
  const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showManager, setShowManager] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadStickyNotes();
    }
  }, [isAuthenticated]);

  const loadStickyNotes = async () => {
    try {
      setIsLoading(true);
      const response = await getStickyNotes();
      if (response.success) {
        setStickyNotes(response.data);
      }
    } catch (error) {
      console.error('Failed to load sticky notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      // Create note at a random position to avoid overlap
      const randomX = Math.random() * (window.innerWidth - 250);
      const randomY = Math.random() * (window.innerHeight - 250) + 100;
      
      console.log('Creating sticky note...', { randomX, randomY });
      
      const response = await createStickyNote({
        content: 'New note...',
        color: '#ffd700',
        position: { x: randomX, y: randomY },
        size: { width: 200, height: 200 }
      });
      
      console.log('Create response:', response);
      
      if (response.success) {
        setStickyNotes(prev => [...prev, response.data]);
        console.log('Note created successfully:', response.data);
      } else {
        console.error('Create failed:', response);
        alert('Failed to create sticky note: ' + (response.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Failed to create sticky note:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to create sticky note: ' + errorMessage);
    }
  };

  const handleUpdateNote = async (id: string, updates: any) => {
    try {
      const response = await updateStickyNote(id, updates);
      if (response.success) {
        setStickyNotes(prev => 
          prev.map(note => 
            note._id === id ? { ...note, ...updates } : note
          )
        );
      }
    } catch (error) {
      console.error('Failed to update sticky note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const response = await deleteStickyNote(id);
      if (response.success) {
        setStickyNotes(prev => prev.filter(note => note._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete sticky note:', error);
    }
  };

  const handleBringToFront = async (id: string) => {
    try {
      const response = await bringToFront(id);
      if (response.success) {
        setStickyNotes(prev => 
          prev.map(note => 
            note._id === id ? { ...note, zIndex: response.data.zIndex } : note
          )
        );
      }
    } catch (error) {
      console.error('Failed to bring note to front:', error);
    }
  };

  // Debug log
  console.log('StickyNotesManager - isAuthenticated:', isAuthenticated, 'user:', user);

  // Temporarily always show the component for testing
  // if (!isAuthenticated) {
  //   return null;
  // }

  return (
    <>
      {/* Sticky Notes Manager Button */}
      <button
        className={styles.managerButton}
        onClick={() => setShowManager(!showManager)}
        title="Manage Sticky Notes"
      >
        <StickyNoteIcon size={20} />
        {stickyNotes.length > 0 && (
          <span className={styles.noteCount}>{stickyNotes.length}</span>
        )}
      </button>

      {/* Manager Panel */}
      {showManager && (
        <div className={styles.managerPanel}>
          <div className={styles.panelHeader}>
            <h3>Sticky Notes</h3>
            <button
              className={styles.addButton}
              onClick={handleCreateNote}
              disabled={stickyNotes.length >= 10}
              title={stickyNotes.length >= 10 ? 'Maximum 10 notes allowed' : 'Add new note'}
            >
              <Plus size={16} />
              Add Note
            </button>
          </div>
          
          <div className={styles.notesList}>
            {isLoading ? (
              <div className={styles.loading}>Loading notes...</div>
            ) : stickyNotes.length === 0 ? (
              <div className={styles.emptyState}>
                <StickyNoteIcon size={48} opacity={0.3} />
                <p>No sticky notes yet</p>
                <button onClick={handleCreateNote} className={styles.createFirstNote}>
                  Create your first note
                </button>
              </div>
            ) : (
              stickyNotes.map(note => (
                <div key={note._id} className={styles.noteItem}>
                  <div 
                    className={styles.notePreview}
                    style={{ backgroundColor: note.color }}
                  >
                    {note.content.substring(0, 50)}
                    {note.content.length > 50 && '...'}
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className={styles.deleteButton}
                    title="Delete note"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
          
          {stickyNotes.length > 0 && (
            <div className={styles.panelFooter}>
              <small>{stickyNotes.length}/10 notes</small>
            </div>
          )}
        </div>
      )}

      {/* Render Sticky Notes */}
      {stickyNotes.map(note => (
        <StickyNote
          key={note._id}
          id={note._id}
          content={note.content}
          color={note.color}
          position={note.position}
          size={note.size}
          zIndex={note.zIndex}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
          onBringToFront={handleBringToFront}
        />
      ))}
    </>
  );
};

export default StickyNotesManager;
