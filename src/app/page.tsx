

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
    color: 'text-primary',
  },
  {
    icon: <Lightbulb className="h-8 w-8" />,
    title: 'STEM & Innovation',
    description: 'Educational toys focusing on science, tech, engineering, and math.',
    color: 'text-accent',
  },
  {
    icon: <Rocket className="h-8 w-8" />,
    title: 'Divyang Friendly',
    description: 'Toys designed for specially-abled children.',
    color: 'text-destructive',
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Social & Human Values',
    description: 'Toys that teach empathy, cooperation, and responsibility.',
    color: 'text-primary',
  },
  {
    icon: <Palette className="h-8 w-8" />,
    title: 'Arts & Crafts',
    description: 'DIY kits and toys that encourage artistic expression.',
    color: 'text-accent',
  },
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: 'Environment',
    description: 'Eco-friendly toys and games about sustainability.',
    color: 'text-destructive',
  },
];

const timelineEvents = [
  {
    icon: <Flag className="h-5 w-5" />,
    date: 'August 15, 2025',
    title: 'Registration Opens',
    description: 'Teams can start registering for the Toycathon.',
    color: 'primary',
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    date: 'September 30, 2025',
    title: 'Registration Closes',
    description: 'Final day for team registrations and idea submission.',
    color: 'accent',
  },
  {
    icon: <Trophy className="h-5 w-5" />,
    date: 'October 15-17, 2025',
    title: 'Grand Finale',
    description: 'The main event where finalists will present their creations.',
    color: 'destructive',
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
      <section className="relative w-full overflow-hidden bg-background">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute -bottom-1/2 left-1/4 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 opacity-50 blur-3xl"
          />
          <div 
            className="absolute -top-1/2 right-1/4 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-accent/10 opacity-50 blur-3xl"
          />
        </div>
        <div className="container relative mx-auto max-w-7xl px-4 py-20 text-center md:py-32 lg:py-40">
            <h1 className="font-headline text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
                <span className="text-primary">VADODARA</span>
                <span className="mt-2 block">
                    <span className="text-yellow-400">TOY</span><span className="text-red-500">CA</span><span className="text-yellow-400">THON</span> <span className="text-red-500">2025</span>
                </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
                Where Fun Meets Innovation!
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
      <section id="about" className="w-full bg-secondary/20 py-12 md:py-24">
        <div className="container mx-auto flex max-w-7xl flex-col items-center gap-16 px-4 md:px-6">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-primary md:text-4xl text-center md:text-left">About VADODARA TOYCATHON 2025</h2>
              <p className="mt-4 text-muted-foreground text-justify">
                Vadodara Toycathon 2025 is a remarkable initiative that aims at nurturing the creativity and ingenuity of students from schools and universities. The event serves as a platform for these young minds to explore their innovative potential and transform their toy ideas into tangible realities. By focusing on the rich heritage of Bharatiya civilization, history, culture, mythology, and ethos, the Vadodara Toycathon 2025 inspires participants to conceive novel toys and games that are deeply rooted in our roots.
              </p>
            </div>
            <div className="relative order-1 w-full overflow-hidden rounded-xl shadow-lg md:order-2" style={{paddingTop: '56.25%'}}>
              <iframe
                className="absolute top-0 left-0 h-full w-full"
                src="https://www.youtube.com/embed/9ELqa04tTUg"
                title="Vadodara Toycathon 2025 Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          <div className="grid items-center gap-8">
            <div>
              <h2 className="font-headline text-3xl font-bold tracking-tight text-accent md:text-4xl text-center">About PIERC</h2>
              <p className="mt-4 max-w-4xl text-muted-foreground text-justify">
              Parul Innovation and Entrepreneurship Research Centre (PIERC) is a Section 8 company established in 2015 by Parul University as an incubator to provide comprehensive support and services to startups at every stage of their journey, from the idea stage to growth. PIERC operates under the Entrepreneurship Development Centre (EDC), which was founded in 2013 with the goal of fostering a culture of research, innovation, and entrepreneurship among students and faculties. The Vadodara Startup Studio, an initiative of the Entrepreneurship Development Centre, was launched in 2021. It serves as a dynamic startup incubator and accelerator, facilitating the transformation of aspiring entrepreneurs&apos; visions into scalable startup ventures. The studio o􀂇ers a range of resources, including pre-seed grant support through VC funding, government grants, and other funding opportunities. Additionally, PIERC houses a Fabrication Laboratory (Fab Lab), a state-of-the-art technical prototyping platform designed to foster learning and innovation. Equipped with advanced technology such as 3D printers, laser cu􀂈ing and engraving, CNC routers, and vinyl cu􀂈ers, the Fab Lab empowers students to bring their ideas to life. Recently in 2023 PIERC has expand his horizon within state by launching its 3 new units namely Rajkot Startup Studio, Ahmedabad Startup Studio and Surat Startup Studio with the aim to reach more entrepreneurs and supporting their ground breaking startups. PIERC serves as a dedicated hub for nurturing entrepreneurial spirit, providing incubation support, and fostering innovation and research among the aspirant entrepreneurs and startups. The inclusion of the Vadodara Startup Studio, Rajkot Startup Studio, Ahmedabad Startup Studio and Surat Startup Studio and the Fab Lab further
strengthens the ecosystem, o􀂇ering resources, funding opportunities, and a collaborative environment for aspiring
entrepreneurs and innovators.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

function SupportersSection() {
  const supporterLogos = [
    '/supporter1.jpg',
    '/supporter2.jpg',
    '/supporter3.jpg',
    '/supporter4.jpg',
    '/supporter5.jpg',
    '/supporter6.jpg',
    '/supporter7.jpg',
  ];

  return (
    <section id="supporters" className="w-full bg-background py-12 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-primary md:text-4xl">Supported By</h2>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {supporterLogos.map((logo, index) => (
            <div key={index} className="relative h-20 w-40 grayscale transition-all duration-300 hover:grayscale-0">
              <Image
                src={logo}
                alt={`Supporter logo ${index + 1}`}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


function ThemesSection() {
  return (
    <section id="themes" className="w-full bg-secondary/20 py-12 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-primary md:text-4xl">Event Themes</h2>
          <p className="mt-4 text-muted-foreground">
            Your creations should be based on one of the following themes, reflecting the diversity and richness of Indian ethos.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme, index) => (
            <Card key={index} className="group flex flex-col p-6 transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-yellow-400/20 hover:-translate-y-2 bg-background border-transparent">
              <div className={`mb-4 transition-colors duration-300 ${theme.color}`}>
                {theme.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground">{theme.title}</h3>
              <p className="mt-2 text-muted-foreground text-justify">{theme.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineSection() {
  return (
    <section id="timeline" className="w-full bg-background py-12 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-accent md:text-4xl">Important Dates</h2>
          <p className="mt-4 text-muted-foreground">
            Mark your calendars! Here is the timeline for the Toycathon 2025.
          </p>
        </div>
        <div className="relative mt-12 w-full max-w-3xl mx-auto">
          <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-border"></div>
          {timelineEvents.map((event, index) => (
            <div key={index} className={`relative flex w-full items-center my-8 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                <Card className="p-4 transition-all duration-300 hover:shadow-md hover:border-primary border-transparent bg-secondary/20 shadow-lg">
                    <p className={`font-semibold text-${event.color === 'accent' ? 'yellow-400' : event.color === 'destructive' ? 'red-500' : 'primary'}`}>{event.date}</p>
                    <h3 className="text-lg font-bold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground text-justify">{event.description}</p>
                </Card>
              </div>
              <div className={`absolute left-1/2 top-1/2 z-10 h-12 w-12 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 rounded-full bg-${event.color === 'accent' ? 'yellow-400' : event.color === 'destructive' ? 'red-500' : 'primary'} text-primary-foreground ring-4 ring-background`}>
                  {event.icon}
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
    <section id="rules" className="w-full bg-secondary/20 py-12 md:py-24">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-destructive md:text-4xl">Rules & Guidelines</h2>
                <p className="mt-4 text-muted-foreground">
                    Please read the rules carefully before registering.
                </p>
            </div>
            <Accordion type="single" collapsible className="w-full mt-12">
                {rules.map((rule, index) => (
                    <AccordionItem value={`item-${index}`} key={index} className="border-b-2 border-primary/20">
                        <AccordionTrigger className="text-lg font-semibold hover:no-underline text-left">{rule.title}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-justify">
                            {rule.content}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    </section>
  );
}

function PhasesSection() {
  return (
    <section id="phases" className="w-full bg-background py-12 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-primary md:text-4xl">Event Phases</h2>
          <p className="mt-4 text-muted-foreground">
            The event has been divided into two exciting phases.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="bg-secondary/20 shadow-lg border-transparent">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-accent">Phase - I</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-justify">
                During this phase, participants from universities/colleges/schools will be given
                time to brainstorm their ideas and present them in-front of the jury. These
                presentations should align with the given themes and provide comprehensive details
                about various aspects of their toy concept. They should cover areas such as the toy&apos;s
                concept, design, materials, target audience, and the educational or
                developmental benefits it o􀂇ers.
                Furthermore, participants should highlight
                the unique features that di􀂇erentiate their
                toy from other products available in the
                market. The evaluation for the Phase II
                round will be based on the quality of the
                presentations submi􀂈ed by the
                participants.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-secondary/20 shadow-lg border-transparent">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-destructive">Phase - II</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-justify">
                Participants selected from Phase I will be
                given a dedicated 3-day timeframe to
                develop a functional prototype of their toy
                design and present it to the jury.
                Participants should note that they are
                required to prepare their models at home
                within the given time frame. If needed,
                participants can access a range of
                essential resources, including necessary
                tools, mechanical and electronic
                equipment, but they should use their own
                materials. The winners of the Toycathon will
                be selected based on their performance in
                Phase II. As a reward for their exceptional
                achievements, the winners will be granted
                enticing prizes, including cash rewards,
                comprehensive IPR support, and valuable
                incubation support to take their ideas into
                the market by establishing the Startup.
                These prizes aim to assist the winners in
                transforming their prototypes into
                successful marketable products.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function AssessmentCriteriaSection() {
  return (
    <section id="assessment" className="w-full bg-secondary/20 py-12 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Assessment Criteria of <span className="text-primary">VADODARA</span> <span className="text-yellow-400">TOY</span><span className="text-red-500">CA</span><span className="text-yellow-400">THON</span> <span className="text-red-500">2025</span>
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="rounded-lg bg-destructive text-white p-6 shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 p-0">
              <div className="rounded-lg bg-white/20 p-3">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 2H7C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V4C19 2.89543 18.1046 2 17 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6V18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 6V10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 14V18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Phase - I</h3>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <ul className="space-y-2 list-disc pl-5">
                <li>Novelty of Idea</li>
                <li>Design of toy, games and play item</li>
                <li>Educational values</li>
                <li>Scalability & Marketability</li>
                <li>Social implication</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="rounded-lg bg-primary text-white p-6 shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 p-0">
              <div className="rounded-lg bg-white/20 p-3">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Phase - II</h3>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <ul className="space-y-2 list-disc pl-5">
                <li>Quality of the prototype</li>
                <li>Functionality</li>
                <li>Material / Graphics usage</li>
                <li>Safety</li>
                <li>Commercial viability</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="rounded-lg bg-accent text-foreground p-6 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between p-0">
              <h3 className="text-3xl font-bold text-gray-800">Awards</h3>
              <Trophy className="w-16 h-16 text-gray-800/50" />
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <ul className="space-y-2 list-disc pl-5 text-gray-700">
                <li>Top teams will get Prize amount</li>
                <li>Incubation & Funding support to scale up startup</li>
                <li>Support to file IP for selected toy design</li>
                <li>Linkage with toy industry to scale up selected toy design</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}


export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <SupportersSection />
      <ThemesSection />
      <TimelineSection />
      <RulesSection />
      <PhasesSection />
      <AssessmentCriteriaSection />
    </>
  );
}
