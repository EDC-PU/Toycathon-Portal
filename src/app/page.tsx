
"use client";
import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Calendar,
  Flag,
  Lightbulb,
  Mail,
  Palette,
  Phone,
  Presentation,
  Puzzle,
  Rocket,
  Target,
  Trophy,
  Users,
  Wrench,
  Star,
  BarChart,
  Tag,
  Users2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { SVGProps } from 'react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query, DocumentData } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface Theme extends DocumentData {
    id: string;
    name: string;
}
interface Category extends DocumentData {
    id: string;
    name: string;
    targetCustomerGroup: string;
    concept: string;
}


const timelineEvents = [
  {
    date: 'August 15, 2025',
    title: 'Registration Opens',
    description: 'Teams can start registering for the Toycathon.',
    icon: <Flag className="h-8 w-8" />,
    color: 'primary',
  },
  {
    date: 'September 30, 2025',
    title: 'Registration Closes',
    description: 'Final day for team registrations and idea submission.',
    icon: <Calendar className="h-8 w-8" />,
     color: 'accent',
  },
  {
    date: 'October 2-4, 2025',
    title: 'Phase 1: Idea Presentation',
    description: 'Teams will present their innovative toy concepts to the jury.',
    icon: <Presentation className="h-8 w-8" />,
    color: 'destructive',
  },
  {
    date: 'October 7-8, 2025',
    title: 'Grand Finale',
    description: 'The main event where finalists will present their creations.',
    icon: <Trophy className="h-8 w-8" />,
    color: 'primary',
  },
];

const rules = [
    {
        title: "Team Formation",
        content: "A team must consist of one leader and three additional members, for a total of four members. Members can be students from different colleges."
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

function SectionHeading({ children, color }: { children: React.ReactNode, color?: 'primary' | 'accent' | 'destructive' | 'foreground' }) {
    const colors = {
      primary: 'bg-primary text-primary-foreground',
      accent: 'bg-accent text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      foreground: 'bg-foreground text-background'
    };
    const lineColors = {
        primary: 'bg-primary',
        accent: 'bg-accent',
        destructive: 'bg-destructive',
        foreground: 'bg-foreground'
    }
  return (
    <div className="flex items-center justify-center gap-4">
      <div className={`h-px flex-1 ${lineColors[color || 'primary']}`} />
      <h2 className={`text-xl font-bold tracking-tight sm:text-2xl md:text-3xl text-center rounded-full px-8 py-3 whitespace-nowrap ${colors[color || 'primary']}`}>
        {children}
      </h2>
      <div className={`h-px flex-1 ${lineColors[color || 'primary']}`} />
    </div>
  );
}

function PlayfulShapes({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      <div className="h-0 w-0 border-t-[20px] border-t-transparent border-r-[35px] border-r-primary border-b-[20px] border-b-transparent"></div>
      <div className="h-0 w-0 border-t-[20px] border-t-transparent border-r-[35px] border-r-accent border-b-[20px] border-b-transparent"></div>
      <div className="h-0 w-0 border-t-[20px] border-t-transparent border-r-[35px] border-r-destructive border-b-[20px] border-b-transparent"></div>
    </div>
  )
}

function HeroSection() {
    const textContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            }
        }
    }

    const textItem = {
        hidden: { y: 20, opacity: 0 },
        show: { 
            y: 0, 
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
            }
        }
    }
    
    const toyCathonItem = {
        hidden: { y: 20, opacity: 0 },
        show: { 
            y: 0, 
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10,
            }
        },
        hover: {
            rotate: [0, 5, -5, 5, -5, 0],
            transition: {
                duration: 0.5
            }
        }
    }

    return (
        <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
            <motion.div 
                className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-accent/10 to-destructive/10"
                animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                    duration: 20,
                    ease: "linear",
                    repeat: Infinity,
                }}
                style={{
                    backgroundSize: '400% 400%',
                }}
            />
            <div className="container relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center md:text-left md:flex-row md:gap-8">
                <motion.div 
                    className="flex flex-col items-center md:items-start md:w-1/2"
                    variants={textContainer}
                    initial="hidden"
                    animate="show"
                >
                    <div className="block md:hidden mb-6">
                        <Image src="/TOYCATHON.svg" alt="Toycathon Logo" width={160} height={160} />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block">
                             <Image src="/TOYCATHON.svg" alt="Toycathon Logo" width={160} height={160} />
                        </div>
                        <motion.h1 
                            className="font-headline text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl"
                            variants={textContainer}
                        >
                            <motion.span variants={textItem} className="block text-primary">VADODARA</motion.span>
                            <motion.span 
                                variants={toyCathonItem}
                                whileHover="hover"
                                className="mt-1 block text-accent cursor-pointer"
                            >
                                TOYCATHON
                            </motion.span>
                            <motion.span 
                                variants={textItem} 
                                className="block text-destructive transition-colors duration-300 hover:text-destructive/70"
                            >
                                2025
                            </motion.span>
                        </motion.h1>
                    </div>
                    <motion.p 
                        className="mx-auto max-w-2xl text-lg text-muted-foreground md:mx-0 md:text-xl"
                        variants={textItem}
                    >
                        Where Fun Meets Innovation!
                    </motion.p>
                    <motion.div 
                        className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row md:justify-start"
                        variants={textContainer}
                    >
                        <motion.div variants={textItem} whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px hsl(var(--primary))" }}>
                            <Button asChild size="lg">
                                <Link href="/register">Register Now</Link>
                            </Button>
                        </motion.div>
                        <motion.div variants={textItem} whileHover={{ scale: 1.05 }}>
                            <Button asChild size="lg" variant="outline">
                                <Link href="#rules">View Rules</Link>
                            </Button>
                        </motion.div>
                    </motion.div>
                </motion.div>
                <div className="relative hidden w-full md:w-1/2 lg:w-3/5 md:flex justify-center items-center">
    <Image
        src="/TOYCATHON.svg"
        alt="Toycathon Illustration"
        width={90}
        height={90}
        className="w-full h-auto md:max-h-[60vh]"
    />
