import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export type ResumeTemplate = 'classic' | 'modern' | 'minimal';

function getStyles(template: ResumeTemplate) {
  if (template === 'modern') {
    return StyleSheet.create({
      page: { padding: 0, fontSize: 10, fontFamily: 'Helvetica' },
      headerBar: { backgroundColor: '#1e293b', padding: 28, paddingBottom: 20 },
      name: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 3 },
      contact: { fontSize: 9, color: '#cbd5e1' },
      body: { padding: 28, paddingTop: 18 },
      sectionTitle: {
        fontSize: 10.5,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 5,
        textTransform: 'uppercase',
        color: '#1e293b',
        borderLeft: '3px solid #1e293b',
        paddingLeft: 6,
      },
      text: { marginBottom: 4, lineHeight: 1.4 },
      skillsText: { fontSize: 9.5, color: '#334155', lineHeight: 1.6 },
      expRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7 },
      expTitle: { fontWeight: 'bold', color: '#1e293b' },
      expDates: { fontSize: 9, color: '#64748b' },
      bullet: { marginLeft: 10, marginBottom: 2 },
    });
  }

  if (template === 'minimal') {
    return StyleSheet.create({
      page: { padding: 44, fontSize: 9.5, fontFamily: 'Helvetica' },
      headerBar: {},
      name: { fontSize: 18, fontWeight: 'normal', letterSpacing: 1, marginBottom: 2 },
      contact: { fontSize: 8.5, color: '#666', marginBottom: 16 },
      body: {},
      sectionTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        marginTop: 14,
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        color: '#333',
      },
      text: { marginBottom: 4, lineHeight: 1.5, color: '#333' },
      skillsText: { fontSize: 9, color: '#555', lineHeight: 1.6 },
      expRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
      expTitle: { fontWeight: 'bold' },
      expDates: { fontSize: 8.5, color: '#888' },
      bullet: { marginLeft: 8, marginBottom: 2, color: '#333' },
    });
  }

  // classic (default)
  return StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica' },
    headerBar: {},
    name: { fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
    contact: { fontSize: 9, color: '#555', marginBottom: 12 },
    body: {},
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
    skillsText: { fontSize: 9.5, color: '#333', lineHeight: 1.6 },
    expRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    expTitle: { fontWeight: 'bold' },
    expDates: { fontSize: 9, color: '#555' },
    bullet: { marginLeft: 10, marginBottom: 2 },
  });
}

export function ResumePdfDocument({
  result,
  template = 'classic',
}: {
  result: any;
  template?: ResumeTemplate;
}) {
  const s = getStyles(template);
  const headerContent = (
    <>
      <Text style={s.name}>{result.fullName || 'Candidate Name'}</Text>
      <Text style={s.contact}>{result.contactInfo || ''}</Text>
    </>
  );

  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        {template === 'modern' ? (
          <View style={s.headerBar}>{headerContent}</View>
        ) : (
          <View style={{ padding: template === 'minimal' ? 0 : 0 }}>{headerContent}</View>
        )}

        <View style={s.body}>
          {result.summary && (
            <>
              <Text style={s.sectionTitle}>Professional Summary</Text>
              <Text style={s.text}>{result.summary}</Text>
            </>
          )}

          {result.skills?.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Core Competencies</Text>
              <Text style={s.skillsText}>{result.skills.join('   •   ')}</Text>
            </>
          )}

          {result.experience?.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Professional Experience</Text>
              {result.experience.map((exp: any, i: number) => (
                <View key={i}>
                  <View style={s.expRow}>
                    <Text style={s.expTitle}>
                      {exp.role} {exp.company ? `— ${exp.company}` : ''}
                    </Text>
                    <Text style={s.expDates}>{exp.dates}</Text>
                  </View>
                  {(exp.bullets || []).map((b: string, bi: number) => (
                    <Text key={bi} style={s.bullet}>• {b}</Text>
                  ))}
                </View>
              ))}
            </>
          )}

          {result.projects?.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Projects</Text>
              {result.projects.map((proj: any, i: number) => (
                <View key={i}>
                  <View style={s.expRow}>
                    <Text style={s.expTitle}>
                      {proj.title} {proj.role ? `— ${proj.role}` : ''}
                    </Text>
                  </View>
                  {proj.description && <Text style={s.text}>{proj.description}</Text>}
                </View>
              ))}
            </>
          )}

          {result.education?.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Education</Text>
              {result.education.map((edu: any, i: number) => (
                <View key={i} style={s.expRow}>
                  <Text style={s.expTitle}>
                    {edu.degree} — {edu.institution}
                  </Text>
                  <Text style={s.expDates}>{edu.dates}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </Page>
    </Document>
  );
}