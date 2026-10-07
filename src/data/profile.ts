// Single source of truth for all site content.
// Edit this file to update the site — components only read from here.

export type Project = {
  title: string;
  description: string;
  tags: string[];
  github: string;
  live: string;
};

export type Job = {
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
};

export type Profile = {
  name: string;
  firstName: string;
  lastName: string;
  initials: string;
  headline: string;
  role: string;
  location: string;
  /** Path under /public, e.g. "/headshot.jpg". Empty shows the monogram tile. */
  photo: string;
  summary: string[];
  stats: { value: string; label: string }[];
  contact: { email: string; phone: string; linkedin: string; github: string };
  skills: { group: string; items: string[] }[];
  languages: { name: string; level: string }[];
  projects: Project[];
  experience: Job[];
  education: { school: string; credential: string; period: string }[];
};

export const profile: Profile = {
  name: "Roman Puchinsky",
  firstName: "Roman",
  lastName: "Puchinsky",
  initials: "RP",
  role: "full-stack developer",
  headline:
    "Embedded engineer turned web builder. I ship fast, reliable apps with the rigor of real-time code.",
  location: "Israel",
  // TODO: add a headshot to /public and set e.g. "/headshot.jpg"
  photo: "",
  summary: [
    "I started my career writing real-time software for avionics at Elbit Systems — code that runs on resource-constrained hardware, talks to FPGAs over serial buses, and puts augmented-reality symbology in front of pilots. That environment taught me to care about performance, reliability, and clean architecture.",
    "Today I bring that mindset to the web. I build full-stack applications with React, TypeScript, Node.js, Express, and MongoDB, with real-time features over WebSockets. After three years teaching C++ and leading student project teams, I'm looking for a full-stack role where low-level rigor meets product thinking.",
  ],
  stats: [
    { value: "3", label: "yrs real-time avionics" },
    { value: "3", label: "yrs teaching C++" },
    { value: "3", label: "languages spoken" },
  ],
  contact: {
    email: "romanpu@gmail.com",
    // TODO: replace with real phone number
    phone: "+972-XX-XXX-XXXX",
    linkedin: "https://www.linkedin.com/in/roman-puchinsky",
    // TODO: replace with real GitHub profile URL
    github: "https://github.com/your-username",
  },
  skills: [
    {
      group: "Frontend",
      items: ["JavaScript", "TypeScript", "React", "Redux", "HTML", "CSS / SASS"],
    },
    {
      group: "Backend",
      items: ["Node.js", "Express", "REST APIs", "WebSocket / Socket.io"],
    },
    { group: "Data", items: ["MongoDB", "SQL"] },
    { group: "Tools & Practice", items: ["Git", "Docker", "Project Management"] },
    {
      group: "Embedded",
      items: ["C", "C++", "UART / RS-485", "I2C", "SPI", "UDP", "AVR (ATmega2561)"],
    },
  ],
  languages: [
    { name: "English", level: "Full professional" },
    { name: "Hebrew", level: "Native" },
    { name: "Russian", level: "Native" },
  ],
  // TODO: replace these placeholder projects with real ones
  projects: [
    {
      title: "Project One",
      description:
        "Placeholder — a full-stack web app. Describe the problem it solves, your role, and the most interesting technical challenge.",
      tags: ["React", "Node.js", "MongoDB"],
      github: "#",
      live: "#",
    },
    {
      title: "Project Two",
      description:
        "Placeholder — a real-time app using WebSockets. Highlight what makes it fast, reliable, or fun to use.",
      tags: ["TypeScript", "Socket.io", "Express"],
      github: "#",
      live: "#",
    },
    {
      title: "Project Three",
      description:
        "Placeholder — a project that bridges hardware and the web, or anything you're proud of. Add a screenshot and a live link.",
      tags: ["React", "Redux", "SASS"],
      github: "#",
      live: "#",
    },
  ],
  experience: [
    {
      company: "Magshimim Cyber Programme",
      role: "Instructor",
      period: "2021 — 2024",
      location: "Israel",
      bullets: [
        "Taught C++ to high-school students: object-oriented programming, data structures, and algorithms.",
        "Led student teams through their final programming projects, from planning to delivery, keeping them on schedule and hitting targets.",
        "Coached problem-solving and practical engineering habits through code reviews and hands-on guidance.",
      ],
    },
    {
      company: "Elbit Systems Ltd",
      role: "Software Engineer",
      period: "Apr 2016 — Feb 2019",
      location: "Haifa, Israel",
      bullets: [
        "Developed and maintained the operation, monitoring, and UI mechanisms that let pilots control the avionics computer delivering augmented-reality symbology to their display.",
        "Built firmware for an ATmega2561 microcontroller interfacing with an FPGA that digitizes analog video, and routing serial traffic (UART / RS-485) between the avionics computer, debug tools, and test equipment, with internal and external devices over I2C and SPI.",
        "Integrated a night-vision system, owning its operation, monitoring, and UI mechanisms over UDP.",
        "Took features from design to implementation on a “demo team” that integrated new hardware and software technologies into existing products.",
      ],
    },
  ],
  education: [
    {
      school: "Coding Academy Israel",
      credential: "Full-Stack Developer Certificate",
      period: "2024 — 2025",
    },
    {
      school: "Experis Software",
      credential: "Computer Software Engineering Certificate",
      period: "2015",
    },
    {
      school: "University of Haifa",
      credential: "B.A. Business / Managerial Economics",
      period: "2011 — 2013",
    },
  ],
};