</div>

            </div>
        </section>
    );
}

function AboutSection() {
    return (
      <section id="about" className="w-full bg-secondary/20 py-12 md:py-24 relative overflow-hidden">
         <PlayfulShapes className="absolute top-10 left-5 opacity-20 transform -rotate-45" />
        <div className="container mx-auto flex max-w-7xl flex-col items-center gap-16 px-4 md:px-6">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">About VADODARA TOYCATHON 2025</h2>
              </div>
              <p className="mt-4 text-muted-foreground text-justify">
                Vadodara Toycathon 2025 is a remarkable initiative that aims at nurturing the creativity and ingenuity of students from schools and universities. The event serves as a platform for these young minds to explore their innovative potential and transform their toy ideas into tangible realities. By focusing on the rich heritage of Bharatiya civilization, history, culture, mythology, and ethos, the Vadodara Toycathon 2025 inspires participants to conceive novel toys and games that are deeply rooted in our roots.
              </p>
            </div>
             <div className="relative order-1 w-full overflow-hidden rounded-xl shadow-lg md:order-2" style={{paddingTop: '56.25%'}}>
                <iframe 
                    className="absolute top-0 left-0 h-full w-full"
                    src="https://www.youtube.com/embed/9ELqa04tTUg?autoplay=0&controls=1&rel=0&showinfo=0&modestbranding=1&loop=1&playlist=9ELqa04tTUg" 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen>
                </iframe>
            </div>
          </div>
          <div className="grid items-center gap-8 relative md:grid-cols-2">
             <PlayfulShapes className="absolute bottom-0 -right-10 opacity-20 transform rotate-12" />
            <div className="order-2 md:order-2">
               <div className="text-center md:text-left">
                 <h2 className="text-3xl font-bold tracking-tight text-accent sm:text-4xl">About PIERC</h2>
               </div>
              <p className="mt-4 text-muted-foreground text-justify">
              Parul Innovation and Entrepreneurship Research Centre (PIERC) is a Section 8 company established in 2015 by Parul University as an incubator to provide comprehensive 
              support and services to startups at every stage of their journey, from the idea stage to growth. PIERC operates under the Entrepreneurship Development Centre (EDC), 
              which was founded in 2013 with the goal of fostering a culture of research, innovation, and entrepreneurship among students and faculties. The Vadodara Startup Studio, 
              an initiative of the Entrepreneurship Development Centre, was launched in 2021. It serves as a dynamic startup incubator and accelerator, facilitating the transformation
              of aspiring entrepreneurs' visions into scalable startup ventures. The studio offers a range of resources, including pre-seed grant support through VC funding, 
              government grants, and other funding opportunities. Additionally, PIERC houses a Fabrication Laboratory (Fab Lab), a state-of-the-art technical prototyping platform 
              designed to foster learning and innovation. Equipped with advanced technology such as 3D printers, laser cutting and engraving, CNC routers, and vinyl cutters, the Fab
              Lab empowers students to bring their ideas to life. Recently in 2023 PIERC has expand his horizon within state by launching its 3 new units namely Rajkot Startup Studio, 
              Ahmedabad Startup Studio and Surat Startup Studio with the aim to reach more entrepreneurs and supporting their ground breaking startups. PIERC serves as a dedicated hub
              for nurturing entrepreneurial spirit, providing incubation support, and fostering innovation and research among the aspirant entrepreneurs and startups. The inclusion of
              the Vadodara Startup Studio, Rajkot Startup Studio, Ahmedabad Startup Studio and Surat Startup Studio and the Fab Lab further
              strengthens the ecosystem, offering resources, funding opportunities, and a collaborative environment for aspiring entrepreneurs and innovators.
              </p>
            </div>
             <div className="relative order-1 md:order-1 w-full flex items-center justify-center">
                 <Image src="/V1.svg" alt="Innovation Illustration" width={400} height={400} className="w-full max-w-sm h-auto" />
            </div>
          </div>
        </div>
      </section>
    );
  }

