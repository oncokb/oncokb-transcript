package org.mskcc.oncokb.transcript.repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.sql.DataSource;
import org.mskcc.oncokb.transcript.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.transcript.domain.enumeration.SequenceType;
import org.mskcc.oncokb.transcript.vm.CanonicalProteinSequenceVM;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * Plain JDBC lookup for canonical protein sequences.
 *
 * The JPA/ORM path (EnsemblGene -> Transcript -> TranscriptDTO -> Sequence) issues four queries per
 * gene, one of which loads every genome fragment of the transcript only to throw it away. This
 * repository resolves any number of genes with a single joined statement.
 */
@Repository
public class CanonicalSequenceJdbcRepository {

    private static final String FIND_CANONICAL_SEQUENCES_SQL =
        "SELECT g.entrez_gene_id AS entrez_gene_id, " +
        "       t.ensembl_transcript_id AS ensembl_transcript_id, " +
        "       s.sequence AS sequence " +
        "FROM sequence s " +
        "JOIN transcript t ON t.id = s.transcript_id " +
        "JOIN ensembl_gene eg ON eg.id = t.ensembl_gene_id " +
        "JOIN gene g ON g.id = eg.gene_id " +
        "WHERE s.sequence_type = :sequenceType " +
        "  AND t.canonical = TRUE " +
        "  AND eg.canonical = TRUE " +
        "  AND eg.reference_genome = :referenceGenome " +
        "  AND g.entrez_gene_id IN (:entrezGeneIds)";

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public CanonicalSequenceJdbcRepository(DataSource dataSource) {
        this.jdbcTemplate = new NamedParameterJdbcTemplate(dataSource);
    }

    /**
     * Find the canonical protein sequence for each entrez gene id.
     *
     * @return the sequences, one per requested gene id and in the requested order. Genes without a
     *         canonical protein sequence are omitted, matching the ORM based endpoint.
     */
    public List<CanonicalProteinSequenceVM> findCanonicalProteinSequences(ReferenceGenome referenceGenome, List<Integer> entrezGeneIds) {
        if (entrezGeneIds == null || entrezGeneIds.isEmpty()) {
            return new ArrayList<>();
        }

        MapSqlParameterSource parameters = new MapSqlParameterSource()
            .addValue("sequenceType", SequenceType.PROTEIN.name())
            .addValue("referenceGenome", referenceGenome.name())
            .addValue("entrezGeneIds", entrezGeneIds);

        Map<Integer, CanonicalProteinSequenceVM> sequenceByEntrezGeneId = new HashMap<>();
        jdbcTemplate.query(
            FIND_CANONICAL_SEQUENCES_SQL,
            parameters,
            resultSet -> {
                int entrezGeneId = resultSet.getInt("entrez_gene_id");
                if (sequenceByEntrezGeneId.containsKey(entrezGeneId)) {
                    // The ORM based endpoint returns a single sequence per gene, keep the same contract
                    return;
                }

                CanonicalProteinSequenceVM proteinSequence = new CanonicalProteinSequenceVM();
                proteinSequence.setEntrezGeneId(entrezGeneId);
                proteinSequence.setEnsemblTranscriptId(resultSet.getString("ensembl_transcript_id"));
                proteinSequence.setSequence(resultSet.getString("sequence"));

                sequenceByEntrezGeneId.put(entrezGeneId, proteinSequence);
            }
        );

        // One entry per requested gene id, in the requested order. A gene id repeated in the request
        // is repeated in the response, which is what the ORM based endpoint does.
        List<CanonicalProteinSequenceVM> sequences = new ArrayList<>();
        for (Integer entrezGeneId : entrezGeneIds) {
            CanonicalProteinSequenceVM proteinSequence = sequenceByEntrezGeneId.get(entrezGeneId);
            if (proteinSequence != null) {
                sequences.add(proteinSequence);
            }
        }
        return sequences;
    }

    public CanonicalProteinSequenceVM findCanonicalProteinSequence(ReferenceGenome referenceGenome, Integer entrezGeneId) {
        List<CanonicalProteinSequenceVM> sequences = findCanonicalProteinSequences(
            referenceGenome,
            Collections.singletonList(entrezGeneId)
        );
        return sequences.isEmpty() ? null : sequences.get(0);
    }
}
