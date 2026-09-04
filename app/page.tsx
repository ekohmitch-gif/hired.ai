'use client';

import { useState, useRef, useEffect } from 'react';
import { SignInButton, UserButton, useUser, useClerk, ClerkLoaded } from '@clerk/nextjs';

interface ExperienceItem {
  role: string;
  company: string;
  dates: string;
  bullets: string[];
}

export default function Home() {
  const { user, isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const [activeTab, setActiveTab] = useState<'match' | 'build'>('match');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [rezPoints, setRezPoints] = useState<number>(3);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [parsing, setParsing] = useState(false);
  const [fileKey, setFileKey] = useState<number>(Date.now());

  const [targetRole, setTargetRole] = useState<string>('');
  const [refiningSummary, setRefiningSummary] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<'pdf' | 'docx' | null>(null);
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

  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSavedPanel, setShowSavedPanel] = useState(false);

  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [showTrackerPanel, setShowTrackerPanel] = useState(false);
  const [newApp, setNewApp] = useState({ company: '', jobLink: '', resumeId: '' });
  const [addingApp, setAddingApp] = useState(false);

  // Sync credit badge from the server (applies weekly reset if due)
  useEffect(() => {
    if (!isSignedIn) return;
    (async () => {
      try {
        const res = await fetch('/api/credits');
        if (!res.ok) return;
        const data = await res.json();
        setIsSubscribed(data.isPro === true);
        setRezPoints(typeof data.credits === 'number' ? data.credits : 3);
      } catch {
        // silent fail, badge just won't update this load
      }
    })();
  }, [isSignedIn]);

  const fetchApplications = async () => {
    setLoadingApplications(true);
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
      } else if (res.status !== 403) {
        alert(data.error || 'Failed to load applications');
      }
    } catch {
      // silent
    } finally {
      setLoadingApplications(false);
    }
  };

  const handleToggleTrackerPanel = () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    const next = !showTrackerPanel;
    setShowTrackerPanel(next);
    if (next) {
      fetchApplications();
      if (savedResumes.length === 0) fetchSavedResumes();
    }
  };

  const handleAddApplication = async () => {
    if (!newApp.company && !newApp.jobLink) {
      return alert('Add at least a company or job link.');
    }
    setAddingApp(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: newApp.company,
          jobLink: newApp.jobLink,
          resumeId: newApp.resumeId || null,
          status: 'applied',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to add application');
        return;
      }
      setApplications((prev) => [data.application, ...prev]);
      setNewApp({ company: '', jobLink: '', resumeId: '' });
    } catch {
      alert('Failed to add application');
    } finally {
      setAddingApp(false);
    }
  };

  const handleUpdateApplicationStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setApplications((prev) => prev.map((a) => (a.id === id ? data.application : a)));
      }
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!window.confirm('Delete this application record?')) return;
    try {
      const res = await fetch(`/api/applications?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      alert('Failed to delete application');
    }
  };

  const fetchSavedResumes = async () => {
    if (!isSignedIn) return;
    setLoadingSaved(true);
    try {
      const res = await fetch('/api/resumes');
      const data = await res.json();
      if (res.ok) setSavedResumes(data.resumes || []);
    } catch {
      // silent
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleToggleSavedPanel = () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    const next = !showSavedPanel;
    setShowSavedPanel(next);
    if (next) fetchSavedResumes();
  };

  const handleSaveResume = async () => {
    if (!result) return;
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    const title = window.prompt(
      'Name this resume (e.g. "Main Resume" or "SWE – Google"):',
      result.targetRoleTitle || result.fullName || 'My Resume'
    );
    if (!title) return;

    setSaving(true);
    try {
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, data: result }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to save resume');
        return;
      }
      setSavedResumes((prev) => [data.resume, ...prev]);
      alert('Resume saved!');
    } catch {
      alert('Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSavedResume = (resume: any) => {
    setResult(resume.data);
    setShowSavedPanel(false);
  };

  const handleDeleteSavedResume = async (id: string) => {
    if (!window.confirm('Delete this saved resume? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/resumes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedResumes((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      alert('Failed to delete resume');
    }
  };

  const handleStripeCheckout = async () => {
    if (!isSignedIn) return openSignIn();
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

  // Generation is free and open to everyone — no sign-in required
  const handleGenerateMatch = async () => {
    if (!resumeText || !jobDescription) return alert('Provide resume and job description.');
    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Something went wrong');
        return;
      }
      setResult(data);
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

  // Building the preview is free too — no gating
  const handleCompileBuild = () => {
    const skillsArray = buildForm.skills ? buildForm.skills.split(',').map((s) => s.trim()) : [];
    const contactParts = [buildForm.location, buildForm.email, buildForm.phone, buildForm.linkedin].filter(Boolean);
    setResult({
      fullName: buildForm.fullName || 'Candidate Name',
      contactInfo: contactParts.join(' | ') || 'Location | Email | Phone',
      summary: buildForm.summary || 'Professional summary...',
      skills: skillsArray,
      experience: buildForm.experience,
    });
  };

  // Download is the paywall moment: requires sign-in, then spends a weekly credit
  const handleExport = async (format: 'pdf' | 'docx') => {
    if (!result) return;

    if (!isSignedIn) {
      openSignIn();
      return;
    }

    setExportingFormat(format);
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, format }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Export failed');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(result.fullName || 'resume').replace(/\s+/g, '_')}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Reflect the spend locally right away; server is the real source of truth
      if (!isSubscribed) {
        setRezPoints((prev) => Math.max(0, prev - 1));
      }
    } catch {
      alert('Export failed');
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans p-6 print:bg-white print:text-black print:p-0">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header Navigation */}
        <header className="flex justify-between items-center border-b border-slate-800 pb-4 print:hidden">
          <h1 className="text-2xl font-bold font-serif text-white">
            Enhancerez<span className="text-amber-400">.com</span>
          </h1>
          <div className="flex items-center gap-3">
            {isSignedIn && (
              isSubscribed ? (
                <span className="text-xs font-mono text-emerald-400 border border-emerald-800/50 bg-emerald-950/40 px-3 py-1 rounded-full">
                  ∞ Unlimited Downloads
                </span>
              ) : (
                <span className="text-xs font-mono text-amber-400 border border-slate-800 bg-slate-900 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  {rezPoints} downloads left this week
                </span>
              )
            )}
            <button
              onClick={handleToggleTrackerPanel}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 transition"
            >
              Job Tracker
            </button>
            <button
              onClick={handleToggleSavedPanel}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-800 transition"
            >
              My Resumes
            </button>
            <button
              onClick={handleStripeCheckout}
              disabled={checkoutLoading}
              className="bg-amber-400 text-slate-950 font-semibold px-3.5 py-1.5 rounded-lg text-xs hover:bg-amber-300 transition shadow"
            >
              Get 7 days free
            </button>
            <ClerkLoaded>
              {!isSignedIn ? <SignInButton mode="modal" /> : <UserButton />}
            </ClerkLoaded>
          </div>
        </header>

        {/* Welcome Section */}
        <div className="space-y-1 print:hidden">
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Welcome, {isSignedIn && user?.firstName ? user.firstName : 'there'}!
          </h2>
          <p className="text-xs text-slate-400">
            Drop in your resume and a job description to get your Match Rate in about 30 seconds. Free to build and preview — sign in when you're ready to download.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-3 print:hidden">
          <button
            onClick={() => setActiveTab('match')}
            className={`text-xs uppercase px-3.5 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'match' ? 'bg-slate-800 text-amber-400 border border-amber-400/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            New Scan
          </button>
          <button
            onClick={() => setActiveTab('build')}
            className={`text-xs uppercase px-3.5 py-1.5 rounded-lg transition font-medium ${
              activeTab === 'build' ? 'bg-slate-800 text-amber-400 border border-amber-400/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Builder
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
          <div className="lg:col-span-5 space-y-4 bg-slate-900/40 p-5 rounded-xl border border-slate-800 print:hidden">
            {activeTab === 'match' ? (
              <div className="space-y-4">
                {/* Step 1: Resume Upload */}
                <div className="space-y-2 border border-slate-800 p-3.5 rounded-xl bg-slate-950/50">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 text-[11px] font-bold flex items-center justify-center">1</span>
                    <label className="text-xs uppercase text-slate-300 font-semibold">Upload a resume</label>
                  </div>
                  <input
                    key={fileKey}
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800"
                  />
                  <textarea
                    className="w-full h-20 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono resize-none outline-none focus:border-amber-400/50"
                    placeholder="Or paste resume text here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>

                {/* Step 2: Job Description */}
                <div className="space-y-2 border border-slate-800 p-3.5 rounded-xl bg-slate-950/50">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 text-[11px] font-bold flex items-center justify-center">2</span>
                    <label className="text-xs uppercase text-slate-300 font-semibold">Paste a job description</label>
                  </div>
                  <textarea
                    className="w-full h-28 p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 font-mono resize-none outline-none focus:border-amber-400/50"
                    placeholder="Copy and paste job description here. Aim to exclude Benefits, Perks, and Legal Disclaimers."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleGenerateMatch}
                  disabled={loading || parsing}
                  className="w-full bg-amber-400 text-slate-950 font-bold py-3 rounded-lg text-xs uppercase hover:bg-amber-300 transition shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2"
                >
                  {loading ? 'Analyzing...' : 'Scan Resume — Free'}
                </button>
              </div>
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

          {/* Right Live Preview Panel */}
          <div className="lg:col-span-7 bg-slate-900/40 p-6 rounded-xl border border-slate-800 print:bg-white print:border-none print:p-0">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4 print:hidden">
              <span className="text-xs uppercase text-slate-400">Live Preview</span>
              {result && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveResume}
                    disabled={saving}
                    className="bg-slate-800 text-slate-200 text-xs font-semibold px-3 py-1 rounded hover:bg-slate-700 transition border border-slate-700 disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : '💾 Save'}
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={exportingFormat !== null}
                    className="bg-amber-400 text-slate-950 text-xs font-semibold px-3 py-1 rounded hover:bg-amber-300 transition disabled:opacity-60"
                  >
                    {exportingFormat === 'pdf' ? 'Preparing...' : isSignedIn ? 'Download PDF' : 'Sign in to Download'}
                  </button>
                  <button
                    onClick={() => handleExport('docx')}
                    disabled={exportingFormat !== null}
                    className="bg-slate-800 text-slate-200 text-xs font-semibold px-3 py-1 rounded hover:bg-slate-700 transition border border-slate-700 disabled:opacity-60"
                  >
                    {exportingFormat === 'docx' ? 'Preparing...' : isSignedIn ? 'Download DOCX' : 'Sign in to Download'}
                  </button>
                </div>
              )}
            </div>

            {!result ? (
              <div className="h-40 flex items-center justify-center text-slate-500 text-xs italic">
                Ready to generate document...
              </div>
            ) : (
              <div className="space-y-6">
                {/* ATS Optimization Match Box */}
                {(result.matchScore !== undefined || result.hardSkills || result.softSkills) && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4 print:hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-white">ATS Optimization Match</h3>
                        <p className="text-[11px] text-slate-400">Keyword & Structure Analysis</p>
                      </div>
                      {result.matchScore !== undefined && (
                        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                          <span className="text-xs text-slate-400 uppercase font-mono">Match Score:</span>
                          <span className={`text-base font-bold font-mono ${
                            result.matchScore >= 80 ? 'text-emerald-400' : result.matchScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {result.matchScore}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.hardSkills && (
                        <div className="space-y-2">
                          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Hard Skills</span>
                          <div className="flex flex-wrap gap-1.5">
                            {result.hardSkills.matched?.map((skill: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                                ✓ {skill}
                              </span>
                            ))}
                            {result.hardSkills.missing?.map((skill: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-rose-950/80 text-rose-300 border border-rose-800/60">
                                ✕ {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {result.softSkills && (
                        <div className="space-y-2">
                          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Soft Skills</span>
                          <div className="flex flex-wrap gap-1.5">
                            {result.softSkills.matched?.map((skill: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                                ✓ {skill}
                              </span>
                            ))}
                            {result.softSkills.missing?.map((skill: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-rose-950/80 text-rose-300 border border-rose-800/60">
                                ✕ {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {result.recruiterChecks && (
                      <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span className={result.recruiterChecks.hasMeasurableResults ? 'text-emerald-400' : 'text-rose-400'}>
                            {result.recruiterChecks.hasMeasurableResults ? '✓' : '✕'}
                          </span>
                          <span>Measurable Metrics</span>
                        </div>
                        {result.recruiterChecks.wordCountCheck && (
                          <div className="text-slate-300">
                            <span className="text-slate-500">Length: </span>
                            {result.recruiterChecks.wordCountCheck}
                          </div>
                        )}
                        {result.recruiterChecks.formattingAlerts?.length > 0 && (
                          <div className="text-amber-400">
                            ⚠ {result.recruiterChecks.formattingAlerts[0]}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Resume Output Panel */}
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
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Job Tracker Overlay Panel — premium only */}
      {showTrackerPanel && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6 print:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Job Application Tracker</h3>
              <button
                onClick={() => setShowTrackerPanel(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            {!isSubscribed ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm text-slate-300">
                  Job Application Tracking is a premium feature.
                </p>
                <p className="text-xs text-slate-500">
                  Track which resume you sent, the job link, company, and whether you heard back — all in one place.
                </p>
                <button
                  onClick={() => {
                    setShowTrackerPanel(false);
                    handleStripeCheckout();
                  }}
                  className="bg-amber-400 text-slate-950 font-semibold text-xs px-4 py-2 rounded-lg hover:bg-amber-300 transition"
                >
                  Upgrade to unlock
                </button>
              </div>
            ) : (
              <>
                {/* Add new application form */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <p className="text-[11px] uppercase text-slate-400 font-semibold">Add Application</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Company"
                      className="p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white outline-none"
                      value={newApp.company}
                      onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Job Link"
                      className="p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white outline-none"
                      value={newApp.jobLink}
                      onChange={(e) => setNewApp({ ...newApp, jobLink: e.target.value })}
                    />
                  </div>
                  <select
                    className="w-full p-2 bg-slate-900 border border-slate-800 rounded text-xs text-white outline-none"
                    value={newApp.resumeId}
                    onChange={(e) => setNewApp({ ...newApp, resumeId: e.target.value })}
                  >
                    <option value="">No resume linked</option>
                    {savedResumes.map((r) => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddApplication}
                    disabled={addingApp}
                    className="w-full bg-amber-400 text-slate-950 font-semibold text-xs py-2 rounded hover:bg-amber-300 transition disabled:opacity-60"
                  >
                    {addingApp ? 'Adding...' : '+ Add Application'}
                  </button>
                </div>

                {/* List */}
                {loadingApplications ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">Loading...</p>
                ) : applications.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-6 text-center">
                    No applications tracked yet — add one above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                              {app.company || 'Untitled Application'}
                            </p>
                            {app.job_link && (
                              <a
                                href={app.job_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-amber-400 hover:underline truncate block"
                              >
                                {app.job_link}
                              </a>
                            )}
                            {app.resume_title && (
                              <p className="text-[10px] text-slate-500">Resume: {app.resume_title}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteApplication(app.id)}
                            className="text-[10px] text-rose-400 hover:text-rose-300 shrink-0"
                          >
                            Delete
                          </button>
                        </div>
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                          className="text-[10px] bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 outline-none"
                        >
                          <option value="applied">Applied</option>
                          <option value="responded">Responded</option>
                          <option value="interview">Interview</option>
                          <option value="rejected">Rejected</option>
                          <option value="offer">Offer</option>
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Saved Resumes Overlay Panel */}
      {showSavedPanel && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6 print:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-5 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">My Saved Resumes</h3>
              <button
                onClick={() => setShowSavedPanel(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            {loadingSaved ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">Loading...</p>
            ) : savedResumes.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6 text-center">
                No saved resumes yet. Generate one and hit "Save" to keep it here.
              </p>
            ) : (
              <div className="space-y-2">
                {savedResumes.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{r.title}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(r.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 ml-3">
                      <button
                        onClick={() => handleLoadSavedResume(r)}
                        className="text-[10px] bg-amber-400 text-slate-950 font-semibold px-2.5 py-1 rounded hover:bg-amber-300 transition"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteSavedResume(r.id)}
                        className="text-[10px] text-rose-400 hover:text-rose-300 px-2 py-1"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}