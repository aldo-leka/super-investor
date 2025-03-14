export async function GET() {
    try {
        const response = await fetch("https://www.sec.gov/files/company_tickers.json", {
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
