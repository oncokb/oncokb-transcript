package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.oncokb.curation.IntegrationTest;
import org.mskcc.oncokb.curation.domain.Association;
import org.mskcc.oncokb.curation.domain.Evidence;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.LevelOfEvidence;
import org.mskcc.oncokb.curation.repository.EvidenceRepository;
import org.mskcc.oncokb.curation.service.EvidenceService;
import org.mskcc.oncokb.curation.service.criteria.EvidenceCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;

/**
 * Integration tests for the {@link EvidenceResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class EvidenceResourceIT {

    private static final String DEFAULT_UUID = "AAAAAAAAAA";
    private static final String UPDATED_UUID = "BBBBBBBBBB";

    private static final String DEFAULT_EVIDENCE_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_EVIDENCE_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_KNOWN_EFFECT = "AAAAAAAAAA";
    private static final String UPDATED_KNOWN_EFFECT = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String DEFAULT_NOTE = "AAAAAAAAAA";
    private static final String UPDATED_NOTE = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/evidences";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private EvidenceRepository evidenceRepository;

    @Mock
    private EvidenceRepository evidenceRepositoryMock;

    @Mock
    private EvidenceService evidenceServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restEvidenceMockMvc;

    private Evidence evidence;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Evidence createEntity(EntityManager em) {
        Evidence evidence = new Evidence()
            .uuid(DEFAULT_UUID)
            .evidenceType(DEFAULT_EVIDENCE_TYPE)
            .knownEffect(DEFAULT_KNOWN_EFFECT)
            .description(DEFAULT_DESCRIPTION)
            .note(DEFAULT_NOTE);
        return evidence;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Evidence createUpdatedEntity(EntityManager em) {
        Evidence evidence = new Evidence()
            .uuid(UPDATED_UUID)
            .evidenceType(UPDATED_EVIDENCE_TYPE)
            .knownEffect(UPDATED_KNOWN_EFFECT)
            .description(UPDATED_DESCRIPTION)
            .note(UPDATED_NOTE);
        return evidence;
    }

    @BeforeEach
    public void initTest() {
        evidence = createEntity(em);
    }

    @Test
    @Transactional
    void createEvidence() throws Exception {
        int databaseSizeBeforeCreate = evidenceRepository.findAll().size();
        // Create the Evidence
        restEvidenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(evidence))
            )
            .andExpect(status().isCreated());

        // Validate the Evidence in the database
        List<Evidence> evidenceList = evidenceRepository.findAll();
        assertThat(evidenceList).hasSize(databaseSizeBeforeCreate + 1);
        Evidence testEvidence = evidenceList.get(evidenceList.size() - 1);
        assertThat(testEvidence.getUuid()).isEqualTo(DEFAULT_UUID);
        assertThat(testEvidence.getEvidenceType()).isEqualTo(DEFAULT_EVIDENCE_TYPE);
        assertThat(testEvidence.getKnownEffect()).isEqualTo(DEFAULT_KNOWN_EFFECT);
        assertThat(testEvidence.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testEvidence.getNote()).isEqualTo(DEFAULT_NOTE);
    }

    @Test
    @Transactional
    void createEvidenceWithExistingId() throws Exception {
        // Create the Evidence with an existing ID
        evidence.setId(1L);

        int databaseSizeBeforeCreate = evidenceRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restEvidenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(evidence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Evidence in the database
        List<Evidence> evidenceList = evidenceRepository.findAll();
        assertThat(evidenceList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkEvidenceTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = evidenceRepository.findAll().size();
        // set the field null
        evidence.setEvidenceType(null);

        // Create the Evidence, which fails.

        restEvidenceMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(evidence))
            )
            .andExpect(status().isBadRequest());

        List<Evidence> evidenceList = evidenceRepository.findAll();
        assertThat(evidenceList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllEvidences() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList
        restEvidenceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(evidence.getId().intValue())))
            .andExpect(jsonPath("$.[*].uuid").value(hasItem(DEFAULT_UUID)))
            .andExpect(jsonPath("$.[*].evidenceType").value(hasItem(DEFAULT_EVIDENCE_TYPE)))
            .andExpect(jsonPath("$.[*].knownEffect").value(hasItem(DEFAULT_KNOWN_EFFECT)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
            .andExpect(jsonPath("$.[*].note").value(hasItem(DEFAULT_NOTE.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllEvidencesWithEagerRelationshipsIsEnabled() throws Exception {
        when(evidenceServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restEvidenceMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(evidenceServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllEvidencesWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(evidenceServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restEvidenceMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(evidenceServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getEvidence() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get the evidence
        restEvidenceMockMvc
            .perform(get(ENTITY_API_URL_ID, evidence.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(evidence.getId().intValue()))
            .andExpect(jsonPath("$.uuid").value(DEFAULT_UUID))
            .andExpect(jsonPath("$.evidenceType").value(DEFAULT_EVIDENCE_TYPE))
            .andExpect(jsonPath("$.knownEffect").value(DEFAULT_KNOWN_EFFECT))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.note").value(DEFAULT_NOTE.toString()));
    }

    @Test
    @Transactional
    void getEvidencesByIdFiltering() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        Long id = evidence.getId();

        defaultEvidenceShouldBeFound("id.equals=" + id);
        defaultEvidenceShouldNotBeFound("id.notEquals=" + id);

        defaultEvidenceShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultEvidenceShouldNotBeFound("id.greaterThan=" + id);

        defaultEvidenceShouldBeFound("id.lessThanOrEqual=" + id);
        defaultEvidenceShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllEvidencesByUuidIsEqualToSomething() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where uuid equals to DEFAULT_UUID
        defaultEvidenceShouldBeFound("uuid.equals=" + DEFAULT_UUID);

        // Get all the evidenceList where uuid equals to UPDATED_UUID
        defaultEvidenceShouldNotBeFound("uuid.equals=" + UPDATED_UUID);
    }

    @Test
    @Transactional
    void getAllEvidencesByUuidIsNotEqualToSomething() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where uuid not equals to DEFAULT_UUID
        defaultEvidenceShouldNotBeFound("uuid.notEquals=" + DEFAULT_UUID);

        // Get all the evidenceList where uuid not equals to UPDATED_UUID
        defaultEvidenceShouldBeFound("uuid.notEquals=" + UPDATED_UUID);
    }

    @Test
    @Transactional
    void getAllEvidencesByUuidIsInShouldWork() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where uuid in DEFAULT_UUID or UPDATED_UUID
        defaultEvidenceShouldBeFound("uuid.in=" + DEFAULT_UUID + "," + UPDATED_UUID);

        // Get all the evidenceList where uuid equals to UPDATED_UUID
        defaultEvidenceShouldNotBeFound("uuid.in=" + UPDATED_UUID);
    }

    @Test
    @Transactional
    void getAllEvidencesByUuidIsNullOrNotNull() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where uuid is not null
        defaultEvidenceShouldBeFound("uuid.specified=true");

        // Get all the evidenceList where uuid is null
        defaultEvidenceShouldNotBeFound("uuid.specified=false");
    }

    @Test
    @Transactional
    void getAllEvidencesByUuidContainsSomething() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where uuid contains DEFAULT_UUID
        defaultEvidenceShouldBeFound("uuid.contains=" + DEFAULT_UUID);

        // Get all the evidenceList where uuid contains UPDATED_UUID
        defaultEvidenceShouldNotBeFound("uuid.contains=" + UPDATED_UUID);
    }

    @Test
    @Transactional
    void getAllEvidencesByUuidNotContainsSomething() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where uuid does not contain DEFAULT_UUID
        defaultEvidenceShouldNotBeFound("uuid.doesNotContain=" + DEFAULT_UUID);

        // Get all the evidenceList where uuid does not contain UPDATED_UUID
        defaultEvidenceShouldBeFound("uuid.doesNotContain=" + UPDATED_UUID);
    }

    @Test
    @Transactional
    void getAllEvidencesByEvidenceTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where evidenceType equals to DEFAULT_EVIDENCE_TYPE
        defaultEvidenceShouldBeFound("evidenceType.equals=" + DEFAULT_EVIDENCE_TYPE);

        // Get all the evidenceList where evidenceType equals to UPDATED_EVIDENCE_TYPE
        defaultEvidenceShouldNotBeFound("evidenceType.equals=" + UPDATED_EVIDENCE_TYPE);
    }

    @Test
    @Transactional
    void getAllEvidencesByEvidenceTypeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where evidenceType not equals to DEFAULT_EVIDENCE_TYPE
        defaultEvidenceShouldNotBeFound("evidenceType.notEquals=" + DEFAULT_EVIDENCE_TYPE);

        // Get all the evidenceList where evidenceType not equals to UPDATED_EVIDENCE_TYPE
        defaultEvidenceShouldBeFound("evidenceType.notEquals=" + UPDATED_EVIDENCE_TYPE);
    }

    @Test
    @Transactional
    void getAllEvidencesByEvidenceTypeIsInShouldWork() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where evidenceType in DEFAULT_EVIDENCE_TYPE or UPDATED_EVIDENCE_TYPE
        defaultEvidenceShouldBeFound("evidenceType.in=" + DEFAULT_EVIDENCE_TYPE + "," + UPDATED_EVIDENCE_TYPE);

        // Get all the evidenceList where evidenceType equals to UPDATED_EVIDENCE_TYPE
        defaultEvidenceShouldNotBeFound("evidenceType.in=" + UPDATED_EVIDENCE_TYPE);
    }

    @Test
    @Transactional
    void getAllEvidencesByEvidenceTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where evidenceType is not null
        defaultEvidenceShouldBeFound("evidenceType.specified=true");

        // Get all the evidenceList where evidenceType is null
        defaultEvidenceShouldNotBeFound("evidenceType.specified=false");
    }

    @Test
    @Transactional
    void getAllEvidencesByEvidenceTypeContainsSomething() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where evidenceType contains DEFAULT_EVIDENCE_TYPE
        defaultEvidenceShouldBeFound("evidenceType.contains=" + DEFAULT_EVIDENCE_TYPE);

        // Get all the evidenceList where evidenceType contains UPDATED_EVIDENCE_TYPE
        defaultEvidenceShouldNotBeFound("evidenceType.contains=" + UPDATED_EVIDENCE_TYPE);
    }

    @Test
    @Transactional
    void getAllEvidencesByEvidenceTypeNotContainsSomething() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where evidenceType does not contain DEFAULT_EVIDENCE_TYPE
        defaultEvidenceShouldNotBeFound("evidenceType.doesNotContain=" + DEFAULT_EVIDENCE_TYPE);

        // Get all the evidenceList where evidenceType does not contain UPDATED_EVIDENCE_TYPE
        defaultEvidenceShouldBeFound("evidenceType.doesNotContain=" + UPDATED_EVIDENCE_TYPE);
    }

    @Test
    @Transactional
    void getAllEvidencesByKnownEffectIsEqualToSomething() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where knownEffect equals to DEFAULT_KNOWN_EFFECT
        defaultEvidenceShouldBeFound("knownEffect.equals=" + DEFAULT_KNOWN_EFFECT);

        // Get all the evidenceList where knownEffect equals to UPDATED_KNOWN_EFFECT
        defaultEvidenceShouldNotBeFound("knownEffect.equals=" + UPDATED_KNOWN_EFFECT);
    }

    @Test
    @Transactional
    void getAllEvidencesByKnownEffectIsNotEqualToSomething() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where knownEffect not equals to DEFAULT_KNOWN_EFFECT
        defaultEvidenceShouldNotBeFound("knownEffect.notEquals=" + DEFAULT_KNOWN_EFFECT);

        // Get all the evidenceList where knownEffect not equals to UPDATED_KNOWN_EFFECT
        defaultEvidenceShouldBeFound("knownEffect.notEquals=" + UPDATED_KNOWN_EFFECT);
    }

    @Test
    @Transactional
    void getAllEvidencesByKnownEffectIsInShouldWork() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where knownEffect in DEFAULT_KNOWN_EFFECT or UPDATED_KNOWN_EFFECT
        defaultEvidenceShouldBeFound("knownEffect.in=" + DEFAULT_KNOWN_EFFECT + "," + UPDATED_KNOWN_EFFECT);

        // Get all the evidenceList where knownEffect equals to UPDATED_KNOWN_EFFECT
        defaultEvidenceShouldNotBeFound("knownEffect.in=" + UPDATED_KNOWN_EFFECT);
    }

    @Test
    @Transactional
    void getAllEvidencesByKnownEffectIsNullOrNotNull() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where knownEffect is not null
        defaultEvidenceShouldBeFound("knownEffect.specified=true");

        // Get all the evidenceList where knownEffect is null
        defaultEvidenceShouldNotBeFound("knownEffect.specified=false");
    }

    @Test
    @Transactional
    void getAllEvidencesByKnownEffectContainsSomething() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where knownEffect contains DEFAULT_KNOWN_EFFECT
        defaultEvidenceShouldBeFound("knownEffect.contains=" + DEFAULT_KNOWN_EFFECT);

        // Get all the evidenceList where knownEffect contains UPDATED_KNOWN_EFFECT
        defaultEvidenceShouldNotBeFound("knownEffect.contains=" + UPDATED_KNOWN_EFFECT);
    }

    @Test
    @Transactional
    void getAllEvidencesByKnownEffectNotContainsSomething() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        // Get all the evidenceList where knownEffect does not contain DEFAULT_KNOWN_EFFECT
        defaultEvidenceShouldNotBeFound("knownEffect.doesNotContain=" + DEFAULT_KNOWN_EFFECT);

        // Get all the evidenceList where knownEffect does not contain UPDATED_KNOWN_EFFECT
        defaultEvidenceShouldBeFound("knownEffect.doesNotContain=" + UPDATED_KNOWN_EFFECT);
    }

    @Test
    @Transactional
    void getAllEvidencesByAssociationIsEqualToSomething() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);
        Association association;
        if (TestUtil.findAll(em, Association.class).isEmpty()) {
            association = AssociationResourceIT.createEntity(em);
            em.persist(association);
            em.flush();
        } else {
            association = TestUtil.findAll(em, Association.class).get(0);
        }
        em.persist(association);
        em.flush();
        evidence.setAssociation(association);
        evidenceRepository.saveAndFlush(evidence);
        Long associationId = association.getId();

        // Get all the evidenceList where association equals to associationId
        defaultEvidenceShouldBeFound("associationId.equals=" + associationId);

        // Get all the evidenceList where association equals to (associationId + 1)
        defaultEvidenceShouldNotBeFound("associationId.equals=" + (associationId + 1));
    }

    @Test
    @Transactional
    void getAllEvidencesByLevelOfEvidenceIsEqualToSomething() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);
        LevelOfEvidence levelOfEvidence;
        if (TestUtil.findAll(em, LevelOfEvidence.class).isEmpty()) {
            levelOfEvidence = LevelOfEvidenceResourceIT.createEntity(em);
            em.persist(levelOfEvidence);
            em.flush();
        } else {
            levelOfEvidence = TestUtil.findAll(em, LevelOfEvidence.class).get(0);
        }
        em.persist(levelOfEvidence);
        em.flush();
        evidence.addLevelOfEvidence(levelOfEvidence);
        evidenceRepository.saveAndFlush(evidence);
        Long levelOfEvidenceId = levelOfEvidence.getId();

        // Get all the evidenceList where levelOfEvidence equals to levelOfEvidenceId
        defaultEvidenceShouldBeFound("levelOfEvidenceId.equals=" + levelOfEvidenceId);

        // Get all the evidenceList where levelOfEvidence equals to (levelOfEvidenceId + 1)
        defaultEvidenceShouldNotBeFound("levelOfEvidenceId.equals=" + (levelOfEvidenceId + 1));
    }

    @Test
    @Transactional
    void getAllEvidencesByGeneIsEqualToSomething() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);
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
        evidence.setGene(gene);
        evidenceRepository.saveAndFlush(evidence);
        Long geneId = gene.getId();

        // Get all the evidenceList where gene equals to geneId
        defaultEvidenceShouldBeFound("geneId.equals=" + geneId);

        // Get all the evidenceList where gene equals to (geneId + 1)
        defaultEvidenceShouldNotBeFound("geneId.equals=" + (geneId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultEvidenceShouldBeFound(String filter) throws Exception {
        restEvidenceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(evidence.getId().intValue())))
            .andExpect(jsonPath("$.[*].uuid").value(hasItem(DEFAULT_UUID)))
            .andExpect(jsonPath("$.[*].evidenceType").value(hasItem(DEFAULT_EVIDENCE_TYPE)))
            .andExpect(jsonPath("$.[*].knownEffect").value(hasItem(DEFAULT_KNOWN_EFFECT)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
            .andExpect(jsonPath("$.[*].note").value(hasItem(DEFAULT_NOTE.toString())));

        // Check, that the count call also returns 1
        restEvidenceMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultEvidenceShouldNotBeFound(String filter) throws Exception {
        restEvidenceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restEvidenceMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingEvidence() throws Exception {
        // Get the evidence
        restEvidenceMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewEvidence() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        int databaseSizeBeforeUpdate = evidenceRepository.findAll().size();

        // Update the evidence
        Evidence updatedEvidence = evidenceRepository.findById(evidence.getId()).get();
        // Disconnect from session so that the updates on updatedEvidence are not directly saved in db
        em.detach(updatedEvidence);
        updatedEvidence
            .uuid(UPDATED_UUID)
            .evidenceType(UPDATED_EVIDENCE_TYPE)
            .knownEffect(UPDATED_KNOWN_EFFECT)
            .description(UPDATED_DESCRIPTION)
            .note(UPDATED_NOTE);

        restEvidenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedEvidence.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedEvidence))
            )
            .andExpect(status().isOk());

        // Validate the Evidence in the database
        List<Evidence> evidenceList = evidenceRepository.findAll();
        assertThat(evidenceList).hasSize(databaseSizeBeforeUpdate);
        Evidence testEvidence = evidenceList.get(evidenceList.size() - 1);
        assertThat(testEvidence.getUuid()).isEqualTo(UPDATED_UUID);
        assertThat(testEvidence.getEvidenceType()).isEqualTo(UPDATED_EVIDENCE_TYPE);
        assertThat(testEvidence.getKnownEffect()).isEqualTo(UPDATED_KNOWN_EFFECT);
        assertThat(testEvidence.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testEvidence.getNote()).isEqualTo(UPDATED_NOTE);
    }

    @Test
    @Transactional
    void putNonExistingEvidence() throws Exception {
        int databaseSizeBeforeUpdate = evidenceRepository.findAll().size();
        evidence.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEvidenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, evidence.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(evidence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Evidence in the database
        List<Evidence> evidenceList = evidenceRepository.findAll();
        assertThat(evidenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchEvidence() throws Exception {
        int databaseSizeBeforeUpdate = evidenceRepository.findAll().size();
        evidence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEvidenceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(evidence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Evidence in the database
        List<Evidence> evidenceList = evidenceRepository.findAll();
        assertThat(evidenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamEvidence() throws Exception {
        int databaseSizeBeforeUpdate = evidenceRepository.findAll().size();
        evidence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEvidenceMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(evidence))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Evidence in the database
        List<Evidence> evidenceList = evidenceRepository.findAll();
        assertThat(evidenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateEvidenceWithPatch() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        int databaseSizeBeforeUpdate = evidenceRepository.findAll().size();

        // Update the evidence using partial update
        Evidence partialUpdatedEvidence = new Evidence();
        partialUpdatedEvidence.setId(evidence.getId());

        partialUpdatedEvidence.evidenceType(UPDATED_EVIDENCE_TYPE).knownEffect(UPDATED_KNOWN_EFFECT);

        restEvidenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEvidence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedEvidence))
            )
            .andExpect(status().isOk());

        // Validate the Evidence in the database
        List<Evidence> evidenceList = evidenceRepository.findAll();
        assertThat(evidenceList).hasSize(databaseSizeBeforeUpdate);
        Evidence testEvidence = evidenceList.get(evidenceList.size() - 1);
        assertThat(testEvidence.getUuid()).isEqualTo(DEFAULT_UUID);
        assertThat(testEvidence.getEvidenceType()).isEqualTo(UPDATED_EVIDENCE_TYPE);
        assertThat(testEvidence.getKnownEffect()).isEqualTo(UPDATED_KNOWN_EFFECT);
        assertThat(testEvidence.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testEvidence.getNote()).isEqualTo(DEFAULT_NOTE);
    }

    @Test
    @Transactional
    void fullUpdateEvidenceWithPatch() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        int databaseSizeBeforeUpdate = evidenceRepository.findAll().size();

        // Update the evidence using partial update
        Evidence partialUpdatedEvidence = new Evidence();
        partialUpdatedEvidence.setId(evidence.getId());

        partialUpdatedEvidence
            .uuid(UPDATED_UUID)
            .evidenceType(UPDATED_EVIDENCE_TYPE)
            .knownEffect(UPDATED_KNOWN_EFFECT)
            .description(UPDATED_DESCRIPTION)
            .note(UPDATED_NOTE);

        restEvidenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEvidence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedEvidence))
            )
            .andExpect(status().isOk());

        // Validate the Evidence in the database
        List<Evidence> evidenceList = evidenceRepository.findAll();
        assertThat(evidenceList).hasSize(databaseSizeBeforeUpdate);
        Evidence testEvidence = evidenceList.get(evidenceList.size() - 1);
        assertThat(testEvidence.getUuid()).isEqualTo(UPDATED_UUID);
        assertThat(testEvidence.getEvidenceType()).isEqualTo(UPDATED_EVIDENCE_TYPE);
        assertThat(testEvidence.getKnownEffect()).isEqualTo(UPDATED_KNOWN_EFFECT);
        assertThat(testEvidence.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testEvidence.getNote()).isEqualTo(UPDATED_NOTE);
    }

    @Test
    @Transactional
    void patchNonExistingEvidence() throws Exception {
        int databaseSizeBeforeUpdate = evidenceRepository.findAll().size();
        evidence.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEvidenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, evidence.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(evidence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Evidence in the database
        List<Evidence> evidenceList = evidenceRepository.findAll();
        assertThat(evidenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchEvidence() throws Exception {
        int databaseSizeBeforeUpdate = evidenceRepository.findAll().size();
        evidence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEvidenceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(evidence))
            )
            .andExpect(status().isBadRequest());

        // Validate the Evidence in the database
        List<Evidence> evidenceList = evidenceRepository.findAll();
        assertThat(evidenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamEvidence() throws Exception {
        int databaseSizeBeforeUpdate = evidenceRepository.findAll().size();
        evidence.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEvidenceMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(evidence))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Evidence in the database
        List<Evidence> evidenceList = evidenceRepository.findAll();
        assertThat(evidenceList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteEvidence() throws Exception {
        // Initialize the database
        evidenceRepository.saveAndFlush(evidence);

        int databaseSizeBeforeDelete = evidenceRepository.findAll().size();

        // Delete the evidence
        restEvidenceMockMvc
            .perform(delete(ENTITY_API_URL_ID, evidence.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Evidence> evidenceList = evidenceRepository.findAll();
        assertThat(evidenceList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
