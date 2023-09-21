package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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
import org.mskcc.oncokb.curation.domain.Flag;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.Transcript;
import org.mskcc.oncokb.curation.repository.FlagRepository;
import org.mskcc.oncokb.curation.service.criteria.FlagCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;

/**
 * Integration tests for the {@link FlagResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class FlagResourceIT {

    private static final String DEFAULT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_FLAG = "AAAAAAAAAA";
    private static final String UPDATED_FLAG = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/flags";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private FlagRepository flagRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restFlagMockMvc;

    private Flag flag;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Flag createEntity(EntityManager em) {
        Flag flag = new Flag().type(DEFAULT_TYPE).flag(DEFAULT_FLAG).name(DEFAULT_NAME).description(DEFAULT_DESCRIPTION);
        return flag;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Flag createUpdatedEntity(EntityManager em) {
        Flag flag = new Flag().type(UPDATED_TYPE).flag(UPDATED_FLAG).name(UPDATED_NAME).description(UPDATED_DESCRIPTION);
        return flag;
    }

    @BeforeEach
    public void initTest() {
        flag = createEntity(em);
    }

    @Test
    @Transactional
    void createFlag() throws Exception {
        int databaseSizeBeforeCreate = flagRepository.findAll().size();
        // Create the Flag
        restFlagMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(flag))
            )
            .andExpect(status().isCreated());

        // Validate the Flag in the database
        List<Flag> flagList = flagRepository.findAll();
        assertThat(flagList).hasSize(databaseSizeBeforeCreate + 1);
        Flag testFlag = flagList.get(flagList.size() - 1);
        assertThat(testFlag.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testFlag.getFlag()).isEqualTo(DEFAULT_FLAG);
        assertThat(testFlag.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testFlag.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void createFlagWithExistingId() throws Exception {
        // Create the Flag with an existing ID
        flag.setId(1L);

        int databaseSizeBeforeCreate = flagRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restFlagMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(flag))
            )
            .andExpect(status().isBadRequest());

        // Validate the Flag in the database
        List<Flag> flagList = flagRepository.findAll();
        assertThat(flagList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = flagRepository.findAll().size();
        // set the field null
        flag.setType(null);

        // Create the Flag, which fails.

        restFlagMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(flag))
            )
            .andExpect(status().isBadRequest());

        List<Flag> flagList = flagRepository.findAll();
        assertThat(flagList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkFlagIsRequired() throws Exception {
        int databaseSizeBeforeTest = flagRepository.findAll().size();
        // set the field null
        flag.setFlag(null);

        // Create the Flag, which fails.

        restFlagMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(flag))
            )
            .andExpect(status().isBadRequest());

        List<Flag> flagList = flagRepository.findAll();
        assertThat(flagList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = flagRepository.findAll().size();
        // set the field null
        flag.setName(null);

        // Create the Flag, which fails.

        restFlagMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(flag))
            )
            .andExpect(status().isBadRequest());

        List<Flag> flagList = flagRepository.findAll();
        assertThat(flagList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllFlags() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList
        restFlagMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(flag.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE)))
            .andExpect(jsonPath("$.[*].flag").value(hasItem(DEFAULT_FLAG)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())));
    }

    @Test
    @Transactional
    void getFlag() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get the flag
        restFlagMockMvc
            .perform(get(ENTITY_API_URL_ID, flag.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(flag.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE))
            .andExpect(jsonPath("$.flag").value(DEFAULT_FLAG))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()));
    }

    @Test
    @Transactional
    void getFlagsByIdFiltering() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        Long id = flag.getId();

        defaultFlagShouldBeFound("id.equals=" + id);
        defaultFlagShouldNotBeFound("id.notEquals=" + id);

        defaultFlagShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultFlagShouldNotBeFound("id.greaterThan=" + id);

        defaultFlagShouldBeFound("id.lessThanOrEqual=" + id);
        defaultFlagShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllFlagsByTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where type equals to DEFAULT_TYPE
        defaultFlagShouldBeFound("type.equals=" + DEFAULT_TYPE);

        // Get all the flagList where type equals to UPDATED_TYPE
        defaultFlagShouldNotBeFound("type.equals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllFlagsByTypeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where type not equals to DEFAULT_TYPE
        defaultFlagShouldNotBeFound("type.notEquals=" + DEFAULT_TYPE);

        // Get all the flagList where type not equals to UPDATED_TYPE
        defaultFlagShouldBeFound("type.notEquals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllFlagsByTypeIsInShouldWork() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where type in DEFAULT_TYPE or UPDATED_TYPE
        defaultFlagShouldBeFound("type.in=" + DEFAULT_TYPE + "," + UPDATED_TYPE);

        // Get all the flagList where type equals to UPDATED_TYPE
        defaultFlagShouldNotBeFound("type.in=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllFlagsByTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where type is not null
        defaultFlagShouldBeFound("type.specified=true");

        // Get all the flagList where type is null
        defaultFlagShouldNotBeFound("type.specified=false");
    }

    @Test
    @Transactional
    void getAllFlagsByTypeContainsSomething() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where type contains DEFAULT_TYPE
        defaultFlagShouldBeFound("type.contains=" + DEFAULT_TYPE);

        // Get all the flagList where type contains UPDATED_TYPE
        defaultFlagShouldNotBeFound("type.contains=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllFlagsByTypeNotContainsSomething() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where type does not contain DEFAULT_TYPE
        defaultFlagShouldNotBeFound("type.doesNotContain=" + DEFAULT_TYPE);

        // Get all the flagList where type does not contain UPDATED_TYPE
        defaultFlagShouldBeFound("type.doesNotContain=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllFlagsByFlagIsEqualToSomething() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where flag equals to DEFAULT_FLAG
        defaultFlagShouldBeFound("flag.equals=" + DEFAULT_FLAG);

        // Get all the flagList where flag equals to UPDATED_FLAG
        defaultFlagShouldNotBeFound("flag.equals=" + UPDATED_FLAG);
    }

    @Test
    @Transactional
    void getAllFlagsByFlagIsNotEqualToSomething() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where flag not equals to DEFAULT_FLAG
        defaultFlagShouldNotBeFound("flag.notEquals=" + DEFAULT_FLAG);

        // Get all the flagList where flag not equals to UPDATED_FLAG
        defaultFlagShouldBeFound("flag.notEquals=" + UPDATED_FLAG);
    }

    @Test
    @Transactional
    void getAllFlagsByFlagIsInShouldWork() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where flag in DEFAULT_FLAG or UPDATED_FLAG
        defaultFlagShouldBeFound("flag.in=" + DEFAULT_FLAG + "," + UPDATED_FLAG);

        // Get all the flagList where flag equals to UPDATED_FLAG
        defaultFlagShouldNotBeFound("flag.in=" + UPDATED_FLAG);
    }

    @Test
    @Transactional
    void getAllFlagsByFlagIsNullOrNotNull() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where flag is not null
        defaultFlagShouldBeFound("flag.specified=true");

        // Get all the flagList where flag is null
        defaultFlagShouldNotBeFound("flag.specified=false");
    }

    @Test
    @Transactional
    void getAllFlagsByFlagContainsSomething() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where flag contains DEFAULT_FLAG
        defaultFlagShouldBeFound("flag.contains=" + DEFAULT_FLAG);

        // Get all the flagList where flag contains UPDATED_FLAG
        defaultFlagShouldNotBeFound("flag.contains=" + UPDATED_FLAG);
    }

    @Test
    @Transactional
    void getAllFlagsByFlagNotContainsSomething() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where flag does not contain DEFAULT_FLAG
        defaultFlagShouldNotBeFound("flag.doesNotContain=" + DEFAULT_FLAG);

        // Get all the flagList where flag does not contain UPDATED_FLAG
        defaultFlagShouldBeFound("flag.doesNotContain=" + UPDATED_FLAG);
    }

    @Test
    @Transactional
    void getAllFlagsByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where name equals to DEFAULT_NAME
        defaultFlagShouldBeFound("name.equals=" + DEFAULT_NAME);

        // Get all the flagList where name equals to UPDATED_NAME
        defaultFlagShouldNotBeFound("name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllFlagsByNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where name not equals to DEFAULT_NAME
        defaultFlagShouldNotBeFound("name.notEquals=" + DEFAULT_NAME);

        // Get all the flagList where name not equals to UPDATED_NAME
        defaultFlagShouldBeFound("name.notEquals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllFlagsByNameIsInShouldWork() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where name in DEFAULT_NAME or UPDATED_NAME
        defaultFlagShouldBeFound("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME);

        // Get all the flagList where name equals to UPDATED_NAME
        defaultFlagShouldNotBeFound("name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllFlagsByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where name is not null
        defaultFlagShouldBeFound("name.specified=true");

        // Get all the flagList where name is null
        defaultFlagShouldNotBeFound("name.specified=false");
    }

    @Test
    @Transactional
    void getAllFlagsByNameContainsSomething() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where name contains DEFAULT_NAME
        defaultFlagShouldBeFound("name.contains=" + DEFAULT_NAME);

        // Get all the flagList where name contains UPDATED_NAME
        defaultFlagShouldNotBeFound("name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllFlagsByNameNotContainsSomething() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        // Get all the flagList where name does not contain DEFAULT_NAME
        defaultFlagShouldNotBeFound("name.doesNotContain=" + DEFAULT_NAME);

        // Get all the flagList where name does not contain UPDATED_NAME
        defaultFlagShouldBeFound("name.doesNotContain=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllFlagsByTranscriptIsEqualToSomething() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);
        Transcript transcript;
        if (TestUtil.findAll(em, Transcript.class).isEmpty()) {
            transcript = TranscriptResourceIT.createEntity(em);
            em.persist(transcript);
            em.flush();
        } else {
            transcript = TestUtil.findAll(em, Transcript.class).get(0);
        }
        em.persist(transcript);
        em.flush();
        flag.addTranscript(transcript);
        flagRepository.saveAndFlush(flag);
        Long transcriptId = transcript.getId();

        // Get all the flagList where transcript equals to transcriptId
        defaultFlagShouldBeFound("transcriptId.equals=" + transcriptId);

        // Get all the flagList where transcript equals to (transcriptId + 1)
        defaultFlagShouldNotBeFound("transcriptId.equals=" + (transcriptId + 1));
    }

    @Test
    @Transactional
    void getAllFlagsByGeneIsEqualToSomething() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);
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
        flag.addGene(gene);
        flagRepository.saveAndFlush(flag);
        Long geneId = gene.getId();

        // Get all the flagList where gene equals to geneId
        defaultFlagShouldBeFound("geneId.equals=" + geneId);

        // Get all the flagList where gene equals to (geneId + 1)
        defaultFlagShouldNotBeFound("geneId.equals=" + (geneId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultFlagShouldBeFound(String filter) throws Exception {
        restFlagMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(flag.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE)))
            .andExpect(jsonPath("$.[*].flag").value(hasItem(DEFAULT_FLAG)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())));

        // Check, that the count call also returns 1
        restFlagMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultFlagShouldNotBeFound(String filter) throws Exception {
        restFlagMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restFlagMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingFlag() throws Exception {
        // Get the flag
        restFlagMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewFlag() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        int databaseSizeBeforeUpdate = flagRepository.findAll().size();

        // Update the flag
        Flag updatedFlag = flagRepository.findById(flag.getId()).get();
        // Disconnect from session so that the updates on updatedFlag are not directly saved in db
        em.detach(updatedFlag);
        updatedFlag.type(UPDATED_TYPE).flag(UPDATED_FLAG).name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restFlagMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedFlag.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedFlag))
            )
            .andExpect(status().isOk());

        // Validate the Flag in the database
        List<Flag> flagList = flagRepository.findAll();
        assertThat(flagList).hasSize(databaseSizeBeforeUpdate);
        Flag testFlag = flagList.get(flagList.size() - 1);
        assertThat(testFlag.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testFlag.getFlag()).isEqualTo(UPDATED_FLAG);
        assertThat(testFlag.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testFlag.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void putNonExistingFlag() throws Exception {
        int databaseSizeBeforeUpdate = flagRepository.findAll().size();
        flag.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFlagMockMvc
            .perform(
                put(ENTITY_API_URL_ID, flag.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(flag))
            )
            .andExpect(status().isBadRequest());

        // Validate the Flag in the database
        List<Flag> flagList = flagRepository.findAll();
        assertThat(flagList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchFlag() throws Exception {
        int databaseSizeBeforeUpdate = flagRepository.findAll().size();
        flag.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFlagMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(flag))
            )
            .andExpect(status().isBadRequest());

        // Validate the Flag in the database
        List<Flag> flagList = flagRepository.findAll();
        assertThat(flagList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamFlag() throws Exception {
        int databaseSizeBeforeUpdate = flagRepository.findAll().size();
        flag.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFlagMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(flag))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Flag in the database
        List<Flag> flagList = flagRepository.findAll();
        assertThat(flagList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateFlagWithPatch() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        int databaseSizeBeforeUpdate = flagRepository.findAll().size();

        // Update the flag using partial update
        Flag partialUpdatedFlag = new Flag();
        partialUpdatedFlag.setId(flag.getId());

        partialUpdatedFlag.type(UPDATED_TYPE).description(UPDATED_DESCRIPTION);

        restFlagMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFlag.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedFlag))
            )
            .andExpect(status().isOk());

        // Validate the Flag in the database
        List<Flag> flagList = flagRepository.findAll();
        assertThat(flagList).hasSize(databaseSizeBeforeUpdate);
        Flag testFlag = flagList.get(flagList.size() - 1);
        assertThat(testFlag.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testFlag.getFlag()).isEqualTo(DEFAULT_FLAG);
        assertThat(testFlag.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testFlag.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void fullUpdateFlagWithPatch() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        int databaseSizeBeforeUpdate = flagRepository.findAll().size();

        // Update the flag using partial update
        Flag partialUpdatedFlag = new Flag();
        partialUpdatedFlag.setId(flag.getId());

        partialUpdatedFlag.type(UPDATED_TYPE).flag(UPDATED_FLAG).name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restFlagMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFlag.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedFlag))
            )
            .andExpect(status().isOk());

        // Validate the Flag in the database
        List<Flag> flagList = flagRepository.findAll();
        assertThat(flagList).hasSize(databaseSizeBeforeUpdate);
        Flag testFlag = flagList.get(flagList.size() - 1);
        assertThat(testFlag.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testFlag.getFlag()).isEqualTo(UPDATED_FLAG);
        assertThat(testFlag.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testFlag.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void patchNonExistingFlag() throws Exception {
        int databaseSizeBeforeUpdate = flagRepository.findAll().size();
        flag.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFlagMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, flag.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(flag))
            )
            .andExpect(status().isBadRequest());

        // Validate the Flag in the database
        List<Flag> flagList = flagRepository.findAll();
        assertThat(flagList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchFlag() throws Exception {
        int databaseSizeBeforeUpdate = flagRepository.findAll().size();
        flag.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFlagMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(flag))
            )
            .andExpect(status().isBadRequest());

        // Validate the Flag in the database
        List<Flag> flagList = flagRepository.findAll();
        assertThat(flagList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamFlag() throws Exception {
        int databaseSizeBeforeUpdate = flagRepository.findAll().size();
        flag.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFlagMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(flag))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Flag in the database
        List<Flag> flagList = flagRepository.findAll();
        assertThat(flagList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteFlag() throws Exception {
        // Initialize the database
        flagRepository.saveAndFlush(flag);

        int databaseSizeBeforeDelete = flagRepository.findAll().size();

        // Delete the flag
        restFlagMockMvc
            .perform(delete(ENTITY_API_URL_ID, flag.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Flag> flagList = flagRepository.findAll();
        assertThat(flagList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
