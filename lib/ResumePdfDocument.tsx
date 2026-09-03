import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  contact: { fontSize: 9, color: '#555', marginBottom: 12 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    borderBottom: '1px solid #333',
    paddingBottom: 2,
  },
  text: { marginBottom: 4, lineHeight: 1.4 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  skill: {
    fontSize: 9,
    border: '1px solid #999',
    borderRadius: 3,
    padding: '2 5',
    marginRight: 4,
    marginBottom: 4,
  },
  expRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  expTitle: { fontWeight: 'bold' },
  expDates: { fontSize: 9, color: '#555' },
  bullet: { marginLeft: 10, marginBottom: 2 },
});

export function ResumePdfDocument({ result }: { result: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{result.fullName || 'Candidate Name'}</Text>
        <Text style={styles.contact}>{result.contactInfo || ''}</Text>

        {result.summary && (
          <>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.text}>{result.summary}</Text>
          </>
        )}

        {result.skills?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Core Competencies</Text>
            <View style={styles.skillsRow}>
              {result.skills.map((s: string, i: number) => (
                <Text key={i} style={styles.skill}>{s}</Text>
              ))}
            </View>
          </>
        )}

        {result.experience?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {result.experience.map((exp: any, i: number) => (
              <View key={i}>
                <View style={styles.expRow}>
                  <Text style={styles.expTitle}>
                    {exp.role} {exp.company ? `— ${exp.company}` : ''}
                  </Text>
                  <Text style={styles.expDates}>{exp.dates}</Text>
                </View>
                {(exp.bullets || []).map((b: string, bi: number) => (
                  <Text key={bi} style={styles.bullet}>• {b}</Text>
                ))}
              </View>
            ))}
          </>
        )}

        {result.education?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Education</Text>
            {result.education.map((edu: any, i: number) => (
              <View key={i} style={styles.expRow}>
                <Text style={styles.expTitle}>
                  {edu.degree} — {edu.institution}
                </Text>
                <Text style={styles.expDates}>{edu.dates}</Text>
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  );
}
