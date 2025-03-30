
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { PainPoints } from '@/components/landing/PainPoints';
import { Benefits } from '@/components/landing/Benefits';
import { FoundersStory } from '@/components/landing/FoundersStory';
import { CTA } from '@/components/landing/Cta';
import { Footer } from '@/components/landing/Footer';
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from '@/components/landing/Faq';

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Hero />
            <Features />
            <PainPoints />
            <Benefits />
            <FoundersStory />
            <Pricing />
            <Faq />
            <CTA />
            <Footer />
        </div>
    );
}