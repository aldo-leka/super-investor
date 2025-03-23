import React, { useState, useRef, useEffect } from 'react';
import { Filing, Note } from '../types';
import { NoteEditor } from './NoteEditor';
import { BookOpen, Type, Minus, Plus, MessageSquarePlus, X } from 'lucide-react';

interface FilingViewerProps {
    filing: Filing;
    notes: Note[];
    onAddNote: (note: Omit<Note, 'id' | 'timestamp'>) => void;
}

export function FilingViewer({ filing, notes, onAddNote }: FilingViewerProps) {
    const [selectedText, setSelectedText] = useState('');
    const [currentSection, setCurrentSection] = useState(0);
    const [fontSize, setFontSize] = useState(16);
    const [hoveredNote, setHoveredNote] = useState<string | null>(null);
    const [showMobileNoteEditor, setShowMobileNoteEditor] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            setSelectedText(selection.toString());
            setCurrentSection(findCurrentSection(selection));
            if (window.innerWidth < 768) {
                setShowMobileNoteEditor(true);
            }
        }
    };

    const findCurrentSection = (selection: Selection): number => {
        if (!contentRef.current) return 0;
        const sections = contentRef.current.querySelectorAll('.filing-section');
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer.parentElement;

        for (let i = 0; i < sections.length; i++) {
            if (sections[i].contains(container)) {
                return i;
            }
        }
        return 0;
    };

    const scrollToNote = (note: Note) => {
        if (!contentRef.current) return;

        const sections = contentRef.current.querySelectorAll('.filing-section');
        const section = sections[note.sectionIndex];
        if (!section) return;

        // Find all text nodes in the section
        const walker = document.createTreeWalker(
            section,
            NodeFilter.SHOW_TEXT,
            null
        );

        let node;
        while (node = walker.nextNode()) {
            const text = node.textContent || '';
            const index = text.indexOf(note.textSelection);

            if (index !== -1) {
                try {
                    // Create and position range
                    const range = document.createRange();
                    range.setStart(node, index);
                    range.setEnd(node, index + note.textSelection.length);

                    // Scroll into view
                    range.startContainer.parentElement?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });

                    // Clear any existing highlights
                    document.querySelectorAll('.highlight-note').forEach(el => {
                        const parent = el.parentNode;
                        if (parent) {
                            parent.replaceChild(document.createTextNode(el.textContent || ''), el);
                        }
                    });

                    // Add new highlight
                    const span = document.createElement('span');
                    span.className = 'highlight-note bg-yellow-200 transition-all duration-300';
                    range.surroundContents(span);

                    // Remove highlight after delay
                    setTimeout(() => {
                        if (span.parentNode) {
                            span.classList.remove('bg-yellow-200');
                            span.classList.add('bg-transparent');
                        }
                    }, 2000);

                    break;
                } catch (error) {
                    console.error('Error highlighting text:', error);
                    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    };

    const adjustFontSize = (delta: number) => {
        setFontSize(prev => Math.min(Math.max(12, prev + delta), 24));
    };

    const handleAddNote = (content: string) => {
        onAddNote({
            filingId: filing.id,
            textSelection: selectedText,
            content,
            sectionIndex: currentSection,
            textPosition: {
                start: 0,
                end: selectedText.length
            }
        });
        setSelectedText('');
        setShowMobileNoteEditor(false);
    };

    const filingNotes = notes.filter(note => note.filingId === filing.id);

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{filing.companyName} ({filing.symbol})</h2>
                    <p className="text-gray-600">Form {filing.formType} • Filed on {filing.filingDate}</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                    <Type className="h-5 w-5 text-gray-600" />
                    <button
                        onClick={() => adjustFontSize(-1)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Decrease font size"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium text-gray-700 min-w-[2rem] text-center">
            {fontSize}px
          </span>
                    <button
                        onClick={() => adjustFontSize(1)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Increase font size"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:gap-6">
                <div className="flex-1">
                    <div
                        ref={contentRef}
                        className="prose max-w-none"
                        onMouseUp={handleTextSelection}
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        {filing.sections.map((section, index) => {
                            const sectionNotes = filingNotes.filter(note => note.sectionIndex === index);

                            return (
                                <div key={index} className="filing-section mb-8">
                                    <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
                                    <div className="whitespace-pre-wrap leading-relaxed">{section.content}</div>

                                    {/* Mobile: Inline notes */}
                                    <div className="md:hidden mt-4">
                                        {sectionNotes.length > 0 && (
                                            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                                                <h4 className="font-medium text-blue-900 flex items-center gap-2">
                                                    <BookOpen className="h-4 w-4" />
                                                    Notes for this section
                                                </h4>
                                                {sectionNotes.map(note => (
                                                    <div
                                                        key={note.id}
                                                        className="bg-white p-3 rounded-md shadow-sm"
                                                        onClick={() => scrollToNote(note)}
                                                    >
                                                        <p className="text-sm text-gray-500 italic mb-1">
                                                            "{note.textSelection}"
                                                        </p>
                                                        <p className="text-gray-900 text-sm">{note.content}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Desktop: Sidebar notes */}
                <div className="hidden md:block w-96">
                    <div className="sticky top-6">
                        <NoteEditor
                            selectedText={selectedText}
                            onAddNote={handleAddNote}
                        />

                        <div className="mt-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                                Notes ({filingNotes.length})
                            </h3>
                            <div className="space-y-4">
                                {filingNotes.map(note => (
                                    <div
                                        key={note.id}
                                        className={`bg-gray-50 p-4 rounded-lg transition-all duration-300 cursor-pointer
                      ${hoveredNote === note.id ? 'bg-blue-50 shadow-md transform scale-[1.02]' : 'hover:bg-gray-100'}`}
                                        onClick={() => scrollToNote(note)}
                                        onMouseEnter={() => setHoveredNote(note.id)}
                                        onMouseLeave={() => setHoveredNote(null)}
                                    >
                                        <p className="text-sm text-gray-500 italic mb-2 line-clamp-2">
                                            "{note.textSelection}"
                                        </p>
                                        <p className="text-gray-900">{note.content}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {new Date(note.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile: Floating add note button */}
            <button
                onClick={() => setShowMobileNoteEditor(true)}
                className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            >
                <MessageSquarePlus className="h-6 w-6" />
            </button>

            {/* Mobile: Note editor modal */}
            {showMobileNoteEditor && (
                <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
                    <div className="bg-white w-full rounded-t-xl p-4 animate-slide-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">Add Note</h3>
                            <button
                                onClick={() => setShowMobileNoteEditor(false)}
                                className="p-1 hover:bg-gray-100 rounded-full"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <NoteEditor
                            selectedText={selectedText}
                            onAddNote={handleAddNote}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}