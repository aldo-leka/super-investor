
import {Header} from '@/components/landing/Header';
import {Footer} from '@/components/landing/Footer';
import {Pricing} from "@/components/landing/Pricing";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header/>
            <Pricing/>
            <Footer/>
        </div>
    );
}