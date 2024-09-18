package org.mskcc.oncokb.curation.test;

import static org.junit.Assert.assertEquals;
import static org.mskcc.oncokb.curation.TestHelper.getTestFileBufferedReader;
import static org.mskcc.oncokb.curation.util.AlterationUtils.parseProteinChange;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.AlterationAnnotationStatus;
import org.mskcc.oncokb.curation.domain.EntityStatus;

@RunWith(Parameterized.class)
public class ParseProteinChangeParameterizedTest {

    private static String TEST_FILE_PATH = "src/test/resources/data/test_parse_protein_change.tsv";

    private String proteinChange;
    private String expectedConsequence;
    private String expectedRefAllele;
    private String expectedVarAllele;
    private String expectedProteinStart;
    private String expectedProteinEnd;

    public ParseProteinChangeParameterizedTest(
        String proteinChange,
        String expectedConsequence,
        String expectedRefAllele,
        String expectedVarAllele,
        String expectedProteinStart,
        String expectedProteinEnd
    ) {
        this.proteinChange = proteinChange;
        this.expectedConsequence = expectedConsequence;
        this.expectedRefAllele = expectedRefAllele;
        this.expectedVarAllele = expectedVarAllele;
        this.expectedProteinStart = expectedProteinStart;
        this.expectedProteinEnd = expectedProteinEnd;
    }

    @Parameterized.Parameters
    public static Collection<String[]> getParameters() throws IOException {
        return importer();
    }

    private static List<String[]> importer() throws IOException {
        BufferedReader buf = getTestFileBufferedReader(TEST_FILE_PATH);
        String line = buf.readLine();

        List<String[]> queries = new ArrayList<>();
        int count = 0;
        while (line != null) {
            if (!line.startsWith("#") && line.trim().length() > 0) {
                try {
                    String parts[] = line.split("\t");
                    if (parts.length < 1) {
                        throw new IllegalArgumentException("Test case should have at least protein change. Current case: " + line);
                    }
                    String proteinChange = parts[0];
                    String expectedConsequence = parts.length > 1 ? parts[1].toUpperCase() : "";
                    String expectedRefAllele = parts.length > 2 ? parts[2] : "";
                    String expectedVarAllele = parts.length > 3 ? parts[3] : "";
                    String expectedProteinStart = parts.length > 4 ? parts[4] : "";
                    String expectedProteinEnd = parts.length > 5 ? parts[5] : "";
                    String[] query = {
                        proteinChange,
                        expectedConsequence,
                        expectedRefAllele,
                        expectedVarAllele,
                        expectedProteinStart,
                        expectedProteinEnd,
                    };
                    queries.add(query);
                    count++;
                } catch (Exception e) {
                    System.err.println("Could not add line '" + line + "'. " + e);
                }
            }
            line = buf.readLine();
        }
        System.err.println("Contains " + count + " queries.");
        System.err.println("Done.");

        return queries;
    }

    private void testSuite(
        Alteration annotatedAlteration,
        String proteinChange,
        String expectedConsequence,
        String expectedRefAllele,
        String expectedVarAllele,
        String expectedProteinStart,
        String expectedProteinEnd
    ) {
        assertEquals(
            "Not expected consequence. Query: " + proteinChange,
            expectedConsequence,
            annotatedAlteration.getConsequence() == null ? "" : annotatedAlteration.getConsequence().getTerm()
        );
        assertEquals(
            "Not expected ref allele. Query: " + proteinChange,
            expectedRefAllele,
            StringUtils.isEmpty(annotatedAlteration.getRefResidues()) ? "" : annotatedAlteration.getRefResidues()
        );
        assertEquals(
            "Not expected var allele. Query: " + proteinChange,
            expectedVarAllele,
            StringUtils.isEmpty(annotatedAlteration.getVariantResidues()) ? "" : annotatedAlteration.getVariantResidues()
        );
        assertEquals(
            "Not expected protein start. Query: " + proteinChange,
            expectedProteinStart,
            annotatedAlteration.getStart() == null ? "" : Integer.toString(annotatedAlteration.getStart())
        );
        assertEquals(
            "Not expected protein end. Query: " + proteinChange,
            expectedProteinEnd,
            annotatedAlteration.getEnd() == null ? "" : Integer.toString(annotatedAlteration.getEnd())
        );
    }

    @Test
    public void testSummary() {
        EntityStatus<Alteration> alterationEntityStatus = new AlterationAnnotationStatus();
        parseProteinChange(alterationEntityStatus, proteinChange);
        testSuite(
            alterationEntityStatus.getEntity(),
            proteinChange,
            expectedConsequence,
            expectedRefAllele,
            expectedVarAllele,
            expectedProteinStart,
            expectedProteinEnd
        );
    }
}
