import { PDFDocument } from 'pdf-lib';

export async function POST(request: Request) {
  console.log('Handler function called');
  try {
    console.log('POST request received');
    const { url } = await request.json();

    // Fetch the content from the URL
    const response = await fetch(url);
    console.log('response', response);
    const contentType = response.headers.get('Content-Type');
    console.log('contentType', contentType);

    if (contentType?.includes('application/pdf')) {
      // Handle PDF content
      const pdfBuffer = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pdfBytes = await pdfDoc.save();

      return new Response(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename=generated.pdf'
        }
      });
    } else {
      // Handle non-PDF content (e.g., XML, HTML)
      const content = await response.text();
      return new Response(content, {
        headers: {
          'Content-Type': contentType || 'text/plain'
        }
      });
    }
  } catch (error) {
    console.error('Error processing content:', error);
    return Response.json({ error: 'Error processing content' }, { status: 500 });
  }
}