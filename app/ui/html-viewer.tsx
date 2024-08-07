export default function HTMLViewer({ content }: { content: string }) {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
}