function SupportersSection() {
  const supporterLogos = [
    'https://i.ibb.co/60nGFb7y/supporter1.png',
    'https://i.ibb.co/FLVygH0v/supporter2.png',
    '/supporter3.svg',
  ];

  return (
    <section id="supporters" className="w-full bg-background py-12 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <SectionHeading color="primary">Supported By</SectionHeading>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {supporterLogos.map((logo, index) => (
            <React.Fragment key={index}>
              <div className="relative h-28 w-52 transition-all duration-300">
                <Image
                  src={logo}
                  alt={`Supporter logo ${index + 1}`}
                  fill
                  className="object-contain"
                  data-ai-hint="logo"
                />
              </div>
              {index < supporterLogos.length - 1 && (
                <div className="hidden h-16 w-px bg-border md:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}


function CategoriesSection() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const q = query(collection(db, "categories"), orderBy("name"));
                const querySnapshot = await getDocs(q);
                const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
                setCategories(fetched);
            } catch (error) {
                console.error("Error fetching categories:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const categoryColors = ['border-primary', 'border-accent', 'border-destructive'];

    return (
        <section id="categories" className="w-full bg-background py-12 md:py-24">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="mx-auto max-w-4xl text-center">
                    <SectionHeading color="accent">Event Categories</SectionHeading>
                    <p className="mt-4 text-muted-foreground">
                        Select a category that best fits your innovative toy or game idea.
                    </p>
                </div>
                <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <Card key={index} className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <Skeleton className="h-6 w-3/4" />
                                </div>
                                <Skeleton className="h-4 w-1/2 mb-2" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6 mt-1" />
                            </Card>
                        ))
                    ) : categories.length > 0 ? (
                        categories.map((category, index) => (
                            <Card key={category.id} className={`group flex flex-col p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-2 bg-secondary/30 border-l-4 ${categoryColors[index % categoryColors.length]}`}>
                                <CardHeader className="p-0 flex-row gap-4 items-center mb-4">
                                     <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Tag className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-foreground">{category.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 flex-grow">
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold text-primary flex items-center gap-2">
                                            <Users2 className="h-4 w-4" />
                                            Target Group
                                        </p>
                                        <p className="text-muted-foreground text-sm">{category.targetCustomerGroup}</p>
                                    </div>
                                    <div>
                                         <p className="text-sm font-semibold text-primary flex items-center gap-2">
                                             <Lightbulb className="h-4 w-4" />
                                             Concept
                                        </p>
                                        <p className="text-muted-foreground text-sm">{category.concept}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="col-span-full text-center text-muted-foreground">No categories have been added yet. Please check back later.</p>
                    )}
                </div>
            </div>
        </section>
    );
}


function ThemesSection() {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchThemes = async () => {
            setIsLoading(true);
            try {
                const q = query(collection(db, "themes"), orderBy("name"));
                const querySnapshot = await getDocs(q);
                const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Theme));
                setThemes(fetched);
            } catch (error) {
                console.error("Error fetching themes:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchThemes();
    }, []);

    const themeIcons = [
        <Puzzle className="h-8 w-8" />,
        <Lightbulb className="h-8 w-8" />,
        <Rocket className="h-8 w-8" />,
        <Users className="h-8 w-8" />,
        <Palette className="h-8 w-8" />,
        <BookOpen className="h-8 w-8" />,
        <Star className="h-8 w-8" />,
        <Tag className="h-8 w-8" />
    ];
    
    const themeColors = ['text-primary', 'text-accent', 'text-destructive'];

    return (
        <section id="themes" className="w-full bg-secondary/20 py-12 md:py-24 relative overflow-hidden">
            <PlayfulShapes className="absolute top-20 right-10 opacity-10 transform rotate-45 scale-150" />
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="mx-auto max-w-4xl text-center">
                    <SectionHeading color="primary">Event Themes</SectionHeading>
                    <p className="mt-4 text-muted-foreground text-center">
                        Your creations should be based on one of the following themes, reflecting the diversity and richness of Indian ethos.
                    </p>
                </div>
                <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                         Array.from({ length: 6 }).map((_, index) => (
                            <Card key={index} className="p-6 bg-background/50">
                                <div className="flex items-center gap-4">
                                     <Skeleton className="h-8 w-8 rounded-full" />
                                     <Skeleton className="h-6 w-3/4" />
                                </div>
                            </Card>
                        ))
                    ) : themes.length > 0 ? (
                        themes.map((theme, index) => (
                            <Card key={theme.id} className="group flex items-center gap-4 p-6 transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-2 bg-background border-transparent">
                                <div className={`transition-colors duration-300 ${themeColors[index % themeColors.length]}`}>
                                    {React.cloneElement(themeIcons[index % themeIcons.length], { className: "h-8 w-8" })}
                                </div>
                                <h3 className="text-xl font-bold text-foreground">{theme.name}</h3>
                            </Card>
                        ))
                    ) : (
                         <p className="col-span-full text-center text-muted-foreground">No themes have been added yet. Please check back later.</p>
                    )}
                </div>
            </div>
        </section>
    );
}

