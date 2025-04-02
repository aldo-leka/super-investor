import React, { useState, useEffect } from 'react';
import {Badge} from '@/components/ui/badge';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Download, MessageSquare, Code, FileText} from 'lucide-react';
import Link from 'next/link';
import {Filing} from '@/types';
import {itemMap} from '@/lib/filingUtils';
import { toast } from 'sonner';

interface Props {
    filing: Filing | null;
    category: string;
}

export default function FilingViewer({filing, category}: Props) {
    const [isRawView, setIsRawView] = useState(false);
    const [content, setContent] = useState<Record<string, string> | null>(null);
    const [rawContent, setRawContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (filing) {
            loadContent();
        }
    }, [filing, isRawView]);

    const loadContent = async () => {
        if (!filing) return;
        
        setLoading(true);
        try {
            const endpoint = isRawView 
                ? `/filing-content/raw/${filing.fileName}`
                : `/filing-content/${filing.fileName}`;
                
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`);
            
            if (!response.ok) {
                throw new Error('Failed to load content');
            }
            
            const data = await response.json();
            if (isRawView) {
                setRawContent(data.raw_content);
            } else {
                setContent(data);
            }
        } catch (error) {
            toast.error('Failed to load content');
            console.error('Error loading content:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!filing) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>Select a filing to view its contents</p>
            </div>
        );
    }

    const normalizeKey = (key: string) => key.replace(/__/g, '_');
    const items = itemMap[filing.formType] ?? itemMap['OTHER'];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle>{filing.formType}</CardTitle>
                    <CardDescription>{filing.filingDate}</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setIsRawView(!isRawView)}
                        title={isRawView ? "Switch to processed view" : "Switch to raw view"}
                    >
                        {isRawView ? <FileText className="h-4 w-4"/> : <Code className="h-4 w-4"/>}
                    </Button>
                    <Button variant="outline" size="icon">
                        <Download className="h-4 w-4"/>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/pricing">
                            <MessageSquare className="h-4 w-4"/>
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4">
                    <Badge variant="secondary">{category}</Badge>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <p className="text-muted-foreground">Loading content...</p>
                    </div>
                ) : isRawView ? (
                    <div className="mt-8">
                        {rawContent ? (
                            <div 
                                className="bg-muted p-4 rounded-lg overflow-auto max-h-[600px] prose prose-sm dark:prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: rawContent }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-32">
                                <p className="text-muted-foreground">Failed to load raw content</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 mt-8">
                        {content && items.map((key) => {
                            const actualKey = normalizeKey(key);
                            const section = content[actualKey];

                            if (!section || section.trim() === '') return null;

                            return (
                                <div key={key}>
                                    <p className="text-gray-700 whitespace-pre-line">{section}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
