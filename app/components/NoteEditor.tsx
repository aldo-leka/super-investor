import React, { useState } from 'react';

interface NoteEditorProps {
    selectedText: string;
    onAddNote: (content: string) => void;
}

export function NoteEditor({ selectedText, onAddNote }: NoteEditorProps) {
    const [noteContent, setNoteContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (noteContent.trim()) {
            onAddNote(noteContent);
            setNoteContent('');
        }
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Add Note</h3>
            {selectedText && (
                <p className="text-sm text-gray-500 italic mb-2">
                    Selected text: &quot;{selectedText}&quot;
                </p>
            )}
            <form onSubmit={handleSubmit}>
        <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Enter your note..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
        />
                <button
                    type="submit"
                    disabled={!selectedText || !noteContent.trim()}
                    className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    Save Note
                </button>
            </form>
        </div>
    );
}