function TimelineSection() {
  return (
    <section id="timeline" className="w-full bg-background py-12 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 text-center">
        <SectionHeading color="accent">Important Dates</SectionHeading>
        <p className="mt-4 text-muted-foreground">
          Mark your calendars! Here is the timeline for the Toycathon 2025.
        </p>
      </div>
      <div className="container mx-auto max-w-5xl px-4 md:px-6 mt-16">
        <div className="relative">
          {/* The horizontal line */}
          <div className="absolute top-1/2 left-0 h-0.5 w-full bg-border -translate-y-1/2"></div>
          
          <div className="relative flex justify-between">
            {timelineEvents.map((event, index) => (
              <div key={index} className="relative z-10 flex flex-col items-center w-1/4 group">
                {/* Event Icon */}
                <div className={`h-12 w-12 rounded-full border-4 bg-background flex items-center justify-center border-${event.color} transition-all duration-300 group-hover:scale-110`}>
                   {React.cloneElement(event.icon, { className: `h-6 w-6 text-${event.color}` })}
                </div>
                {/* Event Details */}
                <div className="text-center mt-4 p-4 rounded-lg bg-secondary/30 w-full transition-all duration-300 group-hover:shadow-lg">
                  <p className={`font-bold text-sm text-${event.color}`}>{event.date}</p>
                  <h3 className="mt-1 text-md font-semibold text-foreground">{event.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


function RulesAndEligibilitySection() {
  return (
    <section id="rules" className="w-full bg-secondary/20 py-12 md:py-24 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Eligibility Column */}
          <div>
            <div className="mx-auto max-w-2xl text-center mb-12">
              <SectionHeading color="primary">Eligibility</SectionHeading>
              <p className="mt-4 text-muted-foreground text-center">
                Who can join the fun? Here are the eligibility criteria.
              </p>
            </div>
            <Card className="bg-background/80 shadow-lg border-transparent p-6">
                <CardHeader className="p-0 mb-4 flex-row gap-4 items-center">
                    <Target className="w-10 h-10 text-primary"/>
                    <CardTitle className="text-2xl font-bold text-primary">Who Can Participate?</CardTitle>
                </CardHeader>
              <CardContent className="p-0">
                <ul className="space-y-3 list-disc pl-5 text-muted-foreground">
                  <li>Teams must consist of up to 4 members.</li>
                  <li>Open to school students from 3rd standard upwards and all university students.</li>
                  <li>Enthusiastic participation and creative ideas are highly encouraged!</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Rules Column */}
          <Card className="bg-background/80 shadow-lg border-transparent p-6 h-full">
              <div className="mx-auto max-w-2xl text-center mb-8">
              <SectionHeading color="destructive">Rules & Guidelines</SectionHeading>
              <p className="mt-4 text-muted-foreground text-center">
                  Please read the rules carefully before registering.
              </p>
              </div>
              <Accordion type="single" collapsible className="w-full">
              {rules.map((rule, index) => (
                  <AccordionItem value={`item-${index}`} key={index} className="border-b-2 border-primary/20 bg-background/80 px-4 rounded-lg mb-2 shadow-sm">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline text-left">{rule.title}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-justify">
                      {rule.content}
                  </AccordionContent>
                  </AccordionItem>
              ))}
              </Accordion>
          </Card>
        </div>
      </div>
    </section>
  );
}


function PhasesSection() {
  return (
    <section id="phases" className="w-full bg-background py-12 md:py-24 relative overflow-hidden">
      <PlayfulShapes className="absolute top-1/2 -left-10 opacity-10 transform -rotate-90 scale-125" />
      <PlayfulShapes className="absolute bottom-20 -right-10 opacity-10 transform rotate-90 scale-125" />
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
            <SectionHeading color="primary">Event Phases</SectionHeading>
          <p className="mt-4 text-muted-foreground text-center">
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
                developmental benefits it offers.
                Furthermore, participants should highlight
                the unique features that differentiate their
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
          <SectionHeading color="foreground">Assessment Criteria</SectionHeading>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="group relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-orange-400"></div>
            <Card className="relative bg-transparent text-white p-6 h-full">
              <CardHeader className="flex flex-row items-center gap-4 p-0">
                <div className="rounded-lg bg-white/20 p-3">
                  <BarChart className="h-8 w-8 text-white" />
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
          </div>
          <div className="group relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-green-400"></div>
            <Card className="relative bg-transparent text-white p-6 h-full">
              <CardHeader className="flex flex-row items-center gap-4 p-0">
                <div className="rounded-lg bg-white/20 p-3">
                  <Star className="h-8 w-8 text-white" />
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
        </div>

        <div className="mt-8 group relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500"></div>
          <Card className="relative bg-transparent text-gray-800 p-6">
            <CardHeader className="p-0">
              <div className="flex justify-between items-start">
                <Trophy className="w-16 h-16 text-white/50" />
                <div>
                  <h3 className="text-3xl font-bold">Awards</h3>
                  <p className="font-semibold mt-2">🏅 Top teams will receive prize amounts in recognition of their outstanding ideas.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <ul className="space-y-2 list-disc pl-5">
                <li>Top teams will get Prize amount</li>
                <li>Incubation & Funding support to scale up startup</li>
                <li>Support to file IP for selected toy design</li>
                <li>Linkage with toy industry to scale up selected toy design</li>
              </ul>
              <p className="mt-4 font-semibold">From concept to commercialization — we’re here to help your ideas grow into real-world success stories 💡.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}


function ContactSection() {
    return (
        <section id="contact" className="w-full bg-background py-12 md:py-24">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
                <div className="flex justify-center mb-8">
                  <Image src="/V2.svg" alt="Contact Illustration" width={400} height={400} className="w-full max-w-xs h-auto" />
                </div>
                <div className="mx-auto max-w-4xl text-center">
                     <SectionHeading color="primary">Contact Us</SectionHeading>
                     <p className="mt-4 text-muted-foreground text-center">
                        Have any questions? Feel free to reach out to us.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                    <Card className="p-6 bg-background/80 shadow-lg border-transparent">
                        <CardHeader className="p-0">
                            <CardTitle className="text-primary">For any Query contact</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 mt-4 space-y-2">
                           <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <p>Manish Jain - 9131445130</p>
                           </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <p>Kartik Ram - 9594355271</p>
                           </div>
                           <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <p>Smitha Reddy - 8121734431</p>
                           </div>
                             <div className="flex items-center gap-2 pt-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a href="mailto:pierc@paruluniversity.ac.in" className="hover:text-primary">pierc@paruluniversity.ac.in</a>
                            </div>
                        </CardContent>
                    </Card>
                     <Card className="p-6 bg-background/80 shadow-lg border-transparent">
                        <CardHeader className="p-0">
                            <CardTitle className="text-primary">Reach out to us</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 mt-4 space-y-1 text-muted-foreground">
                           <p className="font-semibold text-foreground">Parul Innovation and Entrepreneurship Research Centre</p>
                           <p>BBA building, ground floor, Parul University</p>
                           <p>P.O. Limda, Ta. Waghodia,</p>
                           <p>Dist. Vadodara-391760, Gujarat State, India.</p>
                           <p className="pt-2"><a href="https://www.pierc.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Website: https://www.pierc.org/</a></p>
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
      <CategoriesSection />
      <ThemesSection />
      <TimelineSection />
      <RulesAndEligibilitySection />
      <PhasesSection />
      <AssessmentCriteriaSection />
      <ContactSection />
    </>
  );
}
