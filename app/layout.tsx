import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
subsets: ['latin'],
variable: '--font-serif',
});

const inter = Inter({
subsets: ['latin'],
variable: '--font-sans',
});

export const metadata: Metadata = {
title: 'Hired.ai',
description: 'Hired.ai is a cutting-edge AI-powered resume optimization tool designed to help job seekers enhance their resumes and increase their chances of landing interviews. By leveraging advanced natural language processing and machine learning algorithms, Hired.ai analyzes your resume and tailors it to match specific job descriptions, ensuring that your skills and experiences are presented in the most compelling way possible. With Hired.ai, you can effortlessly transform your resume into a powerful marketing document that stands out to recruiters and hiring managers.',
};

export default function RootLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<html lang="en" className={`${playfair.variable} ${inter.variable}`}>
<body className="font-sans antialiased bg-[#0B0F17] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
{children}
</body>
</html>
);
}