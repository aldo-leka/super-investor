import {TickerSearch} from "@/components/TickerSearch";

export default function Navbar() {
    return (
        <nav className="flex justify-between items-center p-4 shadow-md">
            <h1 className="hidden md:block text-2xl font-bold uppercase tracking-widest">
                Stonks
            </h1>

            <TickerSearch/>
        </nav>
    );
}
