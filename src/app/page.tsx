import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Flag,
  Lightbulb,
  Palette,
  Puzzle,
  Rocket,
  Trophy,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { SVGProps } from 'react';

const themes = [
  {
    icon: <Puzzle className="h-8 w-8" />,
    title: 'Indian Culture & Heritage',
    description: 'Toys based on Indian traditions, folklore, and history.',
  },
  {
    icon: <Lightbulb className="h-8 w-8" />,
    title: 'STEM & Innovation',
    description: 'Educational toys focusing on science, tech, engineering, and math.',
  },
  {
    icon: <Rocket className="h-8 w-8" />,
    title: 'Divyang Friendly',
    description: 'Toys designed for specially-abled children.',
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Social & Human Values',
    description: 'Toys that teach empathy, cooperation, and responsibility.',
  },
  {
    icon: <Palette className="h-8 w-8" />,
    title: 'Arts & Crafts',
    description: 'DIY kits and toys that encourage artistic expression.',
  },
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: 'Environment',
    description: 'Eco-friendly toys and games about sustainability.',
  },
];

const timelineEvents = [
  {
    icon: <Flag className="h-5 w-5" />,
    date: 'August 15, 2025',
    title: 'Registration Opens',
    description: 'Teams can start registering for the Toycathon.',
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    date: 'September 30, 2025',
    title: 'Registration Closes',
    description: 'Final day for team registrations and idea submission.',
  },
  {
    icon: <Trophy className="h-5 w-5" />,
    date: 'October 15-17, 2025',
    title: 'Grand Finale',
    description: 'The main event where finalists will present their creations.',
  },
];

const rules = [
    {
        title: "Team Formation",
        content: "Teams must consist of 3-5 members. Members can be students from different colleges."
    },
    {
        title: "Originality",
        content: "All ideas and prototypes must be original work of the team. Plagiarism will result in immediate disqualification."
    },
    {
        title: "Prototype Requirements",
        content: "Teams must submit a working physical prototype of their toy or game. Digital submissions are also accepted for the gaming category."
    },
    {
        title: "Safety Standards",
        content: "All toys must be safe for children, non-toxic, and adhere to standard safety guidelines."
    }
]

function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-white dark:bg-gray-950">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-teal-50/50 to-yellow-50/50 dark:from-gray-950 dark:via-teal-950/20 dark:to-yellow-950/20" />
        <div 
          className="absolute -bottom-1/2 left-1/4 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-teal-100/40 opacity-20 blur-3xl dark:bg-teal-900/50" 
          style={{ transform: 'translate3d(0, 0, 0)' }}
        />
        <div 
          className="absolute -top-1/2 right-1/4 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-yellow-100/40 opacity-20 blur-3xl dark:bg-yellow-900/50"
          style={{ transform: 'translate3d(0, 0, 0)' }}
        />
      </div>
      <div className="container relative mx-auto max-w-7xl px-4 py-20 text-center md:py-32 lg:py-40">
        <h1 className="font-headline text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="block text-teal-500">VADODARA</span>
            <span className="mt-2 block text-yellow-500">TOYCATHON <span className="text-red-500">2025</span></span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-700 dark:text-gray-300 md:text-xl">
            Where Fun meets Innovation!
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="group transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/30">
            <Link href="/register">
              Register Now <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="group">
            <Link href="#rules">
              View Rules
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section id="about" className="w-full bg-secondary/50 py-12 md:py-24">
      <div className="container mx-auto grid max-w-7xl items-center gap-8 px-4 md:grid-cols-2 md:px-6">
        <div>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-teal-green md:text-4xl">About the Toycathon</h2>
          <p className="mt-4 text-muted-foreground">
            The Vadodara Toycathon is a prestigious national competition that invites innovators, students, and startups to conceptualize and create new toys and games rooted in Indian culture and values. It&apos;s a platform to showcase creativity and contribute to the burgeoning Indian toy industry.
          </p>
          <p className="mt-2 text-muted-foreground">
            Organized in collaboration with Parul University and its incubation center PIERC, this event aims to foster a spirit of innovation and make India a global hub for toy manufacturing.
          </p>
        </div>
        <div className="flex justify-center">
            <Image
                src="https://picsum.photos/600/400"
                alt="Children playing with toys"
                width={600}
                height={400}
                className="rounded-xl shadow-lg"
                data-ai-hint="children playing toys"
            />
        </div>
      </div>
    </section>
  );
}


function ThemesSection() {
  return (
    <section id="themes" className="w-full py-12 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-teal-green md:text-4xl">Event Themes</h2>
          <p className="mt-4 text-muted-foreground">
            Your creations should be based on one of the following themes, reflecting the diversity and richness of Indian ethos.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme, index) => (
            <Card key={index} className="group flex flex-col p-6 transition-all duration-300 hover:border-primary hover:shadow-lg hover:-translate-y-1">
              <div className="mb-4 text-primary transition-colors duration-300 group-hover:text-accent">
                {theme.icon}
              </div>
              <h3 className="text-xl font-bold">{theme.title}</h3>
              <p className="mt-2 text-muted-foreground">{theme.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineSection() {
  return (
    <section id="timeline" className="w-full bg-secondary/50 py-12 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-teal-green md:text-4xl">Important Dates</h2>
          <p className="mt-4 text-muted-foreground">
            Mark your calendars! Here is the timeline for the Toycathon 2025.
          </p>
        </div>
        <div className="relative mt-12 w-full max-w-3xl mx-auto">
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-border"></div>
          {timelineEvents.map((event, index) => (
            <div key={index} className={`relative flex w-full items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                <Card className="p-4 transition-shadow hover:shadow-md">
                    <p className="font-semibold text-primary">{event.date}</p>
                    <h3 className="text-lg font-bold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                </Card>
              </div>
              <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {event.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RulesSection() {
  return (
    <section id="rules" className="w-full py-12 md:py-24">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-teal-green md:text-4xl">Rules & Guidelines</h2>
                <p className="mt-4 text-muted-foreground">
                    Please read the rules carefully before registering.
                </p>
            </div>
            <Accordion type="single" collapsible className="w-full mt-12">
                {rules.map((rule, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-lg font-semibold">{rule.title}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                            {rule.content}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ThemesSection />
      <TimelineSection />
      <RulesSection />
    </>
  );
}
