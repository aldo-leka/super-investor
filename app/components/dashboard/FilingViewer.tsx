import React from 'react';
import {Badge} from '@/components/ui/badge';
import {Card, CardHeader, CardTitle, CardDescription, CardContent} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Download, MessageSquare} from 'lucide-react';
import Link from 'next/link';
import {Filing} from '@/types';
import {itemMap} from '@/lib/filingUtils';

interface Props {
    filing: Filing | null;
    content: Record<string, string>;
    category: string;
}

export default function FilingViewer({filing, content, category}: Props) {
    if (!filing || !content) {
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
                <div className="space-y-6 mt-8">
                    {items.map((key) => {
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
            </CardContent>
        </Card>
    );
}
