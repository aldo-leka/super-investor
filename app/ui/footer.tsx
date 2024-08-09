export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-8">
            <div className="container mx-auto px-4 text-center">
                <p>&copy; {new Date().getFullYear()} Super Investor. All rights reserved.</p>
                <div className="mt-4">
                    <a href="/privacy" className="mx-2 hover:underline">Privacy Policy</a>
                    <a href="/terms" className="mx-2 hover:underline">Terms of Service</a>
                    <a href="/help" className="mx-2 hover:underline">Help Center</a>
                    <a href="/contact" className="mx-2 hover:underline">Contact</a>
                </div>
            </div>
        </footer>
    );
}