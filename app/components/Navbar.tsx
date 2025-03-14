import {TickerSearch} from "@/components/TickerSearch";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {Button} from "@/components/ui/button";

export default function Navbar() {
    return (
        <nav className="flex justify-between items-center p-4 shadow-lg bg-[#261a0d]">
            <h1 className="hidden md:block text-2xl font-bold uppercase tracking-widest text-[#f1c27d]">
                Stonks
            </h1>

            <div className="flex-1 flex justify-start md:ml-4">
                <TickerSearch/>
            </div>
        </nav>
    );
}
