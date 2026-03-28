import React, { useState, useRef, useEffect } from 'react';
import { X, Edit3, Palette, Move } from 'lucide-react';
import styles from '../../styles/components/ui/StickyNote.module.css';

interface StickyNoteProps {
  id: string;
  content: string;
  color: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  onBringToFront: (id: string) => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  id,
  content,
  color,
  position,
  size,
  zIndex,
  onUpdate,
  onDelete,
  onBringToFront
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const colors = [
    '#ffd700', // Yellow
    '#ff6b6b', // Red
    '#4ecdc4', // Teal
    '#45b7d1', // Blue
    '#96ceb4', // Green
    '#feca57', // Orange
    '#ff9ff3', // Pink
    '#54a0ff'  // Light Blue
  ];

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === noteRef.current || (e.target as HTMLElement).classList.contains(styles.header)) {
      onBringToFront(id);
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y))
        };
        onUpdate(id, { position: newPosition });
      }

      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newSize = {
          width: Math.max(150, Math.min(400, resizeStart.width + deltaX)),
          height: Math.max(150, Math.min(400, resizeStart.height + deltaY))
        };
        onUpdate(id, { size: newSize });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, id, onUpdate, size]);

  const handleSaveContent = () => {
    onUpdate(id, { content: editContent });
    setIsEditing(false);
  };

  const handleColorChange = (newColor: string) => {
    onUpdate(id, { color: newColor });
    setShowColorPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveContent();
    } else if (e.key === 'Escape') {
      setEditContent(content);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={noteRef}
      className={styles.stickyNote}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        backgroundColor: color,
        zIndex: zIndex,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={styles.header}>
        <div className={styles.controls}>
          <button
            className={styles.controlButton}
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            title="Edit note"
          >
            <Edit3 size={14} />
          </button>
          <button
            className={styles.controlButton}
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            title="Change color"
          >
            <Palette size={14} />
          </button>
          <button
            className={styles.controlButton}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            title="Delete note"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {showColorPicker && (
        <div className={styles.colorPicker}>
          {colors.map((colorOption) => (
            <button
              key={colorOption}
              className={styles.colorOption}
              style={{ backgroundColor: colorOption }}
              onClick={() => handleColorChange(colorOption)}
            />
          ))}
        </div>
      )}

      <div className={styles.content}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleSaveContent}
            onKeyDown={handleKeyDown}
            className={styles.textarea}
            placeholder="Type your note here..."
            maxLength={500}
          />
        ) : (
          <div
            className={styles.text}
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            {content || 'Click to edit...'}
          </div>
        )}
      </div>

      <div
        className={styles.resizeHandle}
        onMouseDown={handleResizeMouseDown}
        title="Resize note"
      >
        <Move size={12} />
      </div>
    </div>
  );
};

export default StickyNote;
