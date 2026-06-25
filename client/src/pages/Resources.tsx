import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Video,
  Compass,
  ArrowLeft,
  BookOpen,
  Sparkles,
  Award,
  Clock,
  ArrowRight
} from "lucide-react";
import Header from "../components/Header";

// Static premium learning resources contents
export const resourcesData = [
  {
    id: "resume-tips",
    title: "Resume Tips",
    desc: "Build a highly professional, parse-friendly developer resume.",
    gradient: "from-emerald-500/10 via-white to-white",
    icon: FileText,
    subtitle: "How to pass developer ATS filters and stand out",
    readTime: "7 min read",
    category: "Applications",
    content: `
      <div class="space-y-6">
        <section class="bg-[#F0F6F2] p-5 rounded-2xl border border-[#E6F2DD]">
          <h4 class="text-base font-extrabold text-[#2F4F46] mb-2">1. Use a Clean, Single-Column Layout</h4>
          <p class="text-sm text-[#5E7C72] leading-relaxed">Applicant Tracking Systems (ATS) read single-column formats best. Avoid complex sidebars, tables, or non-standard fonts that make parsing your information difficult. Stick to standard sections like Summary, Skills, Work History, Projects, and Education. Use clean spacing and clear boundaries between sections.</p>
        </section>
        
        <section class="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
          <h4 class="text-base font-extrabold text-[#2F4F46] mb-2">2. Highlight Action-Oriented Impact</h4>
          <p class="text-sm text-gray-600 leading-relaxed mb-3">Instead of listing your daily duties, frame your accomplishments using action verbs and concrete metrics. Use the formula: <strong>Accomplished [X] as measured by [Y], by doing [Z]</strong>.</p>
          <div class="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs italic text-gray-500">
            <strong>Example:</strong> "Optimized API load times by 40% (X) through implementing Redis caching (Z), leading to a smoother checkout workflow for 50,000 monthly users (Y)."
          </div>
        </section>
        
        <section class="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
          <h4 class="text-base font-extrabold text-[#2F4F46] mb-2">3. ATS Keyword Optimization Strategies</h4>
          <p class="text-sm text-gray-600 leading-relaxed mb-3">Many large companies use parsing software to screen candidates before a recruiter reviews them. Align your resume keywords with the job posting:</p>
          <ul class="space-y-2 text-sm text-gray-600 list-disc pl-5">
            <li><strong>Match exact terminology:</strong> If the post asks for "React.js", do not write just "JS Frameworks". Match their vocabulary.</li>
            <li><strong>Avoid text inside headers/footers:</strong> ATS parsers often ignore content inside the document margins.</li>
            <li><strong>Do not use images/graphs:</strong> Do not include skill bar charts or progress bubbles; parsers read them as blank or unreadable characters.</li>
          </ul>
        </section>
        
        <section class="bg-[#F0F6F2] p-5 rounded-2xl border border-[#E6F2DD]">
          <h4 class="text-base font-extrabold text-[#2F4F46] mb-2">4. Key Developer Sections to Include</h4>
          <ul class="space-y-2 text-sm text-[#5E7C72] list-disc pl-5">
            <li><strong>Professional Summary:</strong> 2-3 sentences outlining your stack specialization, years of experience, and core achievements.</li>
            <li><strong>Technical Skills:</strong> Grouped clearly by languages, frameworks, databases, and developer tools.</li>
            <li><strong>Projects:</strong> Mention repository links, technical stack used, and the problem you solved.</li>
            <li><strong>Work History & Education:</strong> Standard reverse-chronological order.</li>
          </ul>
        </section>
        
        <section class="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
          <h4 class="text-base font-extrabold text-[#2F4F46] mb-2">5. Example Bullet Points for Core Roles</h4>
          <p class="text-sm text-gray-600 leading-relaxed mb-3">Use these formatted templates to rewrite your experience section:</p>
          <ul class="space-y-3 text-xs text-gray-500 pl-1 list-none">
            <li class="p-2.5 bg-gray-50 rounded-lg"><strong>Frontend:</strong> "Redesigned core onboarding dashboard in React and TypeScript, reducing initial page interactive delay (FID) by 35% and improving overall user conversion rate by 12%."</li>
            <li class="p-2.5 bg-gray-50 rounded-lg"><strong>Backend:</strong> "Engineered event-driven microservices using Node.js and RabbitMQ, handling 10,000 requests per minute with an average database response time of under 80ms."</li>
          </ul>
        </section>
      </div>
    `
  },
  {
    id: "interview-prep",
    title: "Interview Prep",
    desc: "Key questions, structure guidelines, and interview practice guides.",
    gradient: "from-amber-500/10 via-white to-white",
    icon: Video,
    subtitle: "Mastering coding interviews and behavioral rounds",
    readTime: "10 min read",
    category: "Interviews",
    content: `
      <div class="space-y-6">
        <section class="bg-[#FDFBF7] p-5 rounded-2xl border border-[#F5EAD4]">
          <h4 class="text-base font-extrabold text-[#785E2F] mb-2">1. Master the STAR Method for Behaviorals</h4>
          <p class="text-sm text-[#785E2F]/90 leading-relaxed mb-3">Answer behavioral questions by structuring your response into four components:</p>
          <ul class="space-y-1.5 text-xs text-gray-600 list-disc pl-5">
            <li><strong>Situation:</strong> Provide the background context. Set the scene and explain the situation.</li>
            <li><strong>Task:</strong> Explain the challenge or goal you needed to address. What was the core problem?</li>
            <li><strong>Action:</strong> Detail the specific actions you took (focus on your individual contribution and technical decisions).</li>
            <li><strong>Result:</strong> State the outcome, metrics, and what you learned. Did you save time, improve reliability, or reduce cost?</li>
          </ul>
        </section>
        
        <section class="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
          <h4 class="text-base font-extrabold text-[#2F4F46] mb-2">2. Technical Preparation Checklist</h4>
          <ul class="space-y-3 text-sm text-gray-600 list-disc pl-5">
            <li><strong>Data Structures:</strong> Understand Arrays, Hash Maps, Trees, Stacks, Queues, and Graphs inside out. Understand space/time complexity details.</li>
            <li><strong>Algorithms:</strong> Practice Sorting, Binary Search, Recursion, Breadth-First Search (BFS), and Depth-First Search (DFS) on Leetcode.</li>
            <li><strong>System Design:</strong> Brush up on horizontal scaling, load balancers, caching, database indexing, and message queues.</li>
          </ul>
        </section>
        
        <section class="bg-[#FDFBF7] p-5 rounded-2xl border border-[#F5EAD4]">
          <h4 class="text-base font-extrabold text-[#785E2F] mb-2">3. Think Out Loud During Coding Rounds</h4>
          <p class="text-sm text-gray-600 leading-relaxed">Interviewers value your thought process over a quiet perfect solution. Talk through your approach, discuss trade-offs (Time & Space complexity), and clarify assumptions before writing code. If you get stuck, explain what you are trying to achieve.</p>
        </section>

        <section class="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
          <h4 class="text-base font-extrabold text-[#2F4F46] mb-2">4. System Design Interview Framework</h4>
          <p class="text-sm text-gray-600 leading-relaxed mb-3">Use this 4-step approach to solve system design problems under 45 minutes:</p>
          <ol class="space-y-2 text-xs text-gray-500 list-decimal pl-5">
            <li><strong>Clarify requirements & scope:</strong> Define functional goals (e.g., users can upload images) and non-functional goals (scalability, availability, read-write ratio).</li>
            <li><strong>High-level architecture design:</strong> Draw blocks representing client, load balancer, application servers, databases, and caches.</li>
            <li><strong>Deep-dive key components:</strong> Explain database selection (SQL vs NoSQL), schema layouts, database partitioning, and scaling bottlenecks.</li>
            <li><strong>Identify bottlenecks & resolve:</strong> Address security, rate limiting, system failovers, and monitoring alerts.</li>
          </ol>
        </section>

        <section class="bg-[#FDFBF7] p-5 rounded-2xl border border-[#F5EAD4]">
          <h4 class="text-base font-extrabold text-[#785E2F] mb-2">5. Questions to Ask the Interviewer</h4>
          <p class="text-sm text-[#785E2F]/90 leading-relaxed mb-3">At the end of the round, ask smart questions to show your genuine interest and evaluate company culture:</p>
          <ul class="space-y-1.5 text-xs text-gray-600 list-disc pl-5">
            <li>"How does the team handle post-mortem analyses of service outages?"</li>
            <li>"What is the biggest technical challenge the engineering team is currently facing?"</li>
            <li>"How are developers encouraged to contribute to tooling or architecture upgrades?"</li>
          </ul>
        </section>
      </div>
    `
  },
  {
    id: "career-strategy",
    title: "Career Strategy",
    desc: "Articles on finding, choosing, and planning your next career milestone.",
    gradient: "from-blue-500/10 via-white to-white",
    icon: Compass,
    subtitle: "Long-term planning and stack specialization",
    readTime: "8 min read",
    category: "Career growth",
    content: `
      <div class="space-y-6">
        <section class="bg-[#F4F8FC] p-5 rounded-2xl border border-[#D9E6F5]">
          <h4 class="text-base font-extrabold text-[#2F4F7A] mb-2">1. Define Your Stack Specialization</h4>
          <p class="text-sm text-gray-600 leading-relaxed">While being a generalist is helpful early on, specialization builds high market value. Choose a deep focus area: Full Stack JS (React/Node), Cloud Infrastructure (DevOps/Kubernetes), Backend Systems (Go/Rust), or Mobile (Flutter/Swift).</p>
        </section>
        
        <section class="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
          <h4 class="text-base font-extrabold text-[#2F4F46] mb-2">2. Build a Living Portfolio</h4>
          <p class="text-sm text-gray-600 leading-relaxed">A GitHub profile with clean, documented code speaks louder than any resume. Maintain 1-2 pinning projects with detailed READMEs, architecture diagrams, and live demonstration links. Show that you can write clean, production-ready code.</p>
        </section>
        
        <section class="bg-[#F4F8FC] p-5 rounded-2xl border border-[#D9E6F5]">
          <h4 class="text-base font-extrabold text-[#2F4F7A] mb-2">3. Contribute to Open Source</h4>
          <p class="text-sm text-gray-600 leading-relaxed">Contributing to public repositories demonstrates your ability to read existing codebases, write unit tests, and collaborate via Pull Requests. Start with "good first issue" tags on projects you use daily.</p>
        </section>
        
        <section class="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
          <h4 class="text-base font-extrabold text-[#2F4F46] mb-2">4. Continuous Upskilling</h4>
          <p class="text-sm text-gray-600 leading-relaxed">Dedicate 2-3 hours weekly to learning new architectures, security patterns, or system designs. Stay ahead by reading engineering blogs from companies like Netflix, Uber, and Figma.</p>
        </section>

        <section class="bg-[#F4F8FC] p-5 rounded-2xl border border-[#D9E6F5]">
          <h4 class="text-base font-extrabold text-[#2F4F7A] mb-2">5. Negotiating Your Job Offer</h4>
          <p class="text-sm text-gray-600 leading-relaxed mb-3">Maximize your compensation packages with standard negotiation principles:</p>
          <ul class="space-y-2 text-xs text-gray-500 list-disc pl-5">
            <li><strong>Let them name a figure first:</strong> Avoid sharing salary expectations early. Answer with: "I'm looking for a competitive rate aligned with the market and my level."</li>
            <li><strong>Highlight unique strengths:</strong> Tie your demand back to technical skills, projects, and positive business results you bring.</li>
            <li><strong>Evaluate total reward package:</strong> Consider stock options, health coverage, flexible setups, and training budgets.</li>
          </ul>
        </section>

        <section class="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm">
          <h4 class="text-base font-extrabold text-[#2F4F46] mb-2">6. Navigating the First 90 Days</h4>
          <p class="text-sm text-gray-600 leading-relaxed mb-3">Set up a roadmap for success when joining a new engineering team:</p>
          <ol class="space-y-1.5 text-xs text-gray-500 list-decimal pl-5">
            <li><strong>Days 1-30 (Learn):</strong> Focus on checking out the code, shipping a minor bug fix, and setting up meetings with stakeholders to understand business workflows.</li>
            <li><strong>Days 31-60 (Contribute):</strong> Start claiming larger cards, improving documentation gaps, and actively contributing to review discussions.</li>
            <li><strong>Days 61-90 (Deliver):</strong> Lead minor feature launches and suggest developer experience or refactoring upgrades.</li>
          </ol>
        </section>
      </div>
    `
  }
];

