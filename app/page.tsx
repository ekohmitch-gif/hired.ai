'use client';

import { useState, useEffect, useRef } from 'react';
import { SignInButton, UserButton, useUser, ClerkLoaded } from '@clerk/nextjs';

interface ExperienceItem {
  role: string;
  company: string;
  dates: string;
  bullets: string[];
}

export default function Home() {
  const { isSignedIn } = useUser();

  const [activeTab, setActiveTab] = useState<'match' | 'build'>('match');
  const [credits, setCredits] = useState<number>(3);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [parsing, setParsing] = useState(false);
  const [fileKey, setFileKey] = useState<number>(Date.now());

  const [targetRole, setTargetRole] = useState<string>('');
  const [refiningSummary, setRefiningSummary] = useState(false);
  const [buildForm, setBuildForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    summary: '',
    skills: '',
    experience: [
      {
        role: '',
        company: '',
        dates: '',
        bullets: [''],
      },
    ] as ExperienceItem[],
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedCredits = localStorage.getItem('enhancerez_credits');
    if (savedCredits !== null) {
      setCredits(parseInt(savedCredits, 10));
    } else {
      localStorage.setItem('enhancerez_credits', '3');
    }
  }, []);

  const deductCredit = () => {
    const newCount = credits - 1;
    setCredits(newCount);
    localStorage.setItem('enhancerez_credits', newCount.toString());
  };

  const handleStripeCheckout = async () => {
    if (!isSignedIn) return alert('Please sign in first.');
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Error connecting to Checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/parse', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.text) setResumeText(data.text || '');
    } catch {
      alert('Error parsing document');
    } finally {
      setParsing(false);
      setFileKey(Date.now());
    }
  };

  const handleGenerateMatch = async () => {
    if (credits <= 0) return alert('No credits remaining.');
    if (!resumeText || !jobDescription) return alert('Provide resume and job description.');
    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      const data = await response.json();
      setResult(data.tailoredResume || data);
      deductCredit();
    } catch {
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleRefineSummary = async () => {
    const textToRefine = result?.summary || buildForm.summary;
    if (!textToRefine) return alert('Enter a summary draft first.');
    setRefiningSummary(true);
    try {
      const res = await fetch('/api/generate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'Professional Summary',
          prompt: `Refine and optimize this summary for ATS compatibility: "${textToRefine}"`,
          targetRole,
        }),
      });
      const data = await res.json();
      if (data.output) {
        const refined = data.output.trim();
        setBuildForm((prev) => ({ ...prev, summary: refined }));
        if (result) setResult((prev: any) => ({ ...prev, summary: refined }));
      }
    } catch {
      alert('Failed to refine summary.');
    } finally {
      setRefiningSummary(false);
    }
  };

  const handleAddExperience = () => {
    setBuildForm({
      ...buildForm,
      experience: [
        ...buildForm.experience,
        { role: '', company: '', dates: '', bullets: [''] },
      ],
    });
  };

  const handleExperienceChange = (index: number, field: string, value: any) => {
    const updated = [...buildForm.experience];
    updated[index] = { ...updated[index], [field]: value || '' };
    setBuildForm({ ...buildForm, experience: updated });
  };

  const handleAddBullet = (expIndex: number) => {
    const updated = [...buildForm.experience];
    updated[expIndex].bullets.push('');
    setBuildForm({ ...buildForm, experience: updated });
  };

  const handleBulletChange = (expIndex: number, bulletIndex: number, value: string) => {
    const updated = [...buildForm.experience];
    updated[expIndex].bullets[bulletIndex] = value || '';
    setBuildForm({ ...buildForm, experience: updated });
  };

  const handleCompileBuild = () => {
    if (credits <= 0) return alert('No credits remaining.');
    const skillsArray = buildForm.skills ? buildForm.skills.split(',').map((s) => s.trim()) : [];
    const contactParts = [buildForm.location, buildForm.email, buildForm.phone, buildForm.linkedin].filter(Boolean);
    setResult({
      fullName: buildForm.fullName || 'Candidate Name',
      contactInfo: contactParts.join(' | ') || 'Location | Email | Phone',
      summary: buildForm.summary || 'Professional summary...',
      skills: skillsArray,
      experience: buildForm.experience,
    });
    deductCredit();
  };

  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans p-6 print:bg-white print:text-black print:p-0">
      <div className="max-w-7xl mx-auto space-y-6">

        <header className="flex justify-between items-center border-b border-slate-800 pb-4 print:hidden">
          <h1 className="text-2xl font-bold font-serif text-white">
            Enhancerez<span className="text-amber-400">.com</span>
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-amber-400 border border-slate-800 bg-slate-900 px-3 py-1 rounded-full">
              Credits: {credits}
            </span>
            <button
              onClick={handleStripeCheckout}
              disabled={checkoutLoading}
              className="bg-amber-400 text-slate-950 font-semibold px-3 py-1 rounded-md text-xs hover:bg-amber-300 transition"
            >
              Subscribe
            </button>
            <ClerkLoaded>
              {!isSignedIn ? <SignInButton mode="modal" /> : <UserButton />}
            </ClerkLoaded>
          </div>
        </header>

        <div className="flex gap-2 border-b border-slate-800 pb-3 print:hidden">
          <button
            onClick={() => setActiveTab('match')}
            className={`text-xs uppercase px-3 py-1.5 rounded-lg transition ${
              activeTab === 'match' ? 'bg-slate-800 text-amber-400 border border-amber-400/30' : 'text-slate-400'
            }`}
          >
            Match & Optimize
          </button>
          <button
            onClick={() => setActiveTab('build')}
            className={`text-xs uppercase px-3 py-1.5 rounded-lg transition ${
              activeTab === 'build' ? 'bg-slate-800 text-amber-400 border border-amber-400/30' : 'text-slate-400'
            }`}
          >
            Live Builder
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
          <div className="lg:col-span-5 space-y-4 bg-slate-900/40 p-5 rounded-xl border border-slate-800 print:hidden">
            {activeTab === 'match' ? (
              <>
                <div>
                  <label className="text-xs uppercase text-slate-400 block mb-1">Upload Resume</label>
                  <input
                    key={fileKey}
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800 mb-2"
                  />
                  <textarea
                    className="w-full h-24 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono resize-none outline-none"
                    placeholder="Resume text..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase text-slate-400 block mb-1">Target Job Description</label>
                  <textarea
                    className="w-full h-24 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono resize-none outline-none"
                    placeholder="Job description..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleGenerateMatch}
                  disabled={loading || parsing}
                  className="w-full bg-slate-100 text-slate-950 font-semibold py-2.5 rounded-lg text-xs uppercase hover:bg-white transition"
                >
                  {loading ? 'Analyzing...' : 'Tailor & Match'}
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Target Role"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-xs text-white outline-none"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-xs text-white outline-none"
                  value={buildForm.fullName}
                  onChange={(e) => setBuildForm({ ...buildForm, fullName: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="email"
                    placeholder="Email"
                    className="p-2 bg-slate-950 border border-slate-800 rounded text-xs text-white outline-none"
                    value={buildForm.email}
                    onChange={(e) => setBuildForm({ ...buildForm, email: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    className="p-2 bg-slate-950 border border-slate-800 rounded text-xs text-white outline-none"
                    value={buildForm.phone}
                    onChange={(e) => setBuildForm({ ...buildForm, phone: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Location"
                    className="p-2 bg-slate-950 border border-slate-800 rounded text-xs text-white outline-none"
                    value={buildForm.location}
                    onChange={(e) => setBuildForm({ ...buildForm, location: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="LinkedIn"
                    className="p-2 bg-slate-950 border border-slate-800 rounded text-xs text-white outline-none"
                    value={buildForm.linkedin}
                    onChange={(e) => setBuildForm({ ...buildForm, linkedin: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] text-slate-400">Professional Summary</label>
                    <button onClick={handleRefineSummary} disabled={refiningSummary} className="text-[10px] text-amber-400 hover:underline">
                      {refiningSummary ? 'Refining...' : '✨ Refine'}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Summary..."
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-xs text-white resize-none outline-none"
                    value={buildForm.summary}
                    onChange={(e) => {
                      setBuildForm({ ...buildForm, summary: e.target.value });
                      if (result) setResult({ ...result, summary: e.target.value });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Skills (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="Python, Cybersecurity, SIEM"
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-xs text-white outline-none"
                    value={buildForm.skills}
                    onChange={(e) => setBuildForm({ ...buildForm, skills: e.target.value })}
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] text-slate-400">Experience</label>
                    <button onClick={handleAddExperience} className="text-[10px] text-amber-400 hover:underline">
                      + Add Position
                    </button>
                  </div>
                  {buildForm.experience.map((exp, expIndex) => (
                    <div key={expIndex} className="p-2.5 bg-slate-950/60 border border-slate-800 rounded space-y-2">
                      <input
                        type="text"
                        placeholder="Job Title"
                        className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white outline-none"
                        value={exp.role}
                        onChange={(e) => handleExperienceChange(expIndex, 'role', e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Company"
                          className="p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white outline-none"
                          value={exp.company}
                          onChange={(e) => handleExperienceChange(expIndex, 'company', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Dates"
                          className="p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white outline-none"
                          value={exp.dates}
                          onChange={(e) => handleExperienceChange(expIndex, 'dates', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-500">Bullets</span>
                          <button onClick={() => handleAddBullet(expIndex)} className="text-[10px] text-amber-400 hover:underline">
                            + Bullet
                          </button>
                        </div>
                        {exp.bullets.map((bullet, bulletIndex) => (
                          <input
                            key={bulletIndex}
                            type="text"
                            placeholder="Bullet point..."
                            className="w-full p-1.5 bg-slate-900 border border-slate-800 rounded text-xs text-white outline-none"
                            value={bullet}
                            onChange={(e) => handleBulletChange(expIndex, bulletIndex, e.target.value)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={handleCompileBuild} className="w-full bg-amber-400 text-slate-950 font-semibold py-2.5 rounded-lg text-xs uppercase hover:bg-amber-300 transition">
                  Compile Preview
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 bg-slate-900/40 p-6 rounded-xl border border-slate-800 print:bg-white print:border-none print:p-0">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4 print:hidden">
              <span className="text-xs uppercase text-slate-400">Live Preview</span>
              {result && (
                <button onClick={() => window.print()} className="bg-amber-400 text-slate-950 text-xs font-semibold px-3 py-1 rounded hover:bg-amber-300 transition">
                  Export PDF
                </button>
              )}
            </div>

            {!result ? (
              <div className="h-40 flex items-center justify-center text-slate-500 text-xs italic">
                Ready to generate document...
              </div>
            ) : (
              <div ref={resumeRef} className="space-y-4 text-xs text-slate-200 print:text-black">
                <div className="border-b border-slate-800 print:border-black pb-2">
                  <h1 className="text-xl font-bold text-white print:text-black">{result.fullName}</h1>
                  <p className="text-xs font-mono text-slate-400 print:text-slate-800">{result.contactInfo}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center print:block">
                    <h4 className="font-bold text-amber-300 print:text-black uppercase text-xs">Professional Summary</h4>
                    <button onClick={handleRefineSummary} disabled={refiningSummary} className="text-[10px] text-amber-400 print:hidden">
                      {refiningSummary ? 'Refining...' : '✨ Refine text'}
                    </button>
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updated = e.currentTarget.textContent || '';
                      setResult((prev: any) => ({ ...prev, summary: updated }));
                      setBuildForm((prev) => ({ ...prev, summary: updated }));
                    }}
                    className="w-full bg-slate-950/40 print:bg-transparent p-2 rounded border border-slate-800 print:border-none text-xs leading-relaxed text-slate-300 print:text-black outline-none"
                  >
                    {result.summary}
                  </div>
                </div>

                {result.skills?.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-amber-300 print:text-black uppercase text-xs">Core Competencies</h4>
                    <div className="flex flex-wrap gap-1">
                      {result.skills.map((s: string, i: number) => (
                        <span key={i} className="bg-slate-950 print:bg-transparent text-slate-300 print:text-black border border-slate-800 px-2 py-0.5 rounded text-[11px] font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.experience?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-amber-300 print:text-black uppercase text-xs">Professional Experience</h4>
                    {result.experience.map((exp: any, expIdx: number) => (
                      <div key={expIdx} className="space-y-1">
                        <div className="flex justify-between items-baseline font-bold text-slate-100 print:text-black">
                          <span>{exp.role} {exp.company && `— ${exp.company}`}</span>
                          <span className="font-mono text-[11px] text-slate-400 print:text-slate-700">{exp.dates}</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 pl-1 text-slate-300 print:text-black">
                          {exp.bullets?.map((bullet: string, bIdx: number) => (
                            <li key={bIdx} className="leading-relaxed">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}