package org.mskcc.cbio.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.cbio.IntegrationTest;
import org.mskcc.cbio.domain.Sequence;
import org.mskcc.cbio.domain.enumeration.ReferenceGenome;
import org.mskcc.cbio.repository.SequenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;

/**
 * Integration tests for the {@link SequenceResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class SequenceResourceIT {

    private static final Integer DEFAULT_ENTREZ_GENE_ID = 1;
    private static final Integer UPDATED_ENTREZ_GENE_ID = 2;

    private static final String DEFAULT_HUGO_SYMBOL = "AAAAAAAAAA";
    private static final String UPDATED_HUGO_SYMBOL = "BBBBBBBBBB";

    private static final ReferenceGenome DEFAULT_REFERENCE_GENOME = ReferenceGenome.GRCh37;
    private static final ReferenceGenome UPDATED_REFERENCE_GENOME = ReferenceGenome.GRCh38;

    private static final String DEFAULT_ENSEMBL_TRANSCRIPT_ID = "AAAAAAAAAA";
    private static final String UPDATED_ENSEMBL_TRANSCRIPT_ID = "BBBBBBBBBB";

    private static final String DEFAULT_ENSEMBL_PROTEIN_ID = "AAAAAAAAAA";
    private static final String UPDATED_ENSEMBL_PROTEIN_ID = "BBBBBBBBBB";

    private static final String DEFAULT_REFERENCE_SEQUENCE_ID = "AAAAAAAAAA";
    private static final String UPDATED_REFERENCE_SEQUENCE_ID = "BBBBBBBBBB";

    private static final String DEFAULT_PROTEIN_SEQUENCE = "AAAAAAAAAA";
    private static final String UPDATED_PROTEIN_SEQUENCE = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    @Autowired
    private SequenceRepository sequenceRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restSequenceMockMvc;

    private Sequence sequence;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Sequence createEntity(EntityManager em) {
        Sequence sequence = new Sequence()
            .entrezGeneId(DEFAULT_ENTREZ_GENE_ID)
            .hugoSymbol(DEFAULT_HUGO_SYMBOL)
            .referenceGenome(DEFAULT_REFERENCE_GENOME)
            .ensemblTranscriptId(DEFAULT_ENSEMBL_TRANSCRIPT_ID)
            .ensemblProteinId(DEFAULT_ENSEMBL_PROTEIN_ID)
            .referenceSequenceId(DEFAULT_REFERENCE_SEQUENCE_ID)
            .proteinSequence(DEFAULT_PROTEIN_SEQUENCE)
            .description(DEFAULT_DESCRIPTION);
        return sequence;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Sequence createUpdatedEntity(EntityManager em) {
        Sequence sequence = new Sequence()
            .entrezGeneId(UPDATED_ENTREZ_GENE_ID)
            .hugoSymbol(UPDATED_HUGO_SYMBOL)
            .referenceGenome(UPDATED_REFERENCE_GENOME)
            .ensemblTranscriptId(UPDATED_ENSEMBL_TRANSCRIPT_ID)
            .ensemblProteinId(UPDATED_ENSEMBL_PROTEIN_ID)
            .referenceSequenceId(UPDATED_REFERENCE_SEQUENCE_ID)
            .proteinSequence(UPDATED_PROTEIN_SEQUENCE)
            .description(UPDATED_DESCRIPTION);
        return sequence;
    }

    @BeforeEach
    public void initTest() {
        sequence = createEntity(em);
    }

    @Test
    @Transactional
    void createSequence() throws Exception {
        int databaseSizeBeforeCreate = sequenceRepository.findAll().size();
        // Create the Sequence
        restSequenceMockMvc
            .perform(post("/api/sequences").contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(sequence)))
            .andExpect(status().isCreated());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeCreate + 1);
        Sequence testSequence = sequenceList.get(sequenceList.size() - 1);
        assertThat(testSequence.getEntrezGeneId()).isEqualTo(DEFAULT_ENTREZ_GENE_ID);
        assertThat(testSequence.getHugoSymbol()).isEqualTo(DEFAULT_HUGO_SYMBOL);
        assertThat(testSequence.getReferenceGenome()).isEqualTo(DEFAULT_REFERENCE_GENOME);
        assertThat(testSequence.getEnsemblTranscriptId()).isEqualTo(DEFAULT_ENSEMBL_TRANSCRIPT_ID);
        assertThat(testSequence.getEnsemblProteinId()).isEqualTo(DEFAULT_ENSEMBL_PROTEIN_ID);
        assertThat(testSequence.getReferenceSequenceId()).isEqualTo(DEFAULT_REFERENCE_SEQUENCE_ID);
        assertThat(testSequence.getProteinSequence()).isEqualTo(DEFAULT_PROTEIN_SEQUENCE);
        assertThat(testSequence.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void createSequenceWithExistingId() throws Exception {
        // Create the Sequence with an existing ID
        sequence.setId(1L);

        int databaseSizeBeforeCreate = sequenceRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restSequenceMockMvc
            .perform(post("/api/sequences").contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(sequence)))
            .andExpect(status().isBadRequest());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkEntrezGeneIdIsRequired() throws Exception {
        int databaseSizeBeforeTest = sequenceRepository.findAll().size();
        // set the field null
        sequence.setEntrezGeneId(null);

        // Create the Sequence, which fails.

        restSequenceMockMvc
            .perform(post("/api/sequences").contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(sequence)))
            .andExpect(status().isBadRequest());

        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkHugoSymbolIsRequired() throws Exception {
        int databaseSizeBeforeTest = sequenceRepository.findAll().size();
        // set the field null
        sequence.setHugoSymbol(null);

        // Create the Sequence, which fails.

        restSequenceMockMvc
            .perform(post("/api/sequences").contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(sequence)))
            .andExpect(status().isBadRequest());

        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkReferenceGenomeIsRequired() throws Exception {
        int databaseSizeBeforeTest = sequenceRepository.findAll().size();
        // set the field null
        sequence.setReferenceGenome(null);

        // Create the Sequence, which fails.

        restSequenceMockMvc
            .perform(post("/api/sequences").contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(sequence)))
            .andExpect(status().isBadRequest());

        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllSequences() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        // Get all the sequenceList
        restSequenceMockMvc
            .perform(get("/api/sequences?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(sequence.getId().intValue())))
            .andExpect(jsonPath("$.[*].entrezGeneId").value(hasItem(DEFAULT_ENTREZ_GENE_ID)))
            .andExpect(jsonPath("$.[*].hugoSymbol").value(hasItem(DEFAULT_HUGO_SYMBOL)))
            .andExpect(jsonPath("$.[*].referenceGenome").value(hasItem(DEFAULT_REFERENCE_GENOME.toString())))
            .andExpect(jsonPath("$.[*].ensemblTranscriptId").value(hasItem(DEFAULT_ENSEMBL_TRANSCRIPT_ID)))
            .andExpect(jsonPath("$.[*].ensemblProteinId").value(hasItem(DEFAULT_ENSEMBL_PROTEIN_ID)))
            .andExpect(jsonPath("$.[*].referenceSequenceId").value(hasItem(DEFAULT_REFERENCE_SEQUENCE_ID)))
            .andExpect(jsonPath("$.[*].proteinSequence").value(hasItem(DEFAULT_PROTEIN_SEQUENCE.toString())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));
    }

    @Test
    @Transactional
    void getSequence() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        // Get the sequence
        restSequenceMockMvc
            .perform(get("/api/sequences/{id}", sequence.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(sequence.getId().intValue()))
            .andExpect(jsonPath("$.entrezGeneId").value(DEFAULT_ENTREZ_GENE_ID))
            .andExpect(jsonPath("$.hugoSymbol").value(DEFAULT_HUGO_SYMBOL))
            .andExpect(jsonPath("$.referenceGenome").value(DEFAULT_REFERENCE_GENOME.toString()))
            .andExpect(jsonPath("$.ensemblTranscriptId").value(DEFAULT_ENSEMBL_TRANSCRIPT_ID))
            .andExpect(jsonPath("$.ensemblProteinId").value(DEFAULT_ENSEMBL_PROTEIN_ID))
            .andExpect(jsonPath("$.referenceSequenceId").value(DEFAULT_REFERENCE_SEQUENCE_ID))
            .andExpect(jsonPath("$.proteinSequence").value(DEFAULT_PROTEIN_SEQUENCE.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION));
    }

    @Test
    @Transactional
    void getNonExistingSequence() throws Exception {
        // Get the sequence
        restSequenceMockMvc.perform(get("/api/sequences/{id}", Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void updateSequence() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        int databaseSizeBeforeUpdate = sequenceRepository.findAll().size();

        // Update the sequence
        Sequence updatedSequence = sequenceRepository.findById(sequence.getId()).get();
        // Disconnect from session so that the updates on updatedSequence are not directly saved in db
        em.detach(updatedSequence);
        updatedSequence
            .entrezGeneId(UPDATED_ENTREZ_GENE_ID)
            .hugoSymbol(UPDATED_HUGO_SYMBOL)
            .referenceGenome(UPDATED_REFERENCE_GENOME)
            .ensemblTranscriptId(UPDATED_ENSEMBL_TRANSCRIPT_ID)
            .ensemblProteinId(UPDATED_ENSEMBL_PROTEIN_ID)
            .referenceSequenceId(UPDATED_REFERENCE_SEQUENCE_ID)
            .proteinSequence(UPDATED_PROTEIN_SEQUENCE)
            .description(UPDATED_DESCRIPTION);

        restSequenceMockMvc
            .perform(
                put("/api/sequences").contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(updatedSequence))
            )
            .andExpect(status().isOk());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
        Sequence testSequence = sequenceList.get(sequenceList.size() - 1);
        assertThat(testSequence.getEntrezGeneId()).isEqualTo(UPDATED_ENTREZ_GENE_ID);
        assertThat(testSequence.getHugoSymbol()).isEqualTo(UPDATED_HUGO_SYMBOL);
        assertThat(testSequence.getReferenceGenome()).isEqualTo(UPDATED_REFERENCE_GENOME);
        assertThat(testSequence.getEnsemblTranscriptId()).isEqualTo(UPDATED_ENSEMBL_TRANSCRIPT_ID);
        assertThat(testSequence.getEnsemblProteinId()).isEqualTo(UPDATED_ENSEMBL_PROTEIN_ID);
        assertThat(testSequence.getReferenceSequenceId()).isEqualTo(UPDATED_REFERENCE_SEQUENCE_ID);
        assertThat(testSequence.getProteinSequence()).isEqualTo(UPDATED_PROTEIN_SEQUENCE);
        assertThat(testSequence.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void updateNonExistingSequence() throws Exception {
        int databaseSizeBeforeUpdate = sequenceRepository.findAll().size();

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSequenceMockMvc
            .perform(put("/api/sequences").contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(sequence)))
            .andExpect(status().isBadRequest());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateSequenceWithPatch() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        int databaseSizeBeforeUpdate = sequenceRepository.findAll().size();

        // Update the sequence using partial update
        Sequence partialUpdatedSequence = new Sequence();
        partialUpdatedSequence.setId(sequence.getId());

        partialUpdatedSequence
            .hugoSymbol(UPDATED_HUGO_SYMBOL)
            .ensemblTranscriptId(UPDATED_ENSEMBL_TRANSCRIPT_ID)
            .referenceSequenceId(UPDATED_REFERENCE_SEQUENCE_ID);

        restSequenceMockMvc
            .perform(
                patch("/api/sequences")
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSequence))
            )
            .andExpect(status().isOk());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
        Sequence testSequence = sequenceList.get(sequenceList.size() - 1);
        assertThat(testSequence.getEntrezGeneId()).isEqualTo(DEFAULT_ENTREZ_GENE_ID);
        assertThat(testSequence.getHugoSymbol()).isEqualTo(UPDATED_HUGO_SYMBOL);
        assertThat(testSequence.getReferenceGenome()).isEqualTo(DEFAULT_REFERENCE_GENOME);
        assertThat(testSequence.getEnsemblTranscriptId()).isEqualTo(UPDATED_ENSEMBL_TRANSCRIPT_ID);
        assertThat(testSequence.getEnsemblProteinId()).isEqualTo(DEFAULT_ENSEMBL_PROTEIN_ID);
        assertThat(testSequence.getReferenceSequenceId()).isEqualTo(UPDATED_REFERENCE_SEQUENCE_ID);
        assertThat(testSequence.getProteinSequence()).isEqualTo(DEFAULT_PROTEIN_SEQUENCE);
        assertThat(testSequence.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void fullUpdateSequenceWithPatch() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        int databaseSizeBeforeUpdate = sequenceRepository.findAll().size();

        // Update the sequence using partial update
        Sequence partialUpdatedSequence = new Sequence();
        partialUpdatedSequence.setId(sequence.getId());

        partialUpdatedSequence
            .entrezGeneId(UPDATED_ENTREZ_GENE_ID)
            .hugoSymbol(UPDATED_HUGO_SYMBOL)
            .referenceGenome(UPDATED_REFERENCE_GENOME)
            .ensemblTranscriptId(UPDATED_ENSEMBL_TRANSCRIPT_ID)
            .ensemblProteinId(UPDATED_ENSEMBL_PROTEIN_ID)
            .referenceSequenceId(UPDATED_REFERENCE_SEQUENCE_ID)
            .proteinSequence(UPDATED_PROTEIN_SEQUENCE)
            .description(UPDATED_DESCRIPTION);

        restSequenceMockMvc
            .perform(
                patch("/api/sequences")
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSequence))
            )
            .andExpect(status().isOk());

        // Validate the Sequence in the database
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeUpdate);
        Sequence testSequence = sequenceList.get(sequenceList.size() - 1);
        assertThat(testSequence.getEntrezGeneId()).isEqualTo(UPDATED_ENTREZ_GENE_ID);
        assertThat(testSequence.getHugoSymbol()).isEqualTo(UPDATED_HUGO_SYMBOL);
        assertThat(testSequence.getReferenceGenome()).isEqualTo(UPDATED_REFERENCE_GENOME);
        assertThat(testSequence.getEnsemblTranscriptId()).isEqualTo(UPDATED_ENSEMBL_TRANSCRIPT_ID);
        assertThat(testSequence.getEnsemblProteinId()).isEqualTo(UPDATED_ENSEMBL_PROTEIN_ID);
        assertThat(testSequence.getReferenceSequenceId()).isEqualTo(UPDATED_REFERENCE_SEQUENCE_ID);
        assertThat(testSequence.getProteinSequence()).isEqualTo(UPDATED_PROTEIN_SEQUENCE);
        assertThat(testSequence.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void partialUpdateSequenceShouldThrown() throws Exception {
        // Update the sequence without id should throw
        Sequence partialUpdatedSequence = new Sequence();

        restSequenceMockMvc
            .perform(
                patch("/api/sequences")
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSequence))
            )
            .andExpect(status().isBadRequest());
    }

    @Test
    @Transactional
    void deleteSequence() throws Exception {
        // Initialize the database
        sequenceRepository.saveAndFlush(sequence);

        int databaseSizeBeforeDelete = sequenceRepository.findAll().size();

        // Delete the sequence
        restSequenceMockMvc
            .perform(delete("/api/sequences/{id}", sequence.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Sequence> sequenceList = sequenceRepository.findAll();
        assertThat(sequenceList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
