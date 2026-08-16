'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'match' | 'build'>('match');
  const [credits, setCredits] = useState<number>(3);
  const [showPaywall, setShowPaywall] = useState(false);

  // Match Mode States
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsing, setParsing] = useState(false);

  // Build Mode Form States
  const [targetRole, setTargetRole] = useState('');
  const [buildForm, setBuildForm] = useState({
    fullName: '',
    contactInfo: '',
    summary: '',
    skills: '',
    experienceRole: '',
    experienceCompany: '',
    experienceBullets: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Load / Initialize Free Credits
  useEffect(() => {
    const savedCredits = localStorage.getItem('hired_ai_credits');
    if (savedCredits !== null) {
      setCredits(parseInt(savedCredits, 10));
    } else {
      localStorage.setItem('hired_ai_credits', '3');
    }
  }, []);

  const deductCredit = () => {
    const newCount = credits - 1;
    setCredits(newCount);
    localStorage.setItem('hired_ai_credits', newCount.toString());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResumeText(data.text);
    } catch (err: any) {
      alert(err.message || 'Error parsing document');
      setFileName('');
    } finally {
      setParsing(false);
    }
  };

  // Optimization Handler
  const handleGenerateMatch = async () => {
    if (credits <= 0) {
      setShowPaywall(true);
      return;
    }

    if (!resumeText || !jobDescription) {
      alert('Please upload/paste a resume and provide a target job description.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      deductCredit();
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // AI Assist Helper for Build Mode
  const handleAIAssistSummary = async () => {
    if (!targetRole) {
      alert('Please enter a Target Job Title / Industry first.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/generate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: 'Professional Summary',
          prompt: `Write a compelling 2-3 sentence resume summary for a candidate targeting: ${targetRole}. Current notes: ${buildForm.summary}`,
          targetRole,
        }),
      });
      const data = await res.json();
      if (data.output) {
        setBuildForm((prev) => ({ ...prev, summary: data.output.trim() }));
      }
    } catch (err) {
      alert('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  // Assemble Manual Build into Preview Result
  const handleCompileBuild = () => {
    if (credits <= 0) {
      setShowPaywall(true);
      return;
    }

    const skillsArray = buildForm.skills
      ? buildForm.skills.split(',').map((s) => s.trim())
      : [];

    const bulletsArray = buildForm.experienceBullets
      ? buildForm.experienceBullets.split('\n').filter((b) => b.trim().length > 0)
      : [];

    setResult({
      fullName: buildForm.fullName || 'Candidate Name',
      contactInfo: buildForm.contactInfo || 'Location | Email | Phone',
      summary: buildForm.summary || 'Professional summary...',
      skills: skillsArray,
      experience: [
        {
          role: buildForm.experienceRole || 'Role Title',
          company: buildForm.experienceCompany || 'Company Name',
          dates: 'Present',
          bullets: bulletsArray.length > 0 ? bulletsArray : ['Key responsibility or accomplishment'],
        },
      ],
      education: [],
    });

    deductCredit();
  };

  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans p-4 md:p-12 print:bg-white print:text-black print:p-0">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800/80 pb-6 gap-4 print:hidden">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-white">
              Hired<span className="text-amber-400">.ai</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Credit Badge */}
            <div className="bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-mono flex items-center gap-2">
              <span className="text-slate-400">Credits:</span>
              <span className={`font-bold ${credits > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                {credits} Free Left
              </span>
            </div>

            <button
              onClick={() => setShowPaywall(true)}
              className="bg-amber-400 text-slate-950 font-semibold px-4 py-1.5 rounded-full text-xs hover:bg-amber-300 transition"
            >
              Subscribe / Get Credits
            </button>
          </div>
        </header>

        {/* Tab Selection */}
        <div className="flex gap-4 border-b border-slate-800/80 pb-4 print:hidden">
          <button
            onClick={() => setActiveTab('match')}
            className={`text-xs uppercase tracking-widest px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'match'
                ? 'bg-slate-800 text-amber-400 border border-amber-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Match Job Description
          </button>
          <button
            onClick={() => setActiveTab('build')}
            className={`text-xs uppercase tracking-widest px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'build'
                ? 'bg-slate-800 text-amber-400 border border-amber-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Build From Scratch
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">

          {/* Left Inputs Column */}
          <div className="lg:col-span-5 space-y-6 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-2xl print:hidden">

            {/* TAB 1: MATCH MODE */}
            {activeTab === 'match' && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs uppercase tracking-[0.15em] font-medium text-slate-300">
                      01. Upload or Paste Resume
                    </label>
                    {fileName && <span className="text-[11px] text-amber-400 font-mono">{fileName}</span>}
                  </div>

                  <div className="border border-dashed border-slate-700/80 hover:border-amber-400/50 transition-colors rounded-xl p-4 text-center bg-slate-950/40">
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer text-xs text-slate-400 flex flex-col items-center gap-1">
                      <span className="font-medium text-slate-200 hover:text-amber-300 transition">
                        Upload Resume (PDF / DOCX)
                      </span>
                    </label>
                  </div>

                  <textarea
                    className="w-full h-32 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl focus:border-amber-400/50 outline-none text-xs text-slate-300 font-mono transition resize-none"
                    placeholder={parsing ? 'Extracting text...' : 'Paste current resume text...'}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs uppercase tracking-[0.15em] font-medium text-slate-300">
                    02. Target Job Description
                  </label>
                  <textarea
                    className="w-full h-32 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl focus:border-amber-400/50 outline-none text-xs text-slate-300 font-mono transition resize-none"
                    placeholder="Paste the target job requirements..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleGenerateMatch}
                  disabled={loading || parsing}
                  className="w-full bg-slate-100 hover:bg-white text-slate-950 font-semibold py-3.5 rounded-xl transition duration-200 shadow-xl disabled:opacity-40 text-xs tracking-wider uppercase"
                >
                  {loading ? 'Optimizing...' : 'Optimize & Match Resume'}
                </button>
              </>
            )}

            {/* TAB 2: BUILD MODE */}
            {activeTab === 'build' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Target Role / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Cybersecurity Engineer"
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-amber-400/50"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white outline-none"
                      value={buildForm.fullName}
                      onChange={(e) => setBuildForm({ ...buildForm, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1">Contact Details</label>
                    <input
                      type="text"
                      placeholder="City, State | Email | LinkedIn"
                      className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white outline-none"
                      value={buildForm.contactInfo}
                      onChange={(e) => setBuildForm({ ...buildForm, contactInfo: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] uppercase tracking-wider text-slate-400">Summary</label>
                    <button
                      onClick={handleAIAssistSummary}
                      disabled={loading}
                      className="text-[10px] text-amber-400 hover:underline font-mono"
                    >
                      + AI Assist
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Write a brief intro or click AI Assist..."
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white outline-none resize-none"
                    value={buildForm.summary}
                    onChange={(e) => setBuildForm({ ...buildForm, summary: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1">Skills (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="Python, Next.js, Cloud Security, SIEM"
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white outline-none"
                    value={buildForm.skills}
                    onChange={(e) => setBuildForm({ ...buildForm, skills: e.target.value })}
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="block text-[11px] uppercase tracking-wider text-amber-400 font-medium">Recent Work Experience</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Role (e.g. IT Engineer)"
                      className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white outline-none"
                      value={buildForm.experienceRole}
                      onChange={(e) => setBuildForm({ ...buildForm, experienceRole: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Company Name"
                      className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white outline-none"
                      value={buildForm.experienceCompany}
                      onChange={(e) => setBuildForm({ ...buildForm, experienceCompany: e.target.value })}
                    />
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Enter bullet points (one per line)..."
                    className="w-full p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-white outline-none resize-none"
                    value={buildForm.experienceBullets}
                    onChange={(e) => setBuildForm({ ...buildForm, experienceBullets: e.target.value })}
                  />
                </div>

                <button
                  onClick={handleCompileBuild}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold py-3 rounded-xl transition text-xs tracking-wider uppercase mt-2"
                >
                  Build Resume
                </button>
              </div>
            )}
          </div>

          {/* Right Preview Column */}
          <div className="lg:col-span-7 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 md:p-10 rounded-2xl shadow-2xl flex flex-col justify-between print:bg-white print:border-none print:shadow-none print:p-0">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-4 mb-6 print:hidden">
                <span className="text-xs uppercase tracking-[0.15em] text-slate-400 font-medium">
                  Document Preview
                </span>
                {result && (
                  <button
                    onClick={() => window.print()}
                    className="bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-medium px-4 py-2 rounded-lg transition"
                  >
                    Export PDF
                  </button>
                )}
              </div>

              {!result && !loading && (
                <div className="h-72 flex flex-col items-center justify-center text-slate-500 text-xs text-center font-light space-y-2">
                  <p className="font-serif text-lg text-slate-400 italic">Ready to Preview</p>
                  <p className="max-w-xs text-slate-500">Select a mode on the left to start tailoring your resume.</p>
                </div>
              )}

              {loading && (
                <div className="h-72 flex flex-col items-center justify-center space-y-4">
                  <div className="w-8 h-8 border-2 border-amber-400/80 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-amber-300/80 font-mono tracking-wider uppercase animate-pulse">
                    Processing resume document...
                  </p>
                </div>
              )}

              {result && (
                <div className="space-y-6 text-xs text-slate-200 print:text-black">

                  {/* Header */}
                  <div className="border-b border-slate-800 print:border-black pb-4 space-y-1">
                    <input
                      type="text"
                      className="text-2xl md:text-3xl font-serif font-normal bg-transparent text-white print:text-black outline-none w-full tracking-tight"
                      value={result.fullName || 'Candidate Name'}
                      onChange={(e) => setResult({ ...result, fullName: e.target.value })}
                    />
                    <input
                      type="text"
                      className="text-xs bg-transparent text-slate-400 print:text-slate-700 outline-none w-full font-mono"
                      value={result.contactInfo || 'City, State | email@domain.com | LinkedIn'}
                      onChange={(e) => setResult({ ...result, contactInfo: e.target.value })}
                    />
                  </div>

                  {/* Summary */}
                  <div className="space-y-2">
                    <h4 className="font-serif italic text-amber-300/90 print:text-slate-900 text-sm font-normal">
                      Professional Summary
                    </h4>
                    <textarea
                      className="w-full bg-slate-950/60 print:bg-transparent p-3 rounded-xl border border-slate-800/80 print:border-none text-xs leading-relaxed text-slate-300 print:text-black outline-none resize-y"
                      rows={3}
                      value={result.summary}
                      onChange={(e) => setResult({ ...result, summary: e.target.value })}
                    />
                  </div>

                  {/* Skills */}
                  {result.skills?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-serif italic text-amber-300/90 print:text-slate-900 text-sm font-normal">
                        Technical & Strategic Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.skills.map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="bg-slate-950 print:bg-slate-100 text-slate-300 print:text-slate-900 border border-slate-800 print:border-slate-300 px-3 py-1 rounded-md text-xs font-mono"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Professional Experience */}
                  {result.experience?.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-serif italic text-amber-300/90 print:text-slate-900 text-sm font-normal">
                        Professional Experience
                      </h4>
                      {result.experience.map((exp: any, expIdx: number) => (
                        <div key={expIdx} className="space-y-2 bg-slate-950/40 print:bg-transparent p-4 rounded-xl border border-slate-800/50 print:border-none">
                          <div className="flex justify-between items-baseline gap-2 border-b border-slate-800/50 print:border-slate-200 pb-1">
                            <input
                              type="text"
                              className="font-bold text-slate-100 print:text-black bg-transparent outline-none text-xs w-2/3"
                              value={`${exp.role} — ${exp.company}`}
                              onChange={(e) => {
                                const updatedExp = [...result.experience];
                                const parts = e.target.value.split('—');
                                updatedExp[expIdx].role = parts[0]?.trim() || '';
                                updatedExp[expIdx].company = parts[1]?.trim() || '';
                                setResult({ ...result, experience: updatedExp });
                              }}
                            />
                            <input
                              type="text"
                              className="text-[11px] font-mono text-slate-400 print:text-slate-600 bg-transparent outline-none text-right w-1/3"
                              value={exp.dates}
                              onChange={(e) => {
                                const updatedExp = [...result.experience];
                                updatedExp[expIdx].dates = e.target.value;
                                setResult({ ...result, experience: updatedExp });
                              }}
                            />
                          </div>
                          <ul className="space-y-2 pt-1">
                            {exp.bullets?.map((bullet: string, bIdx: number) => (
                              <li key={bIdx} className="flex gap-2">
                                <span className="text-amber-400 print:text-black font-bold">•</span>
                                <textarea
                                  className="w-full bg-transparent text-xs leading-relaxed text-slate-300 print:text-black outline-none resize-y"
                                  rows={2}
                                  value={bullet}
                                  onChange={(e) => {
                                    const updatedExp = [...result.experience];
                                    updatedExp[expIdx].bullets[bIdx] = e.target.value;
                                    setResult({ ...result, experience: updatedExp });
                                  }}
                                />
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
      </div>

      {/* Subscription Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-2xl font-serif text-white font-bold">Free Trial Completed</h3>
              <p className="text-xs text-slate-400">
                You've used your 3 free resume generations. Upgrade to Hired.ai Pro to get unlimited credits and tailored optimizations.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-white text-sm">Pro Subscription</span>
                <span className="text-amber-400 font-bold text-lg">$12/mo</span>
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                <li>Unlimited AI Resume Matches</li>
                <li>Unlimited Custom Builds & AI Polish</li>
                <li>Instant PDF Exporting</li>
              </ul>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => alert('Redirecting to Stripe Checkout...')}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3 rounded-xl transition text-xs tracking-wider uppercase"
              >
                Upgrade to Pro
              </button>
              <button
                onClick={() => setShowPaywall(false)}
                className="text-xs text-slate-500 hover:text-slate-300 font-mono"
              >
                Close preview
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}