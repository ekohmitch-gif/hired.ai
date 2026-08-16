'use client';

import { useState } from 'react';

export default function Home() {
const [resumeText, setResumeText] = useState('');
const [jobDescription, setJobDescription] = useState('');
const [loading, setLoading] = useState(false);
const [parsing, setParsing] = useState(false);
const [fileName, setFileName] = useState('');
const [result, setResult] = useState<any>(null);

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

const handleGenerate = async () => {
if (!resumeText || !jobDescription) {
alert('Please upload a resume and provide a target job description.');
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
} catch (err: any) {
alert(err.message || 'Something went wrong');
} finally {
setLoading(false);
}
};

const handlePrint = () => {
window.print();
};

return (
<main className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans p-4 md:p-12 print:bg-white print:text-black print:p-0">
<div className="max-w-7xl mx-auto space-y-10">

{/* Clean Modern Header */}
<header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800/80 pb-8 gap-4 print:hidden">
<div>
<h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-white">
Hired<span className="text-amber-400">.ai</span>
</h1>
</div>
<p className="text-slate-400 text-xs sm:text-right max-w-xs font-light leading-relaxed">
AI resume alignment for your target roles.
</p>
</header>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">

{/* Left Inputs Column */}
<div className="lg:col-span-5 space-y-6 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-6 md:p-8 rounded-2xl shadow-2xl print:hidden">

{/* 1. Resume Input */}
<div className="space-y-2">
<div className="flex justify-between items-center">
<label className="text-xs uppercase tracking-[0.15em] font-medium text-slate-300">
01. Current Resume
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
<label htmlFor="resume-upload" className="cursor-pointer text-xs text-slate-400 flex flex-col items-center gap-1.5">
<span className="font-medium text-slate-200 hover:text-amber-300 transition">
Upload Resume (PDF / DOCX)
</span>
<span className="text-[11px] text-slate-500 font-light">or paste text below</span>
</label>
</div>

<textarea
className="w-full h-32 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl focus:border-amber-400/50 outline-none text-xs text-slate-300 font-mono transition resize-none"
placeholder={parsing ? 'Extracting text...' : 'Paste current resume text...'}
value={resumeText}
onChange={(e) => setResumeText(e.target.value)}
/>
</div>

{/* 2. Job Description Input */}
<div className="space-y-2">
<label className="block text-xs uppercase tracking-[0.15em] font-medium text-slate-300">
02. Target Job Description
</label>
<textarea
className="w-full h-32 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl focus:border-amber-400/50 outline-none text-xs text-slate-300 font-mono transition resize-none"
placeholder="Paste the job description or target role requirements here..."
value={jobDescription}
onChange={(e) => setJobDescription(e.target.value)}
/>
</div>

<button
onClick={handleGenerate}
disabled={loading || parsing}
className="w-full bg-slate-100 hover:bg-white text-slate-950 font-semibold py-3.5 rounded-xl transition duration-200 shadow-xl disabled:opacity-40 text-xs tracking-wider uppercase"
>
{loading ? 'Optimizing...' : 'Generate Resume'}
</button>
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
onClick={handlePrint}
className="bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-medium px-4 py-2 rounded-lg transition"
>
Export PDF
</button>
)}
</div>

{!result && !loading && (
<div className="h-72 flex flex-col items-center justify-center text-slate-500 text-xs text-center font-light space-y-2">
<p className="font-serif text-lg text-slate-400 italic">Ready to Generate</p>
<p className="max-w-xs text-slate-500">Provide your resume and target job description on the left to start.</p>
</div>
)}

{loading && (
<div className="h-72 flex flex-col items-center justify-center space-y-4">
<div className="w-8 h-8 border-2 border-amber-400/80 border-t-transparent rounded-full animate-spin"></div>
<p className="text-xs text-amber-300/80 font-mono tracking-wider uppercase animate-pulse">
Tailoring experience & keywords...
</p>
</div>
)}

{result && (
<div className="space-y-6 text-xs text-slate-200 print:text-black">
{/* Name Header */}
<div className="border-b border-slate-800 print:border-black pb-4">
<input
type="text"
className="text-2xl md:text-3xl font-serif font-normal bg-transparent text-white print:text-black outline-none w-full tracking-tight"
value={result.fullName || 'Candidate Name'}
onChange={(e) => setResult({ ...result, fullName: e.target.value })}
/>
</div>

{/* Summary Section */}
<div className="space-y-2">
<h4 className="font-serif italic text-amber-300/90 print:text-slate-900 text-sm font-normal">
Professional Summary
</h4>
<textarea
className="w-full bg-slate-950/60 print:bg-transparent p-4 rounded-xl border border-slate-800/80 print:border-none text-xs leading-relaxed text-slate-300 print:text-black outline-none resize-y"
rows={3}
value={result.summary}
onChange={(e) => setResult({ ...result, summary: e.target.value })}
/>
</div>

{/* Skills Section */}
<div className="space-y-2">
<h4 className="font-serif italic text-amber-300/90 print:text-slate-900 text-sm font-normal">
Matched Skills
</h4>
<div className="flex flex-wrap gap-2">
{result.skills?.map((skill: string, i: number) => (
<span
key={i}
className="bg-slate-950 print:bg-slate-100 text-slate-300 print:text-slate-900 border border-slate-800 print:border-slate-300 px-3 py-1 rounded-md text-xs font-mono"
>
{skill}
</span>
))}
</div>
</div>

{/* Bullet Points Section */}
<div className="space-y-2">
<h4 className="font-serif italic text-amber-300/90 print:text-slate-900 text-sm font-normal">
Tailored Highlights
</h4>
<ul className="space-y-2.5">
{result.bulletPoints?.map((bullet: string, i: number) => (
<li key={i} className="flex gap-3 bg-slate-950/40 print:bg-transparent p-3 rounded-xl border border-slate-800/50 print:border-none">
<span className="text-amber-400 print:text-black font-bold">•</span>
<textarea
className="w-full bg-transparent text-xs leading-relaxed text-slate-300 print:text-black outline-none resize-y"
rows={2}
value={bullet}
onChange={(e) => {
const updatedBullets = [...result.bulletPoints];
updatedBullets[i] = e.target.value;
setResult({ ...result, bulletPoints: updatedBullets });
}}
/>
</li>
))}
</ul>
</div>
</div>
)}
</div>
</div>

</div>
</div>
</main>
);
}