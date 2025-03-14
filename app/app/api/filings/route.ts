import {NextRequest} from "next/server";

export async function GET(request: NextRequest) {
    try {
        const cik = request.nextUrl.searchParams.get("cik");
        if (!cik) {
            return Response.json({});
        }

        const response = await fetch(`https://data.sec.gov/submissions/CIK${cik.padStart(10, "0")}.json`, {
            headers: {
                "User-Agent": `Lekabros_${crypto.randomUUID()} lekabros@gmail.com`
            }
        });

        if (!response.ok) throw new Error(`Error fetching SEC data: ${response.status}`);

        const data = await response.json();
        return Response.json(data);
    } catch (error) {
        return Response.json({error: error.message}, {status: 500});
    }
}