export default function Resources() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedResource, setSelectedResource] = useState(resourcesData[0]);

  useEffect(() => {
    if (id) {
      const found = resourcesData.find((r) => r.id === id);
      if (found) {
        setSelectedResource(found);
      }
    }
  }, [id]);

  const handleSelectResource = (resource: typeof resourcesData[0]) => {
    setSelectedResource(resource);
    navigate(`/resources/${resource.id}`);
  };

  const SelectedIcon = selectedResource.icon;

  return (
    <div className="text-[#2F4F46] relative bg-[#F8FAF8] min-h-screen pb-16">
      {/* Premium ambient light spots */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#B1D3B9]/15 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-[#659287]/5 to-transparent rounded-full blur-[80px] pointer-events-none" />

      {/* Floating Navbar */}
      <div className="max-w-[1600px] mx-auto px-6 pt-6">
        <Header />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 mt-8 space-y-8">
        {/* Back and breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-xs font-bold text-[#659287] hover:text-[#53786F] transition-all bg-white border border-[#E6F2DD] px-4 py-2 rounded-xl shadow-sm hover:shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-1 text-xs text-gray-450 font-bold">
            <span>Dashboard</span>
            <ArrowRight className="w-3 h-3" />
            <span className="text-[#2F4F46]">Learning Resources</span>
          </div>
        </div>

        {/* Hero banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#2F4F46] via-[#3D6459] to-[#659287] text-white rounded-[2rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(47,79,70,0.15)] border border-[#2F4F46]/10">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none translate-x-12 -translate-y-12" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-semibold text-[#E6F2DD]">
              <Sparkles className="w-3.5 h-3.5 text-[#B1D3B9]" /> Learning Center
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight m-0 text-white leading-tight">
              Developer Career Hub
            </h1>
            <p className="text-sm sm:text-base text-[#E6F2DD]/90 font-medium max-w-xl">
              Curated resource guides to optimize your portfolio, pass ATS resume checks, and excel in technical coding interviews.
            </p>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
          {/* Left Column: Resources List */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-[#5E7C72] font-black pl-1">
              Available Guides
            </h3>
            <div className="space-y-3">
              {resourcesData.map((resource) => {
                const Icon = resource.icon;
                const isSelected = selectedResource.id === resource.id;
                return (
                  <motion.div
                    key={resource.id}
                    onClick={() => handleSelectResource(resource)}
                    whileHover={{ scale: 1.01 }}
                    className={`p-5 rounded-2xl cursor-pointer border transition-all flex flex-col justify-between gap-4 ${
                      isSelected
                        ? "bg-[#2F4F46] border-[#2F4F46] shadow-lg"
                        : "bg-white border-[#E6F2DD] hover:border-[#659287]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                          isSelected
                            ? "bg-white/10 text-white"
                            : "bg-[#E6F2DD] text-[#659287]"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <span
                          className={`text-[10px] uppercase font-bold tracking-wider ${
                            isSelected ? "text-[#B1D3B9]" : "text-gray-400"
                          }`}
                        >
                          {resource.category}
                        </span>
                        <h4 className="text-sm font-extrabold" style={{ color: isSelected ? '#ffffff' : '#2F4F46' }}>{resource.title}</h4>
                        <p
                          className="text-xs line-clamp-2 leading-relaxed"
                          style={{ color: isSelected ? '#e6f2dd' : '#5E7C72' }}
                        >
                          {resource.desc}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center justify-between pt-3 border-t text-[10px] font-bold ${
                        isSelected
                          ? "border-white/10 text-[#B1D3B9]"
                          : "border-gray-100 text-gray-450"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {resource.readTime}
                      </span>
                      <span className="flex items-center gap-0.5 group hover:underline">
                        Read Guide <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Guide Reader */}
          <div className="bg-white border border-[#E6F2DD] rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
            <div className="border-b border-gray-150 pb-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#E6F2DD] rounded-xl border border-[#B1D3B9]/20 text-[#659287]">
                  <SelectedIcon className="w-5 h-5" />
                </span>
                <span className="text-[10px] tracking-wider uppercase font-extrabold text-[#659287]">
                  {selectedResource.category} Guide
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black leading-tight" style={{ color: '#2F4F46' }}>
                {selectedResource.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-gray-500 font-bold">
                <p className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" /> {selectedResource.readTime}
                </p>
                <span>•</span>
                <p className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-gray-400" /> Premium Content
                </p>
              </div>
              <p className="text-sm font-semibold text-[#5E7C72] bg-[#F0F6F2] p-4 rounded-xl border border-[#E6F2DD]/60 leading-relaxed">
                {selectedResource.subtitle}
              </p>
            </div>

            {/* Guide Content */}
            <div
              className="prose prose-teal max-w-none text-gray-600 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: selectedResource.content }}
            />

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-gray-150 flex items-center justify-between">
              <span className="text-xs text-gray-450 font-bold">Was this helpful?</span>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-5 py-2.5 bg-[#659287] hover:bg-[#53786F] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#659287]/10"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
