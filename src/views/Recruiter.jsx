'use client'

import React, { useMemo, useState } from 'react'
import { Search, MapPin, Trophy, Briefcase, Clock } from 'lucide-react'
import candidatesData from '../../test/candidates.json'

// Sample candidates data embedded in the file
// const candidatesData = [
//   {
//     id: 1,
//     name: "Alex Chen",
//     title: "Full Stack Developer",
//     location: "Remote",
//     skills: ["React", "Node", "Solidity"],
//     certificates: [
//       { name: "Ethereum Development", issuer: "ChainEd", date: "2024-09-12" },
//       { name: "Advanced JavaScript", issuer: "OpenCourse", date: "2023-06-01" }
//     ]
//   },
//   {
//     id: 2,
//     name: "Maria Garcia",
//     title: "Blockchain Engineer",
//     location: "Lagos, NG",
//     skills: ["Solidity", "Hardhat", "JavaScript"],
//     certificates: [
//       { name: "Smart Contract Development", issuer: "DevBootcamp", date: "2025-01-10" }
//     ]
//   },
//   {
//     id: 3,
//     name: "James Wilson",
//     title: "Frontend Engineer",
//     location: "Lisbon, PT",
//     skills: ["React", "TypeScript", "Tailwind"],
//     certificates: [
//       { name: "React Master Class", issuer: "Frontend Masters", date: "2022-11-20" }
//     ]
//   },
//   {
//     id: 4,
//     name: "Sofia Petrov",
//     title: "Cloud Engineer",
//     location: "Seoul, KR",
//     skills: ["AWS", "Docker", "Kubernetes"],
//     certificates: [
//       { name: "AWS Solutions Architect", issuer: "Amazon", date: "2021-05-14" }
//     ]
//   },
//   {
//     id: 5,
//     name: "Priya Nair",
//     title: "DevOps Engineer",
//     location: "Bangalore, IN",
//     skills: ["Docker", "Kubernetes", "AWS"],
//     certificates: [
//       { name: "Kubernetes Administration", issuer: "Linux Academy", date: "2024-03-22" }
//     ]
//   },
//   {
//     id: 6,
//     name: "Marco Rossi",
//     title: "Backend Developer",
//     location: "Milan, IT",
//     skills: ["Node", "PostgreSQL", "TypeScript"],
//     certificates: [
//       { name: "Backend Mastery", issuer: "Node.js Foundation", date: "2023-08-15" }
//     ]
//   },
//   {
//     id: 7,
//     name: "Emma Johnson",
//     title: "Senior Frontend Dev",
//     location: "London, UK",
//     skills: ["React", "TypeScript", "Next.js"],
//     certificates: [
//       { name: "Advanced React Patterns", issuer: "React Training", date: "2024-02-10" }
//     ]
//   },
//   {
//     id: 8,
//     name: "David Kim",
//     title: "Full Stack Developer",
//     location: "Tokyo, JP",
//     skills: ["React", "Node", "MongoDB"],
//     certificates: [
//       { name: "MERN Stack Certification", issuer: "Udemy Pro", date: "2023-11-30" }
//     ]
//   }
// ]

// Badge component
const Badge = ({ children, variant = 'default' }) => {
  const baseClasses = "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold mr-2 mb-1 transition-colors"
  const variants = {
    default: "bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20",
    skill: "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20",
  }
  return (
    <span className={`${baseClasses} ${variants[variant]}`}>{children}</span>
  )
}

// Candidate card component
const CandidateCard = ({ c }) => (
  <div className="group bg-card hover:shadow-lg transition-all duration-300 border border-border rounded-lg overflow-hidden hover:border-accent/50">
    {/* Header with location badge */}
    <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">{c.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Briefcase className="w-4 h-4 text-accent" />
            <p className="text-sm font-semibold text-accent">{c.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 rounded-full whitespace-nowrap">
          <MapPin className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-semibold text-accent">{c.location}</span>
        </div>
      </div>
    </div>

    {/* Skills section */}
    <div className="px-5 py-4 border-b border-border">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Skills</h4>
      <div className="flex flex-wrap">
        {c.skills.map((s) => (
          <Badge key={s} variant="skill">{s}</Badge>
        ))}
      </div>
    </div>

    {/* Certificates section */}
    <div className="px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-accent" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Certifications</h4>
      </div>
      <ul className="space-y-2">
        {c.certificates.map((cert, idx) => (
          <li key={idx} className="p-3 bg-muted/50 border border-border rounded-md hover:bg-muted/80 transition-colors">
            <div className="text-sm font-semibold text-card-foreground">{cert.name}</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              Issued by <span className="font-medium">{cert.issuer}</span> • {cert.date}
            </div>
          </li>
        ))}
      </ul>
    </div>
  </div>
)

// Main recruiter component
export default function Recruiter() {
  const [query, setQuery] = useState('')

  const terms = useMemo(() =>
    query
      .split(/[ ,]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
    [query]
  )

  const results = useMemo(() => {
    if (!terms.length) return candidatesData
    return candidatesData.filter((c) => {
      const skillSet = new Set(c.skills.map((s) => s.toLowerCase()))
      return terms.every((t) => skillSet.has(t))
    })
  }, [terms])

  return (
    <div className="min-h-screen bg-background">
      

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <section className="mb-12">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Search Skills</label>
            <div className="flex gap-3 flex-col sm:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. React, Node.js, TypeScript"
                  className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all placeholder:text-muted-foreground text-card-foreground"
                />
              </div>
              <button 
                onClick={() => setQuery('')}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                Clear
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">💡 Tip: Separate multiple skills with commas or spaces</p>
          </div>
        </section>

        {/* Results Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" />
              <div className="text-sm">
                <span className="text-muted-foreground">Showing </span>
                <span className="font-bold text-card-foreground text-base">{results.length}</span>
                <span className="text-muted-foreground"> candidate{results.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-12 bg-card border border-dashed border-border rounded-lg">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No candidates match your search.</p>
              <p className="text-muted-foreground text-sm mt-1">Try different skills or clear filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((c) => (
                <CandidateCard key={c.id} c={c} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
