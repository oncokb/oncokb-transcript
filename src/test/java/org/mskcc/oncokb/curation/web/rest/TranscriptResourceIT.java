package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.oncokb.curation.IntegrationTest;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.EnsemblGene;
import org.mskcc.oncokb.curation.domain.Flag;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.GenomeFragment;
import org.mskcc.oncokb.curation.domain.Sequence;
import org.mskcc.oncokb.curation.domain.Transcript;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.repository.TranscriptRepository;
import org.mskcc.oncokb.curation.service.TranscriptService;
import org.mskcc.oncokb.curation.service.criteria.TranscriptCriteria;
import org.mskcc.oncokb.curation.service.dto.TranscriptDTO;
import org.mskcc.oncokb.curation.service.mapper.TranscriptMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link TranscriptResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class TranscriptResourceIT {

    private static final ReferenceGenome DEFAULT_REFERENCE_GENOME = ReferenceGenome.GRCh37;
    private static final ReferenceGenome UPDATED_REFERENCE_GENOME = ReferenceGenome.GRCh38;

    private static final String DEFAULT_ENSEMBL_TRANSCRIPT_ID = "AAAAAAAAAA";
    private static final String UPDATED_ENSEMBL_TRANSCRIPT_ID = "BBBBBBBBBB";

    private static final Boolean DEFAULT_CANONICAL = false;
    private static final Boolean UPDATED_CANONICAL = true;

    private static final String DEFAULT_ENSEMBL_PROTEIN_ID = "AAAAAAAAAA";
    private static final String UPDATED_ENSEMBL_PROTEIN_ID = "BBBBBBBBBB";

    private static final String DEFAULT_REFERENCE_SEQUENCE_ID = "AAAAAAAAAA";
    private static final String UPDATED_REFERENCE_SEQUENCE_ID = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/transcripts";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private TranscriptRepository transcriptRepository;

    @Mock
    private TranscriptRepository transcriptRepositoryMock;

    @Autowired
    private TranscriptMapper transcriptMapper;

    @Mock
    private TranscriptService transcriptServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTranscriptMockMvc;

    private Transcript transcript;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Transcript createEntity(EntityManager em) {
        Transcript transcript = new Transcript()
            .referenceGenome(DEFAULT_REFERENCE_GENOME)
            .ensemblTranscriptId(DEFAULT_ENSEMBL_TRANSCRIPT_ID)
            .canonical(DEFAULT_CANONICAL)
            .ensemblProteinId(DEFAULT_ENSEMBL_PROTEIN_ID)
            .referenceSequenceId(DEFAULT_REFERENCE_SEQUENCE_ID)
            .description(DEFAULT_DESCRIPTION);
        return transcript;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Transcript createUpdatedEntity(EntityManager em) {
        Transcript transcript = new Transcript()
            .referenceGenome(UPDATED_REFERENCE_GENOME)
            .ensemblTranscriptId(UPDATED_ENSEMBL_TRANSCRIPT_ID)
            .canonical(UPDATED_CANONICAL)
            .ensemblProteinId(UPDATED_ENSEMBL_PROTEIN_ID)
            .referenceSequenceId(UPDATED_REFERENCE_SEQUENCE_ID)
            .description(UPDATED_DESCRIPTION);
        return transcript;
    }

    @BeforeEach
    public void initTest() {
        transcript = createEntity(em);
    }

    @Test
    @Transactional
    void createTranscript() throws Exception {
        int databaseSizeBeforeCreate = transcriptRepository.findAll().size();
        // Create the Transcript
        TranscriptDTO transcriptDTO = transcriptMapper.toDto(transcript);
        restTranscriptMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(transcriptDTO))
            )
            .andExpect(status().isCreated());

        // Validate the Transcript in the database
        List<Transcript> transcriptList = transcriptRepository.findAll();
        assertThat(transcriptList).hasSize(databaseSizeBeforeCreate + 1);
        Transcript testTranscript = transcriptList.get(transcriptList.size() - 1);
        assertThat(testTranscript.getReferenceGenome()).isEqualTo(DEFAULT_REFERENCE_GENOME);
        assertThat(testTranscript.getEnsemblTranscriptId()).isEqualTo(DEFAULT_ENSEMBL_TRANSCRIPT_ID);
        assertThat(testTranscript.getCanonical()).isEqualTo(DEFAULT_CANONICAL);
        assertThat(testTranscript.getEnsemblProteinId()).isEqualTo(DEFAULT_ENSEMBL_PROTEIN_ID);
        assertThat(testTranscript.getReferenceSequenceId()).isEqualTo(DEFAULT_REFERENCE_SEQUENCE_ID);
        assertThat(testTranscript.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void createTranscriptWithExistingId() throws Exception {
        // Create the Transcript with an existing ID
        transcript.setId(1L);
        TranscriptDTO transcriptDTO = transcriptMapper.toDto(transcript);

        int databaseSizeBeforeCreate = transcriptRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTranscriptMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(transcriptDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Transcript in the database
        List<Transcript> transcriptList = transcriptRepository.findAll();
        assertThat(transcriptList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCanonicalIsRequired() throws Exception {
        int databaseSizeBeforeTest = transcriptRepository.findAll().size();
        // set the field null
        transcript.setCanonical(null);

        // Create the Transcript, which fails.
        TranscriptDTO transcriptDTO = transcriptMapper.toDto(transcript);

        restTranscriptMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(transcriptDTO))
            )
            .andExpect(status().isBadRequest());

        List<Transcript> transcriptList = transcriptRepository.findAll();
        assertThat(transcriptList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllTranscripts() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList
        restTranscriptMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(transcript.getId().intValue())))
            .andExpect(jsonPath("$.[*].referenceGenome").value(hasItem(DEFAULT_REFERENCE_GENOME.toString())))
            .andExpect(jsonPath("$.[*].ensemblTranscriptId").value(hasItem(DEFAULT_ENSEMBL_TRANSCRIPT_ID)))
            .andExpect(jsonPath("$.[*].canonical").value(hasItem(DEFAULT_CANONICAL.booleanValue())))
            .andExpect(jsonPath("$.[*].ensemblProteinId").value(hasItem(DEFAULT_ENSEMBL_PROTEIN_ID)))
            .andExpect(jsonPath("$.[*].referenceSequenceId").value(hasItem(DEFAULT_REFERENCE_SEQUENCE_ID)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllTranscriptsWithEagerRelationshipsIsEnabled() throws Exception {
        when(transcriptServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restTranscriptMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(transcriptServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllTranscriptsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(transcriptServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restTranscriptMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(transcriptServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getTranscript() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get the transcript
        restTranscriptMockMvc
            .perform(get(ENTITY_API_URL_ID, transcript.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(transcript.getId().intValue()))
            .andExpect(jsonPath("$.referenceGenome").value(DEFAULT_REFERENCE_GENOME.toString()))
            .andExpect(jsonPath("$.ensemblTranscriptId").value(DEFAULT_ENSEMBL_TRANSCRIPT_ID))
            .andExpect(jsonPath("$.canonical").value(DEFAULT_CANONICAL.booleanValue()))
            .andExpect(jsonPath("$.ensemblProteinId").value(DEFAULT_ENSEMBL_PROTEIN_ID))
            .andExpect(jsonPath("$.referenceSequenceId").value(DEFAULT_REFERENCE_SEQUENCE_ID))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION));
    }

    @Test
    @Transactional
    void getTranscriptsByIdFiltering() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        Long id = transcript.getId();

        defaultTranscriptShouldBeFound("id.equals=" + id);
        defaultTranscriptShouldNotBeFound("id.notEquals=" + id);

        defaultTranscriptShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultTranscriptShouldNotBeFound("id.greaterThan=" + id);

        defaultTranscriptShouldBeFound("id.lessThanOrEqual=" + id);
        defaultTranscriptShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllTranscriptsByReferenceGenomeIsEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where referenceGenome equals to DEFAULT_REFERENCE_GENOME
        defaultTranscriptShouldBeFound("referenceGenome.equals=" + DEFAULT_REFERENCE_GENOME);

        // Get all the transcriptList where referenceGenome equals to UPDATED_REFERENCE_GENOME
        defaultTranscriptShouldNotBeFound("referenceGenome.equals=" + UPDATED_REFERENCE_GENOME);
    }

    @Test
    @Transactional
    void getAllTranscriptsByReferenceGenomeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where referenceGenome not equals to DEFAULT_REFERENCE_GENOME
        defaultTranscriptShouldNotBeFound("referenceGenome.notEquals=" + DEFAULT_REFERENCE_GENOME);

        // Get all the transcriptList where referenceGenome not equals to UPDATED_REFERENCE_GENOME
        defaultTranscriptShouldBeFound("referenceGenome.notEquals=" + UPDATED_REFERENCE_GENOME);
    }

    @Test
    @Transactional
    void getAllTranscriptsByReferenceGenomeIsInShouldWork() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where referenceGenome in DEFAULT_REFERENCE_GENOME or UPDATED_REFERENCE_GENOME
        defaultTranscriptShouldBeFound("referenceGenome.in=" + DEFAULT_REFERENCE_GENOME + "," + UPDATED_REFERENCE_GENOME);

        // Get all the transcriptList where referenceGenome equals to UPDATED_REFERENCE_GENOME
        defaultTranscriptShouldNotBeFound("referenceGenome.in=" + UPDATED_REFERENCE_GENOME);
    }

    @Test
    @Transactional
    void getAllTranscriptsByReferenceGenomeIsNullOrNotNull() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where referenceGenome is not null
        defaultTranscriptShouldBeFound("referenceGenome.specified=true");

        // Get all the transcriptList where referenceGenome is null
        defaultTranscriptShouldNotBeFound("referenceGenome.specified=false");
    }

    @Test
    @Transactional
    void getAllTranscriptsByEnsemblTranscriptIdIsEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where ensemblTranscriptId equals to DEFAULT_ENSEMBL_TRANSCRIPT_ID
        defaultTranscriptShouldBeFound("ensemblTranscriptId.equals=" + DEFAULT_ENSEMBL_TRANSCRIPT_ID);

        // Get all the transcriptList where ensemblTranscriptId equals to UPDATED_ENSEMBL_TRANSCRIPT_ID
        defaultTranscriptShouldNotBeFound("ensemblTranscriptId.equals=" + UPDATED_ENSEMBL_TRANSCRIPT_ID);
    }

    @Test
    @Transactional
    void getAllTranscriptsByEnsemblTranscriptIdIsNotEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where ensemblTranscriptId not equals to DEFAULT_ENSEMBL_TRANSCRIPT_ID
        defaultTranscriptShouldNotBeFound("ensemblTranscriptId.notEquals=" + DEFAULT_ENSEMBL_TRANSCRIPT_ID);

        // Get all the transcriptList where ensemblTranscriptId not equals to UPDATED_ENSEMBL_TRANSCRIPT_ID
        defaultTranscriptShouldBeFound("ensemblTranscriptId.notEquals=" + UPDATED_ENSEMBL_TRANSCRIPT_ID);
    }

    @Test
    @Transactional
    void getAllTranscriptsByEnsemblTranscriptIdIsInShouldWork() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where ensemblTranscriptId in DEFAULT_ENSEMBL_TRANSCRIPT_ID or UPDATED_ENSEMBL_TRANSCRIPT_ID
        defaultTranscriptShouldBeFound("ensemblTranscriptId.in=" + DEFAULT_ENSEMBL_TRANSCRIPT_ID + "," + UPDATED_ENSEMBL_TRANSCRIPT_ID);

        // Get all the transcriptList where ensemblTranscriptId equals to UPDATED_ENSEMBL_TRANSCRIPT_ID
        defaultTranscriptShouldNotBeFound("ensemblTranscriptId.in=" + UPDATED_ENSEMBL_TRANSCRIPT_ID);
    }

    @Test
    @Transactional
    void getAllTranscriptsByEnsemblTranscriptIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where ensemblTranscriptId is not null
        defaultTranscriptShouldBeFound("ensemblTranscriptId.specified=true");

        // Get all the transcriptList where ensemblTranscriptId is null
        defaultTranscriptShouldNotBeFound("ensemblTranscriptId.specified=false");
    }

    @Test
    @Transactional
    void getAllTranscriptsByEnsemblTranscriptIdContainsSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where ensemblTranscriptId contains DEFAULT_ENSEMBL_TRANSCRIPT_ID
        defaultTranscriptShouldBeFound("ensemblTranscriptId.contains=" + DEFAULT_ENSEMBL_TRANSCRIPT_ID);

        // Get all the transcriptList where ensemblTranscriptId contains UPDATED_ENSEMBL_TRANSCRIPT_ID
        defaultTranscriptShouldNotBeFound("ensemblTranscriptId.contains=" + UPDATED_ENSEMBL_TRANSCRIPT_ID);
    }

    @Test
    @Transactional
    void getAllTranscriptsByEnsemblTranscriptIdNotContainsSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where ensemblTranscriptId does not contain DEFAULT_ENSEMBL_TRANSCRIPT_ID
        defaultTranscriptShouldNotBeFound("ensemblTranscriptId.doesNotContain=" + DEFAULT_ENSEMBL_TRANSCRIPT_ID);

        // Get all the transcriptList where ensemblTranscriptId does not contain UPDATED_ENSEMBL_TRANSCRIPT_ID
        defaultTranscriptShouldBeFound("ensemblTranscriptId.doesNotContain=" + UPDATED_ENSEMBL_TRANSCRIPT_ID);
    }

    @Test
    @Transactional
    void getAllTranscriptsByCanonicalIsEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where canonical equals to DEFAULT_CANONICAL
        defaultTranscriptShouldBeFound("canonical.equals=" + DEFAULT_CANONICAL);

        // Get all the transcriptList where canonical equals to UPDATED_CANONICAL
        defaultTranscriptShouldNotBeFound("canonical.equals=" + UPDATED_CANONICAL);
    }

    @Test
    @Transactional
    void getAllTranscriptsByCanonicalIsNotEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where canonical not equals to DEFAULT_CANONICAL
        defaultTranscriptShouldNotBeFound("canonical.notEquals=" + DEFAULT_CANONICAL);

        // Get all the transcriptList where canonical not equals to UPDATED_CANONICAL
        defaultTranscriptShouldBeFound("canonical.notEquals=" + UPDATED_CANONICAL);
    }

    @Test
    @Transactional
    void getAllTranscriptsByCanonicalIsInShouldWork() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where canonical in DEFAULT_CANONICAL or UPDATED_CANONICAL
        defaultTranscriptShouldBeFound("canonical.in=" + DEFAULT_CANONICAL + "," + UPDATED_CANONICAL);

        // Get all the transcriptList where canonical equals to UPDATED_CANONICAL
        defaultTranscriptShouldNotBeFound("canonical.in=" + UPDATED_CANONICAL);
    }

    @Test
    @Transactional
    void getAllTranscriptsByCanonicalIsNullOrNotNull() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where canonical is not null
        defaultTranscriptShouldBeFound("canonical.specified=true");

        // Get all the transcriptList where canonical is null
        defaultTranscriptShouldNotBeFound("canonical.specified=false");
    }

    @Test
    @Transactional
    void getAllTranscriptsByEnsemblProteinIdIsEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where ensemblProteinId equals to DEFAULT_ENSEMBL_PROTEIN_ID
        defaultTranscriptShouldBeFound("ensemblProteinId.equals=" + DEFAULT_ENSEMBL_PROTEIN_ID);

        // Get all the transcriptList where ensemblProteinId equals to UPDATED_ENSEMBL_PROTEIN_ID
        defaultTranscriptShouldNotBeFound("ensemblProteinId.equals=" + UPDATED_ENSEMBL_PROTEIN_ID);
    }

    @Test
    @Transactional
    void getAllTranscriptsByEnsemblProteinIdIsNotEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where ensemblProteinId not equals to DEFAULT_ENSEMBL_PROTEIN_ID
        defaultTranscriptShouldNotBeFound("ensemblProteinId.notEquals=" + DEFAULT_ENSEMBL_PROTEIN_ID);

        // Get all the transcriptList where ensemblProteinId not equals to UPDATED_ENSEMBL_PROTEIN_ID
        defaultTranscriptShouldBeFound("ensemblProteinId.notEquals=" + UPDATED_ENSEMBL_PROTEIN_ID);
    }

    @Test
    @Transactional
    void getAllTranscriptsByEnsemblProteinIdIsInShouldWork() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where ensemblProteinId in DEFAULT_ENSEMBL_PROTEIN_ID or UPDATED_ENSEMBL_PROTEIN_ID
        defaultTranscriptShouldBeFound("ensemblProteinId.in=" + DEFAULT_ENSEMBL_PROTEIN_ID + "," + UPDATED_ENSEMBL_PROTEIN_ID);

        // Get all the transcriptList where ensemblProteinId equals to UPDATED_ENSEMBL_PROTEIN_ID
        defaultTranscriptShouldNotBeFound("ensemblProteinId.in=" + UPDATED_ENSEMBL_PROTEIN_ID);
    }

    @Test
    @Transactional
    void getAllTranscriptsByEnsemblProteinIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where ensemblProteinId is not null
        defaultTranscriptShouldBeFound("ensemblProteinId.specified=true");

        // Get all the transcriptList where ensemblProteinId is null
        defaultTranscriptShouldNotBeFound("ensemblProteinId.specified=false");
    }

    @Test
    @Transactional
    void getAllTranscriptsByEnsemblProteinIdContainsSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where ensemblProteinId contains DEFAULT_ENSEMBL_PROTEIN_ID
        defaultTranscriptShouldBeFound("ensemblProteinId.contains=" + DEFAULT_ENSEMBL_PROTEIN_ID);

        // Get all the transcriptList where ensemblProteinId contains UPDATED_ENSEMBL_PROTEIN_ID
        defaultTranscriptShouldNotBeFound("ensemblProteinId.contains=" + UPDATED_ENSEMBL_PROTEIN_ID);
    }

    @Test
    @Transactional
    void getAllTranscriptsByEnsemblProteinIdNotContainsSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where ensemblProteinId does not contain DEFAULT_ENSEMBL_PROTEIN_ID
        defaultTranscriptShouldNotBeFound("ensemblProteinId.doesNotContain=" + DEFAULT_ENSEMBL_PROTEIN_ID);

        // Get all the transcriptList where ensemblProteinId does not contain UPDATED_ENSEMBL_PROTEIN_ID
        defaultTranscriptShouldBeFound("ensemblProteinId.doesNotContain=" + UPDATED_ENSEMBL_PROTEIN_ID);
    }

    @Test
    @Transactional
    void getAllTranscriptsByReferenceSequenceIdIsEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where referenceSequenceId equals to DEFAULT_REFERENCE_SEQUENCE_ID
        defaultTranscriptShouldBeFound("referenceSequenceId.equals=" + DEFAULT_REFERENCE_SEQUENCE_ID);

        // Get all the transcriptList where referenceSequenceId equals to UPDATED_REFERENCE_SEQUENCE_ID
        defaultTranscriptShouldNotBeFound("referenceSequenceId.equals=" + UPDATED_REFERENCE_SEQUENCE_ID);
    }

    @Test
    @Transactional
    void getAllTranscriptsByReferenceSequenceIdIsNotEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where referenceSequenceId not equals to DEFAULT_REFERENCE_SEQUENCE_ID
        defaultTranscriptShouldNotBeFound("referenceSequenceId.notEquals=" + DEFAULT_REFERENCE_SEQUENCE_ID);

        // Get all the transcriptList where referenceSequenceId not equals to UPDATED_REFERENCE_SEQUENCE_ID
        defaultTranscriptShouldBeFound("referenceSequenceId.notEquals=" + UPDATED_REFERENCE_SEQUENCE_ID);
    }

    @Test
    @Transactional
    void getAllTranscriptsByReferenceSequenceIdIsInShouldWork() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where referenceSequenceId in DEFAULT_REFERENCE_SEQUENCE_ID or UPDATED_REFERENCE_SEQUENCE_ID
        defaultTranscriptShouldBeFound("referenceSequenceId.in=" + DEFAULT_REFERENCE_SEQUENCE_ID + "," + UPDATED_REFERENCE_SEQUENCE_ID);

        // Get all the transcriptList where referenceSequenceId equals to UPDATED_REFERENCE_SEQUENCE_ID
        defaultTranscriptShouldNotBeFound("referenceSequenceId.in=" + UPDATED_REFERENCE_SEQUENCE_ID);
    }

    @Test
    @Transactional
    void getAllTranscriptsByReferenceSequenceIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where referenceSequenceId is not null
        defaultTranscriptShouldBeFound("referenceSequenceId.specified=true");

        // Get all the transcriptList where referenceSequenceId is null
        defaultTranscriptShouldNotBeFound("referenceSequenceId.specified=false");
    }

    @Test
    @Transactional
    void getAllTranscriptsByReferenceSequenceIdContainsSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where referenceSequenceId contains DEFAULT_REFERENCE_SEQUENCE_ID
        defaultTranscriptShouldBeFound("referenceSequenceId.contains=" + DEFAULT_REFERENCE_SEQUENCE_ID);

        // Get all the transcriptList where referenceSequenceId contains UPDATED_REFERENCE_SEQUENCE_ID
        defaultTranscriptShouldNotBeFound("referenceSequenceId.contains=" + UPDATED_REFERENCE_SEQUENCE_ID);
    }

    @Test
    @Transactional
    void getAllTranscriptsByReferenceSequenceIdNotContainsSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where referenceSequenceId does not contain DEFAULT_REFERENCE_SEQUENCE_ID
        defaultTranscriptShouldNotBeFound("referenceSequenceId.doesNotContain=" + DEFAULT_REFERENCE_SEQUENCE_ID);

        // Get all the transcriptList where referenceSequenceId does not contain UPDATED_REFERENCE_SEQUENCE_ID
        defaultTranscriptShouldBeFound("referenceSequenceId.doesNotContain=" + UPDATED_REFERENCE_SEQUENCE_ID);
    }

    @Test
    @Transactional
    void getAllTranscriptsByDescriptionIsEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where description equals to DEFAULT_DESCRIPTION
        defaultTranscriptShouldBeFound("description.equals=" + DEFAULT_DESCRIPTION);

        // Get all the transcriptList where description equals to UPDATED_DESCRIPTION
        defaultTranscriptShouldNotBeFound("description.equals=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllTranscriptsByDescriptionIsNotEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where description not equals to DEFAULT_DESCRIPTION
        defaultTranscriptShouldNotBeFound("description.notEquals=" + DEFAULT_DESCRIPTION);

        // Get all the transcriptList where description not equals to UPDATED_DESCRIPTION
        defaultTranscriptShouldBeFound("description.notEquals=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllTranscriptsByDescriptionIsInShouldWork() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where description in DEFAULT_DESCRIPTION or UPDATED_DESCRIPTION
        defaultTranscriptShouldBeFound("description.in=" + DEFAULT_DESCRIPTION + "," + UPDATED_DESCRIPTION);

        // Get all the transcriptList where description equals to UPDATED_DESCRIPTION
        defaultTranscriptShouldNotBeFound("description.in=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllTranscriptsByDescriptionIsNullOrNotNull() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where description is not null
        defaultTranscriptShouldBeFound("description.specified=true");

        // Get all the transcriptList where description is null
        defaultTranscriptShouldNotBeFound("description.specified=false");
    }

    @Test
    @Transactional
    void getAllTranscriptsByDescriptionContainsSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where description contains DEFAULT_DESCRIPTION
        defaultTranscriptShouldBeFound("description.contains=" + DEFAULT_DESCRIPTION);

        // Get all the transcriptList where description contains UPDATED_DESCRIPTION
        defaultTranscriptShouldNotBeFound("description.contains=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllTranscriptsByDescriptionNotContainsSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        // Get all the transcriptList where description does not contain DEFAULT_DESCRIPTION
        defaultTranscriptShouldNotBeFound("description.doesNotContain=" + DEFAULT_DESCRIPTION);

        // Get all the transcriptList where description does not contain UPDATED_DESCRIPTION
        defaultTranscriptShouldBeFound("description.doesNotContain=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllTranscriptsBySequenceIsEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);
        Sequence sequence;
        if (TestUtil.findAll(em, Sequence.class).isEmpty()) {
            sequence = SequenceResourceIT.createEntity(em);
            em.persist(sequence);
            em.flush();
        } else {
            sequence = TestUtil.findAll(em, Sequence.class).get(0);
        }
        em.persist(sequence);
        em.flush();
        transcript.addSequence(sequence);
        transcriptRepository.saveAndFlush(transcript);
        Long sequenceId = sequence.getId();

        // Get all the transcriptList where sequence equals to sequenceId
        defaultTranscriptShouldBeFound("sequenceId.equals=" + sequenceId);

        // Get all the transcriptList where sequence equals to (sequenceId + 1)
        defaultTranscriptShouldNotBeFound("sequenceId.equals=" + (sequenceId + 1));
    }

    @Test
    @Transactional
    void getAllTranscriptsByFragmentsIsEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);
        GenomeFragment fragments;
        if (TestUtil.findAll(em, GenomeFragment.class).isEmpty()) {
            fragments = GenomeFragmentResourceIT.createEntity(em);
            em.persist(fragments);
            em.flush();
        } else {
            fragments = TestUtil.findAll(em, GenomeFragment.class).get(0);
        }
        em.persist(fragments);
        em.flush();
        transcript.addFragments(fragments);
        transcriptRepository.saveAndFlush(transcript);
        Long fragmentsId = fragments.getId();

        // Get all the transcriptList where fragments equals to fragmentsId
        defaultTranscriptShouldBeFound("fragmentsId.equals=" + fragmentsId);

        // Get all the transcriptList where fragments equals to (fragmentsId + 1)
        defaultTranscriptShouldNotBeFound("fragmentsId.equals=" + (fragmentsId + 1));
    }

    @Test
    @Transactional
    void getAllTranscriptsByFlagIsEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);
        Flag flag;
        if (TestUtil.findAll(em, Flag.class).isEmpty()) {
            flag = FlagResourceIT.createEntity(em);
            em.persist(flag);
            em.flush();
        } else {
            flag = TestUtil.findAll(em, Flag.class).get(0);
        }
        em.persist(flag);
        em.flush();
        transcript.addFlag(flag);
        transcriptRepository.saveAndFlush(transcript);
        Long flagId = flag.getId();

        // Get all the transcriptList where flag equals to flagId
        defaultTranscriptShouldBeFound("flagId.equals=" + flagId);

        // Get all the transcriptList where flag equals to (flagId + 1)
        defaultTranscriptShouldNotBeFound("flagId.equals=" + (flagId + 1));
    }

    @Test
    @Transactional
    void getAllTranscriptsByEnsemblGeneIsEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);
        EnsemblGene ensemblGene;
        if (TestUtil.findAll(em, EnsemblGene.class).isEmpty()) {
            ensemblGene = EnsemblGeneResourceIT.createEntity(em);
            em.persist(ensemblGene);
            em.flush();
        } else {
            ensemblGene = TestUtil.findAll(em, EnsemblGene.class).get(0);
        }
        em.persist(ensemblGene);
        em.flush();
        transcript.setEnsemblGene(ensemblGene);
        transcriptRepository.saveAndFlush(transcript);
        Long ensemblGeneId = ensemblGene.getId();

        // Get all the transcriptList where ensemblGene equals to ensemblGeneId
        defaultTranscriptShouldBeFound("ensemblGeneId.equals=" + ensemblGeneId);

        // Get all the transcriptList where ensemblGene equals to (ensemblGeneId + 1)
        defaultTranscriptShouldNotBeFound("ensemblGeneId.equals=" + (ensemblGeneId + 1));
    }

    @Test
    @Transactional
    void getAllTranscriptsByGeneIsEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);
        Gene gene;
        if (TestUtil.findAll(em, Gene.class).isEmpty()) {
            gene = GeneResourceIT.createEntity(em);
            em.persist(gene);
            em.flush();
        } else {
            gene = TestUtil.findAll(em, Gene.class).get(0);
        }
        em.persist(gene);
        em.flush();
        transcript.setGene(gene);
        transcriptRepository.saveAndFlush(transcript);
        Long geneId = gene.getId();

        // Get all the transcriptList where gene equals to geneId
        defaultTranscriptShouldBeFound("geneId.equals=" + geneId);

        // Get all the transcriptList where gene equals to (geneId + 1)
        defaultTranscriptShouldNotBeFound("geneId.equals=" + (geneId + 1));
    }

    @Test
    @Transactional
    void getAllTranscriptsByAlterationIsEqualToSomething() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);
        Alteration alteration;
        if (TestUtil.findAll(em, Alteration.class).isEmpty()) {
            alteration = AlterationResourceIT.createEntity(em);
            em.persist(alteration);
            em.flush();
        } else {
            alteration = TestUtil.findAll(em, Alteration.class).get(0);
        }
        em.persist(alteration);
        em.flush();
        transcript.addAlteration(alteration);
        transcriptRepository.saveAndFlush(transcript);
        Long alterationId = alteration.getId();

        // Get all the transcriptList where alteration equals to alterationId
        defaultTranscriptShouldBeFound("alterationId.equals=" + alterationId);

        // Get all the transcriptList where alteration equals to (alterationId + 1)
        defaultTranscriptShouldNotBeFound("alterationId.equals=" + (alterationId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultTranscriptShouldBeFound(String filter) throws Exception {
        restTranscriptMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(transcript.getId().intValue())))
            .andExpect(jsonPath("$.[*].referenceGenome").value(hasItem(DEFAULT_REFERENCE_GENOME.toString())))
            .andExpect(jsonPath("$.[*].ensemblTranscriptId").value(hasItem(DEFAULT_ENSEMBL_TRANSCRIPT_ID)))
            .andExpect(jsonPath("$.[*].canonical").value(hasItem(DEFAULT_CANONICAL.booleanValue())))
            .andExpect(jsonPath("$.[*].ensemblProteinId").value(hasItem(DEFAULT_ENSEMBL_PROTEIN_ID)))
            .andExpect(jsonPath("$.[*].referenceSequenceId").value(hasItem(DEFAULT_REFERENCE_SEQUENCE_ID)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));

        // Check, that the count call also returns 1
        restTranscriptMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultTranscriptShouldNotBeFound(String filter) throws Exception {
        restTranscriptMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restTranscriptMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingTranscript() throws Exception {
        // Get the transcript
        restTranscriptMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewTranscript() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        int databaseSizeBeforeUpdate = transcriptRepository.findAll().size();

        // Update the transcript
        Transcript updatedTranscript = transcriptRepository.findById(transcript.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedTranscript are not directly saved in db
        em.detach(updatedTranscript);
        updatedTranscript
            .referenceGenome(UPDATED_REFERENCE_GENOME)
            .ensemblTranscriptId(UPDATED_ENSEMBL_TRANSCRIPT_ID)
            .canonical(UPDATED_CANONICAL)
            .ensemblProteinId(UPDATED_ENSEMBL_PROTEIN_ID)
            .referenceSequenceId(UPDATED_REFERENCE_SEQUENCE_ID)
            .description(UPDATED_DESCRIPTION);
        TranscriptDTO transcriptDTO = transcriptMapper.toDto(updatedTranscript);

        restTranscriptMockMvc
            .perform(
                put(ENTITY_API_URL_ID, transcriptDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(transcriptDTO))
            )
            .andExpect(status().isOk());

        // Validate the Transcript in the database
        List<Transcript> transcriptList = transcriptRepository.findAll();
        assertThat(transcriptList).hasSize(databaseSizeBeforeUpdate);
        Transcript testTranscript = transcriptList.get(transcriptList.size() - 1);
        assertThat(testTranscript.getReferenceGenome()).isEqualTo(UPDATED_REFERENCE_GENOME);
        assertThat(testTranscript.getEnsemblTranscriptId()).isEqualTo(UPDATED_ENSEMBL_TRANSCRIPT_ID);
        assertThat(testTranscript.getCanonical()).isEqualTo(UPDATED_CANONICAL);
        assertThat(testTranscript.getEnsemblProteinId()).isEqualTo(UPDATED_ENSEMBL_PROTEIN_ID);
        assertThat(testTranscript.getReferenceSequenceId()).isEqualTo(UPDATED_REFERENCE_SEQUENCE_ID);
        assertThat(testTranscript.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void putNonExistingTranscript() throws Exception {
        int databaseSizeBeforeUpdate = transcriptRepository.findAll().size();
        transcript.setId(count.incrementAndGet());

        // Create the Transcript
        TranscriptDTO transcriptDTO = transcriptMapper.toDto(transcript);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTranscriptMockMvc
            .perform(
                put(ENTITY_API_URL_ID, transcriptDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(transcriptDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Transcript in the database
        List<Transcript> transcriptList = transcriptRepository.findAll();
        assertThat(transcriptList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTranscript() throws Exception {
        int databaseSizeBeforeUpdate = transcriptRepository.findAll().size();
        transcript.setId(count.incrementAndGet());

        // Create the Transcript
        TranscriptDTO transcriptDTO = transcriptMapper.toDto(transcript);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTranscriptMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(transcriptDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Transcript in the database
        List<Transcript> transcriptList = transcriptRepository.findAll();
        assertThat(transcriptList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTranscript() throws Exception {
        int databaseSizeBeforeUpdate = transcriptRepository.findAll().size();
        transcript.setId(count.incrementAndGet());

        // Create the Transcript
        TranscriptDTO transcriptDTO = transcriptMapper.toDto(transcript);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTranscriptMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(transcriptDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Transcript in the database
        List<Transcript> transcriptList = transcriptRepository.findAll();
        assertThat(transcriptList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTranscriptWithPatch() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        int databaseSizeBeforeUpdate = transcriptRepository.findAll().size();

        // Update the transcript using partial update
        Transcript partialUpdatedTranscript = new Transcript();
        partialUpdatedTranscript.setId(transcript.getId());

        partialUpdatedTranscript.canonical(UPDATED_CANONICAL).description(UPDATED_DESCRIPTION);

        restTranscriptMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTranscript.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedTranscript))
            )
            .andExpect(status().isOk());

        // Validate the Transcript in the database
        List<Transcript> transcriptList = transcriptRepository.findAll();
        assertThat(transcriptList).hasSize(databaseSizeBeforeUpdate);
        Transcript testTranscript = transcriptList.get(transcriptList.size() - 1);
        assertThat(testTranscript.getReferenceGenome()).isEqualTo(DEFAULT_REFERENCE_GENOME);
        assertThat(testTranscript.getEnsemblTranscriptId()).isEqualTo(DEFAULT_ENSEMBL_TRANSCRIPT_ID);
        assertThat(testTranscript.getCanonical()).isEqualTo(UPDATED_CANONICAL);
        assertThat(testTranscript.getEnsemblProteinId()).isEqualTo(DEFAULT_ENSEMBL_PROTEIN_ID);
        assertThat(testTranscript.getReferenceSequenceId()).isEqualTo(DEFAULT_REFERENCE_SEQUENCE_ID);
        assertThat(testTranscript.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void fullUpdateTranscriptWithPatch() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        int databaseSizeBeforeUpdate = transcriptRepository.findAll().size();

        // Update the transcript using partial update
        Transcript partialUpdatedTranscript = new Transcript();
        partialUpdatedTranscript.setId(transcript.getId());

        partialUpdatedTranscript
            .referenceGenome(UPDATED_REFERENCE_GENOME)
            .ensemblTranscriptId(UPDATED_ENSEMBL_TRANSCRIPT_ID)
            .canonical(UPDATED_CANONICAL)
            .ensemblProteinId(UPDATED_ENSEMBL_PROTEIN_ID)
            .referenceSequenceId(UPDATED_REFERENCE_SEQUENCE_ID)
            .description(UPDATED_DESCRIPTION);

        restTranscriptMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTranscript.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedTranscript))
            )
            .andExpect(status().isOk());

        // Validate the Transcript in the database
        List<Transcript> transcriptList = transcriptRepository.findAll();
        assertThat(transcriptList).hasSize(databaseSizeBeforeUpdate);
        Transcript testTranscript = transcriptList.get(transcriptList.size() - 1);
        assertThat(testTranscript.getReferenceGenome()).isEqualTo(UPDATED_REFERENCE_GENOME);
        assertThat(testTranscript.getEnsemblTranscriptId()).isEqualTo(UPDATED_ENSEMBL_TRANSCRIPT_ID);
        assertThat(testTranscript.getCanonical()).isEqualTo(UPDATED_CANONICAL);
        assertThat(testTranscript.getEnsemblProteinId()).isEqualTo(UPDATED_ENSEMBL_PROTEIN_ID);
        assertThat(testTranscript.getReferenceSequenceId()).isEqualTo(UPDATED_REFERENCE_SEQUENCE_ID);
        assertThat(testTranscript.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void patchNonExistingTranscript() throws Exception {
        int databaseSizeBeforeUpdate = transcriptRepository.findAll().size();
        transcript.setId(count.incrementAndGet());

        // Create the Transcript
        TranscriptDTO transcriptDTO = transcriptMapper.toDto(transcript);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTranscriptMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, transcriptDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(transcriptDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Transcript in the database
        List<Transcript> transcriptList = transcriptRepository.findAll();
        assertThat(transcriptList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTranscript() throws Exception {
        int databaseSizeBeforeUpdate = transcriptRepository.findAll().size();
        transcript.setId(count.incrementAndGet());

        // Create the Transcript
        TranscriptDTO transcriptDTO = transcriptMapper.toDto(transcript);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTranscriptMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(transcriptDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Transcript in the database
        List<Transcript> transcriptList = transcriptRepository.findAll();
        assertThat(transcriptList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTranscript() throws Exception {
        int databaseSizeBeforeUpdate = transcriptRepository.findAll().size();
        transcript.setId(count.incrementAndGet());

        // Create the Transcript
        TranscriptDTO transcriptDTO = transcriptMapper.toDto(transcript);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTranscriptMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(transcriptDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Transcript in the database
        List<Transcript> transcriptList = transcriptRepository.findAll();
        assertThat(transcriptList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTranscript() throws Exception {
        // Initialize the database
        transcriptRepository.saveAndFlush(transcript);

        int databaseSizeBeforeDelete = transcriptRepository.findAll().size();

        // Delete the transcript
        restTranscriptMockMvc
            .perform(delete(ENTITY_API_URL_ID, transcript.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Transcript> transcriptList = transcriptRepository.findAll();
        assertThat(transcriptList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
