import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, FileText, Search, Zap } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    title: 'Advanced SEC Filing Analysis',
    description: 'Get detailed insights from SEC filings with our AI-powered analysis.',
    icon: FileText,
  },
  {
    title: 'Real-time Alerts',
    description: 'Stay updated with instant notifications for important filing changes.',
    icon: Zap,
  },
  {
    title: 'Powerful Search',
    description: 'Find exactly what you need with our advanced search capabilities.',
    icon: Search,
  },
  {
    title: 'Data Analytics',
    description: 'Visualize and analyze filing data with interactive charts.',
    icon: BarChart,
  },
];

const team = [
  {
    name: 'John Doe',
    role: 'CEO & Founder',
    bio: 'Former Wall Street analyst with 15+ years of experience in financial markets.',
    image: '/team/john-doe.jpg',
  },
  {
    name: 'Jane Smith',
    role: 'CTO',
    bio: 'Tech leader with expertise in AI and machine learning.',
    image: '/team/jane-smith.jpg',
  },
  {
    name: 'Mike Johnson',
    role: 'Head of Product',
    bio: 'Product strategist focused on building user-friendly financial tools.',
    image: '/team/mike-johnson.jpg',
  },
];

export default function AboutPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-16">
        <section className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            About Super Investor
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to democratize access to SEC filing analysis and make
            financial information more accessible to everyone. Our platform combines
            cutting-edge technology with deep financial expertise to provide
            actionable insights.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Our Mission</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Democratizing Access</CardTitle>
                <CardDescription>
                  Making financial information accessible to all
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We believe that everyone should have access to high-quality
                  financial information and analysis. Our platform breaks down
                  complex SEC filings into clear, actionable insights.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Innovation</CardTitle>
                <CardDescription>
                  Leveraging technology for better analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We combine artificial intelligence with human expertise to
                  provide the most accurate and relevant insights from SEC filings.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Our Features</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <Card key={member.name}>
                <CardHeader>
                  <div className="relative h-32 w-32 mx-auto mb-4">
                    <div className="h-full w-full rounded-full bg-muted" />
                    {/* TODO: Add actual team member images */}
                  </div>
                  <CardTitle className="text-center">{member.name}</CardTitle>
                  <CardDescription className="text-center">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of investors who are already using Super Investor to make
            better investment decisions.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">
              Create your account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}