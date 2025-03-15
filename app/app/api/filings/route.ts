import {NextRequest} from "next/server";

export async function GET(request: NextRequest) {
    try {
        const cik = request.nextUrl.searchParams.get("cik");
        const accessionNumber = request.nextUrl.searchParams.get("accessionNumber");
        const document = request.nextUrl.searchParams.get("document");

        if (!cik || !accessionNumber || !document) {
            return Response.json({});
        }

        const response = await fetch(`https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNumber.replace(/-/g, "")}/${document}`, {
            headers: {
                "User-Agent": `Lekabros_${crypto.randomUUID()} lekabros@gmail.com`
            }
        });

        if (!response.ok) throw new Error(`Error fetching SEC data: ${response.status}`);

        const data = await response.text();
        return new Response(data, {
            headers: {"Content-Type": "text/html"}
        });
    } catch (error) {
        return Response.json({error: error}, {status: 500});
    }
}
