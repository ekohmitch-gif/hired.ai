import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 50, fontSize: 10.5, fontFamily: 'Helvetica', lineHeight: 1.5 },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  contact: { fontSize: 9, color: '#555', marginBottom: 20 },
  date: { fontSize: 9.5, color: '#555', marginBottom: 16 },
  paragraph: { marginBottom: 10 },
});

export function CoverLetterPdfDocument({
  fullName,
  contactInfo,
  body,
}: {
  fullName: string;
  contactInfo: string;
  body: string;
}) {
  const paragraphs = (body || '').split(/\n\s*\n/).filter(Boolean);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{fullName || 'Candidate Name'}</Text>
        <Text style={styles.contact}>{contactInfo || ''}</Text>
        <Text style={styles.date}>{today}</Text>
        {paragraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>{p.trim()}</Text>
        ))}
      </Page>
    </Document>
  );
}