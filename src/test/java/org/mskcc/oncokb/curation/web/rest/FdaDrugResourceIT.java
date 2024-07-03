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
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.domain.FdaDrug;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.repository.FdaDrugRepository;
import org.mskcc.oncokb.curation.service.criteria.FdaDrugCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link FdaDrugResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class FdaDrugResourceIT {

    private static final String DEFAULT_APPLICATION_NUMBER = "AAAAAAAAAA";
    private static final String UPDATED_APPLICATION_NUMBER = "BBBBBBBBBB";

    private static final String DEFAULT_SPONSOR_NAME = "AAAAAAAAAA";
    private static final String UPDATED_SPONSOR_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_OVERALL_MARKETING_STATUS = "AAAAAAAAAA";
    private static final String UPDATED_OVERALL_MARKETING_STATUS = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/fda-drugs";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private FdaDrugRepository fdaDrugRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restFdaDrugMockMvc;

    private FdaDrug fdaDrug;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FdaDrug createEntity(EntityManager em) {
        FdaDrug fdaDrug = new FdaDrug()
            .applicationNumber(DEFAULT_APPLICATION_NUMBER)
            .sponsorName(DEFAULT_SPONSOR_NAME)
            .overallMarketingStatus(DEFAULT_OVERALL_MARKETING_STATUS);
        return fdaDrug;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FdaDrug createUpdatedEntity(EntityManager em) {
        FdaDrug fdaDrug = new FdaDrug()
            .applicationNumber(UPDATED_APPLICATION_NUMBER)
            .sponsorName(UPDATED_SPONSOR_NAME)
            .overallMarketingStatus(UPDATED_OVERALL_MARKETING_STATUS);
        return fdaDrug;
    }

    @BeforeEach
    public void initTest() {
        fdaDrug = createEntity(em);
    }

    @Test
    @Transactional
    void createFdaDrug() throws Exception {
        int databaseSizeBeforeCreate = fdaDrugRepository.findAll().size();
        // Create the FdaDrug
        restFdaDrugMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaDrug))
            )
            .andExpect(status().isCreated());

        // Validate the FdaDrug in the database
        List<FdaDrug> fdaDrugList = fdaDrugRepository.findAll();
        assertThat(fdaDrugList).hasSize(databaseSizeBeforeCreate + 1);
        FdaDrug testFdaDrug = fdaDrugList.get(fdaDrugList.size() - 1);
        assertThat(testFdaDrug.getApplicationNumber()).isEqualTo(DEFAULT_APPLICATION_NUMBER);
        assertThat(testFdaDrug.getSponsorName()).isEqualTo(DEFAULT_SPONSOR_NAME);
        assertThat(testFdaDrug.getOverallMarketingStatus()).isEqualTo(DEFAULT_OVERALL_MARKETING_STATUS);
    }

    @Test
    @Transactional
    void createFdaDrugWithExistingId() throws Exception {
        // Create the FdaDrug with an existing ID
        fdaDrug.setId(1L);

        int databaseSizeBeforeCreate = fdaDrugRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restFdaDrugMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaDrug))
            )
            .andExpect(status().isBadRequest());

        // Validate the FdaDrug in the database
        List<FdaDrug> fdaDrugList = fdaDrugRepository.findAll();
        assertThat(fdaDrugList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkApplicationNumberIsRequired() throws Exception {
        int databaseSizeBeforeTest = fdaDrugRepository.findAll().size();
        // set the field null
        fdaDrug.setApplicationNumber(null);

        // Create the FdaDrug, which fails.

        restFdaDrugMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaDrug))
            )
            .andExpect(status().isBadRequest());

        List<FdaDrug> fdaDrugList = fdaDrugRepository.findAll();
        assertThat(fdaDrugList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllFdaDrugs() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList
        restFdaDrugMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(fdaDrug.getId().intValue())))
            .andExpect(jsonPath("$.[*].applicationNumber").value(hasItem(DEFAULT_APPLICATION_NUMBER)))
            .andExpect(jsonPath("$.[*].sponsorName").value(hasItem(DEFAULT_SPONSOR_NAME)))
            .andExpect(jsonPath("$.[*].overallMarketingStatus").value(hasItem(DEFAULT_OVERALL_MARKETING_STATUS)));
    }

    @Test
    @Transactional
    void getFdaDrug() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get the fdaDrug
        restFdaDrugMockMvc
            .perform(get(ENTITY_API_URL_ID, fdaDrug.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(fdaDrug.getId().intValue()))
            .andExpect(jsonPath("$.applicationNumber").value(DEFAULT_APPLICATION_NUMBER))
            .andExpect(jsonPath("$.sponsorName").value(DEFAULT_SPONSOR_NAME))
            .andExpect(jsonPath("$.overallMarketingStatus").value(DEFAULT_OVERALL_MARKETING_STATUS));
    }

    @Test
    @Transactional
    void getFdaDrugsByIdFiltering() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        Long id = fdaDrug.getId();

        defaultFdaDrugShouldBeFound("id.equals=" + id);
        defaultFdaDrugShouldNotBeFound("id.notEquals=" + id);

        defaultFdaDrugShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultFdaDrugShouldNotBeFound("id.greaterThan=" + id);

        defaultFdaDrugShouldBeFound("id.lessThanOrEqual=" + id);
        defaultFdaDrugShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllFdaDrugsByApplicationNumberIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where applicationNumber equals to DEFAULT_APPLICATION_NUMBER
        defaultFdaDrugShouldBeFound("applicationNumber.equals=" + DEFAULT_APPLICATION_NUMBER);

        // Get all the fdaDrugList where applicationNumber equals to UPDATED_APPLICATION_NUMBER
        defaultFdaDrugShouldNotBeFound("applicationNumber.equals=" + UPDATED_APPLICATION_NUMBER);
    }

    @Test
    @Transactional
    void getAllFdaDrugsByApplicationNumberIsNotEqualToSomething() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where applicationNumber not equals to DEFAULT_APPLICATION_NUMBER
        defaultFdaDrugShouldNotBeFound("applicationNumber.notEquals=" + DEFAULT_APPLICATION_NUMBER);

        // Get all the fdaDrugList where applicationNumber not equals to UPDATED_APPLICATION_NUMBER
        defaultFdaDrugShouldBeFound("applicationNumber.notEquals=" + UPDATED_APPLICATION_NUMBER);
    }

    @Test
    @Transactional
    void getAllFdaDrugsByApplicationNumberIsInShouldWork() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where applicationNumber in DEFAULT_APPLICATION_NUMBER or UPDATED_APPLICATION_NUMBER
        defaultFdaDrugShouldBeFound("applicationNumber.in=" + DEFAULT_APPLICATION_NUMBER + "," + UPDATED_APPLICATION_NUMBER);

        // Get all the fdaDrugList where applicationNumber equals to UPDATED_APPLICATION_NUMBER
        defaultFdaDrugShouldNotBeFound("applicationNumber.in=" + UPDATED_APPLICATION_NUMBER);
    }

    @Test
    @Transactional
    void getAllFdaDrugsByApplicationNumberIsNullOrNotNull() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where applicationNumber is not null
        defaultFdaDrugShouldBeFound("applicationNumber.specified=true");

        // Get all the fdaDrugList where applicationNumber is null
        defaultFdaDrugShouldNotBeFound("applicationNumber.specified=false");
    }

    @Test
    @Transactional
    void getAllFdaDrugsByApplicationNumberContainsSomething() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where applicationNumber contains DEFAULT_APPLICATION_NUMBER
        defaultFdaDrugShouldBeFound("applicationNumber.contains=" + DEFAULT_APPLICATION_NUMBER);

        // Get all the fdaDrugList where applicationNumber contains UPDATED_APPLICATION_NUMBER
        defaultFdaDrugShouldNotBeFound("applicationNumber.contains=" + UPDATED_APPLICATION_NUMBER);
    }

    @Test
    @Transactional
    void getAllFdaDrugsByApplicationNumberNotContainsSomething() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where applicationNumber does not contain DEFAULT_APPLICATION_NUMBER
        defaultFdaDrugShouldNotBeFound("applicationNumber.doesNotContain=" + DEFAULT_APPLICATION_NUMBER);

        // Get all the fdaDrugList where applicationNumber does not contain UPDATED_APPLICATION_NUMBER
        defaultFdaDrugShouldBeFound("applicationNumber.doesNotContain=" + UPDATED_APPLICATION_NUMBER);
    }

    @Test
    @Transactional
    void getAllFdaDrugsBySponsorNameIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where sponsorName equals to DEFAULT_SPONSOR_NAME
        defaultFdaDrugShouldBeFound("sponsorName.equals=" + DEFAULT_SPONSOR_NAME);

        // Get all the fdaDrugList where sponsorName equals to UPDATED_SPONSOR_NAME
        defaultFdaDrugShouldNotBeFound("sponsorName.equals=" + UPDATED_SPONSOR_NAME);
    }

    @Test
    @Transactional
    void getAllFdaDrugsBySponsorNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where sponsorName not equals to DEFAULT_SPONSOR_NAME
        defaultFdaDrugShouldNotBeFound("sponsorName.notEquals=" + DEFAULT_SPONSOR_NAME);

        // Get all the fdaDrugList where sponsorName not equals to UPDATED_SPONSOR_NAME
        defaultFdaDrugShouldBeFound("sponsorName.notEquals=" + UPDATED_SPONSOR_NAME);
    }

    @Test
    @Transactional
    void getAllFdaDrugsBySponsorNameIsInShouldWork() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where sponsorName in DEFAULT_SPONSOR_NAME or UPDATED_SPONSOR_NAME
        defaultFdaDrugShouldBeFound("sponsorName.in=" + DEFAULT_SPONSOR_NAME + "," + UPDATED_SPONSOR_NAME);

        // Get all the fdaDrugList where sponsorName equals to UPDATED_SPONSOR_NAME
        defaultFdaDrugShouldNotBeFound("sponsorName.in=" + UPDATED_SPONSOR_NAME);
    }

    @Test
    @Transactional
    void getAllFdaDrugsBySponsorNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where sponsorName is not null
        defaultFdaDrugShouldBeFound("sponsorName.specified=true");

        // Get all the fdaDrugList where sponsorName is null
        defaultFdaDrugShouldNotBeFound("sponsorName.specified=false");
    }

    @Test
    @Transactional
    void getAllFdaDrugsBySponsorNameContainsSomething() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where sponsorName contains DEFAULT_SPONSOR_NAME
        defaultFdaDrugShouldBeFound("sponsorName.contains=" + DEFAULT_SPONSOR_NAME);

        // Get all the fdaDrugList where sponsorName contains UPDATED_SPONSOR_NAME
        defaultFdaDrugShouldNotBeFound("sponsorName.contains=" + UPDATED_SPONSOR_NAME);
    }

    @Test
    @Transactional
    void getAllFdaDrugsBySponsorNameNotContainsSomething() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where sponsorName does not contain DEFAULT_SPONSOR_NAME
        defaultFdaDrugShouldNotBeFound("sponsorName.doesNotContain=" + DEFAULT_SPONSOR_NAME);

        // Get all the fdaDrugList where sponsorName does not contain UPDATED_SPONSOR_NAME
        defaultFdaDrugShouldBeFound("sponsorName.doesNotContain=" + UPDATED_SPONSOR_NAME);
    }

    @Test
    @Transactional
    void getAllFdaDrugsByOverallMarketingStatusIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where overallMarketingStatus equals to DEFAULT_OVERALL_MARKETING_STATUS
        defaultFdaDrugShouldBeFound("overallMarketingStatus.equals=" + DEFAULT_OVERALL_MARKETING_STATUS);

        // Get all the fdaDrugList where overallMarketingStatus equals to UPDATED_OVERALL_MARKETING_STATUS
        defaultFdaDrugShouldNotBeFound("overallMarketingStatus.equals=" + UPDATED_OVERALL_MARKETING_STATUS);
    }

    @Test
    @Transactional
    void getAllFdaDrugsByOverallMarketingStatusIsNotEqualToSomething() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where overallMarketingStatus not equals to DEFAULT_OVERALL_MARKETING_STATUS
        defaultFdaDrugShouldNotBeFound("overallMarketingStatus.notEquals=" + DEFAULT_OVERALL_MARKETING_STATUS);

        // Get all the fdaDrugList where overallMarketingStatus not equals to UPDATED_OVERALL_MARKETING_STATUS
        defaultFdaDrugShouldBeFound("overallMarketingStatus.notEquals=" + UPDATED_OVERALL_MARKETING_STATUS);
    }

    @Test
    @Transactional
    void getAllFdaDrugsByOverallMarketingStatusIsInShouldWork() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where overallMarketingStatus in DEFAULT_OVERALL_MARKETING_STATUS or UPDATED_OVERALL_MARKETING_STATUS
        defaultFdaDrugShouldBeFound(
            "overallMarketingStatus.in=" + DEFAULT_OVERALL_MARKETING_STATUS + "," + UPDATED_OVERALL_MARKETING_STATUS
        );

        // Get all the fdaDrugList where overallMarketingStatus equals to UPDATED_OVERALL_MARKETING_STATUS
        defaultFdaDrugShouldNotBeFound("overallMarketingStatus.in=" + UPDATED_OVERALL_MARKETING_STATUS);
    }

    @Test
    @Transactional
    void getAllFdaDrugsByOverallMarketingStatusIsNullOrNotNull() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where overallMarketingStatus is not null
        defaultFdaDrugShouldBeFound("overallMarketingStatus.specified=true");

        // Get all the fdaDrugList where overallMarketingStatus is null
        defaultFdaDrugShouldNotBeFound("overallMarketingStatus.specified=false");
    }

    @Test
    @Transactional
    void getAllFdaDrugsByOverallMarketingStatusContainsSomething() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where overallMarketingStatus contains DEFAULT_OVERALL_MARKETING_STATUS
        defaultFdaDrugShouldBeFound("overallMarketingStatus.contains=" + DEFAULT_OVERALL_MARKETING_STATUS);

        // Get all the fdaDrugList where overallMarketingStatus contains UPDATED_OVERALL_MARKETING_STATUS
        defaultFdaDrugShouldNotBeFound("overallMarketingStatus.contains=" + UPDATED_OVERALL_MARKETING_STATUS);
    }

    @Test
    @Transactional
    void getAllFdaDrugsByOverallMarketingStatusNotContainsSomething() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        // Get all the fdaDrugList where overallMarketingStatus does not contain DEFAULT_OVERALL_MARKETING_STATUS
        defaultFdaDrugShouldNotBeFound("overallMarketingStatus.doesNotContain=" + DEFAULT_OVERALL_MARKETING_STATUS);

        // Get all the fdaDrugList where overallMarketingStatus does not contain UPDATED_OVERALL_MARKETING_STATUS
        defaultFdaDrugShouldBeFound("overallMarketingStatus.doesNotContain=" + UPDATED_OVERALL_MARKETING_STATUS);
    }

    @Test
    @Transactional
    void getAllFdaDrugsByFdaSubmissionIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);
        FdaSubmission fdaSubmission;
        if (TestUtil.findAll(em, FdaSubmission.class).isEmpty()) {
            fdaSubmission = FdaSubmissionResourceIT.createEntity(em);
            em.persist(fdaSubmission);
            em.flush();
        } else {
            fdaSubmission = TestUtil.findAll(em, FdaSubmission.class).get(0);
        }
        em.persist(fdaSubmission);
        em.flush();
        fdaDrug.addFdaSubmission(fdaSubmission);
        fdaDrugRepository.saveAndFlush(fdaDrug);
        Long fdaSubmissionId = fdaSubmission.getId();

        // Get all the fdaDrugList where fdaSubmission equals to fdaSubmissionId
        defaultFdaDrugShouldBeFound("fdaSubmissionId.equals=" + fdaSubmissionId);

        // Get all the fdaDrugList where fdaSubmission equals to (fdaSubmissionId + 1)
        defaultFdaDrugShouldNotBeFound("fdaSubmissionId.equals=" + (fdaSubmissionId + 1));
    }

    @Test
    @Transactional
    void getAllFdaDrugsByDrugIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);
        Drug drug;
        if (TestUtil.findAll(em, Drug.class).isEmpty()) {
            drug = DrugResourceIT.createEntity(em);
            em.persist(drug);
            em.flush();
        } else {
            drug = TestUtil.findAll(em, Drug.class).get(0);
        }
        em.persist(drug);
        em.flush();
        fdaDrug.setDrug(drug);
        fdaDrugRepository.saveAndFlush(fdaDrug);
        Long drugId = drug.getId();

        // Get all the fdaDrugList where drug equals to drugId
        defaultFdaDrugShouldBeFound("drugId.equals=" + drugId);

        // Get all the fdaDrugList where drug equals to (drugId + 1)
        defaultFdaDrugShouldNotBeFound("drugId.equals=" + (drugId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultFdaDrugShouldBeFound(String filter) throws Exception {
        restFdaDrugMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(fdaDrug.getId().intValue())))
            .andExpect(jsonPath("$.[*].applicationNumber").value(hasItem(DEFAULT_APPLICATION_NUMBER)))
            .andExpect(jsonPath("$.[*].sponsorName").value(hasItem(DEFAULT_SPONSOR_NAME)))
            .andExpect(jsonPath("$.[*].overallMarketingStatus").value(hasItem(DEFAULT_OVERALL_MARKETING_STATUS)));

        // Check, that the count call also returns 1
        restFdaDrugMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultFdaDrugShouldNotBeFound(String filter) throws Exception {
        restFdaDrugMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restFdaDrugMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingFdaDrug() throws Exception {
        // Get the fdaDrug
        restFdaDrugMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewFdaDrug() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        int databaseSizeBeforeUpdate = fdaDrugRepository.findAll().size();

        // Update the fdaDrug
        FdaDrug updatedFdaDrug = fdaDrugRepository.findById(fdaDrug.getId()).get();
        // Disconnect from session so that the updates on updatedFdaDrug are not directly saved in db
        em.detach(updatedFdaDrug);
        updatedFdaDrug
            .applicationNumber(UPDATED_APPLICATION_NUMBER)
            .sponsorName(UPDATED_SPONSOR_NAME)
            .overallMarketingStatus(UPDATED_OVERALL_MARKETING_STATUS);

        restFdaDrugMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedFdaDrug.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedFdaDrug))
            )
            .andExpect(status().isOk());

        // Validate the FdaDrug in the database
        List<FdaDrug> fdaDrugList = fdaDrugRepository.findAll();
        assertThat(fdaDrugList).hasSize(databaseSizeBeforeUpdate);
        FdaDrug testFdaDrug = fdaDrugList.get(fdaDrugList.size() - 1);
        assertThat(testFdaDrug.getApplicationNumber()).isEqualTo(UPDATED_APPLICATION_NUMBER);
        assertThat(testFdaDrug.getSponsorName()).isEqualTo(UPDATED_SPONSOR_NAME);
        assertThat(testFdaDrug.getOverallMarketingStatus()).isEqualTo(UPDATED_OVERALL_MARKETING_STATUS);
    }

    @Test
    @Transactional
    void putNonExistingFdaDrug() throws Exception {
        int databaseSizeBeforeUpdate = fdaDrugRepository.findAll().size();
        fdaDrug.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFdaDrugMockMvc
            .perform(
                put(ENTITY_API_URL_ID, fdaDrug.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaDrug))
            )
            .andExpect(status().isBadRequest());

        // Validate the FdaDrug in the database
        List<FdaDrug> fdaDrugList = fdaDrugRepository.findAll();
        assertThat(fdaDrugList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchFdaDrug() throws Exception {
        int databaseSizeBeforeUpdate = fdaDrugRepository.findAll().size();
        fdaDrug.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFdaDrugMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaDrug))
            )
            .andExpect(status().isBadRequest());

        // Validate the FdaDrug in the database
        List<FdaDrug> fdaDrugList = fdaDrugRepository.findAll();
        assertThat(fdaDrugList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamFdaDrug() throws Exception {
        int databaseSizeBeforeUpdate = fdaDrugRepository.findAll().size();
        fdaDrug.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFdaDrugMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(fdaDrug))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the FdaDrug in the database
        List<FdaDrug> fdaDrugList = fdaDrugRepository.findAll();
        assertThat(fdaDrugList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateFdaDrugWithPatch() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        int databaseSizeBeforeUpdate = fdaDrugRepository.findAll().size();

        // Update the fdaDrug using partial update
        FdaDrug partialUpdatedFdaDrug = new FdaDrug();
        partialUpdatedFdaDrug.setId(fdaDrug.getId());

        partialUpdatedFdaDrug.applicationNumber(UPDATED_APPLICATION_NUMBER).overallMarketingStatus(UPDATED_OVERALL_MARKETING_STATUS);

        restFdaDrugMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFdaDrug.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedFdaDrug))
            )
            .andExpect(status().isOk());

        // Validate the FdaDrug in the database
        List<FdaDrug> fdaDrugList = fdaDrugRepository.findAll();
        assertThat(fdaDrugList).hasSize(databaseSizeBeforeUpdate);
        FdaDrug testFdaDrug = fdaDrugList.get(fdaDrugList.size() - 1);
        assertThat(testFdaDrug.getApplicationNumber()).isEqualTo(UPDATED_APPLICATION_NUMBER);
        assertThat(testFdaDrug.getSponsorName()).isEqualTo(DEFAULT_SPONSOR_NAME);
        assertThat(testFdaDrug.getOverallMarketingStatus()).isEqualTo(UPDATED_OVERALL_MARKETING_STATUS);
    }

    @Test
    @Transactional
    void fullUpdateFdaDrugWithPatch() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        int databaseSizeBeforeUpdate = fdaDrugRepository.findAll().size();

        // Update the fdaDrug using partial update
        FdaDrug partialUpdatedFdaDrug = new FdaDrug();
        partialUpdatedFdaDrug.setId(fdaDrug.getId());

        partialUpdatedFdaDrug
            .applicationNumber(UPDATED_APPLICATION_NUMBER)
            .sponsorName(UPDATED_SPONSOR_NAME)
            .overallMarketingStatus(UPDATED_OVERALL_MARKETING_STATUS);

        restFdaDrugMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFdaDrug.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedFdaDrug))
            )
            .andExpect(status().isOk());

        // Validate the FdaDrug in the database
        List<FdaDrug> fdaDrugList = fdaDrugRepository.findAll();
        assertThat(fdaDrugList).hasSize(databaseSizeBeforeUpdate);
        FdaDrug testFdaDrug = fdaDrugList.get(fdaDrugList.size() - 1);
        assertThat(testFdaDrug.getApplicationNumber()).isEqualTo(UPDATED_APPLICATION_NUMBER);
        assertThat(testFdaDrug.getSponsorName()).isEqualTo(UPDATED_SPONSOR_NAME);
        assertThat(testFdaDrug.getOverallMarketingStatus()).isEqualTo(UPDATED_OVERALL_MARKETING_STATUS);
    }

    @Test
    @Transactional
    void patchNonExistingFdaDrug() throws Exception {
        int databaseSizeBeforeUpdate = fdaDrugRepository.findAll().size();
        fdaDrug.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFdaDrugMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, fdaDrug.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(fdaDrug))
            )
            .andExpect(status().isBadRequest());

        // Validate the FdaDrug in the database
        List<FdaDrug> fdaDrugList = fdaDrugRepository.findAll();
        assertThat(fdaDrugList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchFdaDrug() throws Exception {
        int databaseSizeBeforeUpdate = fdaDrugRepository.findAll().size();
        fdaDrug.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFdaDrugMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(fdaDrug))
            )
            .andExpect(status().isBadRequest());

        // Validate the FdaDrug in the database
        List<FdaDrug> fdaDrugList = fdaDrugRepository.findAll();
        assertThat(fdaDrugList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamFdaDrug() throws Exception {
        int databaseSizeBeforeUpdate = fdaDrugRepository.findAll().size();
        fdaDrug.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFdaDrugMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(fdaDrug))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the FdaDrug in the database
        List<FdaDrug> fdaDrugList = fdaDrugRepository.findAll();
        assertThat(fdaDrugList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteFdaDrug() throws Exception {
        // Initialize the database
        fdaDrugRepository.saveAndFlush(fdaDrug);

        int databaseSizeBeforeDelete = fdaDrugRepository.findAll().size();

        // Delete the fdaDrug
        restFdaDrugMockMvc
            .perform(delete(ENTITY_API_URL_ID, fdaDrug.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<FdaDrug> fdaDrugList = fdaDrugRepository.findAll();
        assertThat(fdaDrugList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
