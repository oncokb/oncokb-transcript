package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
import org.mskcc.oncokb.curation.domain.BiomarkerAssociation;
import org.mskcc.oncokb.curation.domain.CompanionDiagnosticDevice;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.domain.FdaSubmissionType;
import org.mskcc.oncokb.curation.repository.FdaSubmissionRepository;
import org.mskcc.oncokb.curation.service.criteria.FdaSubmissionCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;

/**
 * Integration tests for the {@link FdaSubmissionResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class FdaSubmissionResourceIT {

    private static final String DEFAULT_NUMBER = "AAAAAAAAAA";
    private static final String UPDATED_NUMBER = "BBBBBBBBBB";

    private static final String DEFAULT_SUPPLEMENT_NUMBER = "AAAAAAAAAA";
    private static final String UPDATED_SUPPLEMENT_NUMBER = "BBBBBBBBBB";

    private static final String DEFAULT_DEVICE_NAME = "AAAAAAAAAA";
    private static final String UPDATED_DEVICE_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_GENERIC_NAME = "AAAAAAAAAA";
    private static final String UPDATED_GENERIC_NAME = "BBBBBBBBBB";

    private static final Instant DEFAULT_DATE_RECEIVED = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_DATE_RECEIVED = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_DECISION_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_DECISION_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String DEFAULT_PLATFORM = "AAAAAAAAAA";
    private static final String UPDATED_PLATFORM = "BBBBBBBBBB";

    private static final Boolean DEFAULT_CURATED = false;
    private static final Boolean UPDATED_CURATED = true;

    private static final Boolean DEFAULT_GENETIC = false;
    private static final Boolean UPDATED_GENETIC = true;

    private static final String DEFAULT_ADDITIONAL_INFO = "AAAAAAAAAA";
    private static final String UPDATED_ADDITIONAL_INFO = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/fda-submissions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private FdaSubmissionRepository fdaSubmissionRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restFdaSubmissionMockMvc;

    private FdaSubmission fdaSubmission;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FdaSubmission createEntity(EntityManager em) {
        FdaSubmission fdaSubmission = new FdaSubmission()
            .number(DEFAULT_NUMBER)
            .supplementNumber(DEFAULT_SUPPLEMENT_NUMBER)
            .deviceName(DEFAULT_DEVICE_NAME)
            .genericName(DEFAULT_GENERIC_NAME)
            .dateReceived(DEFAULT_DATE_RECEIVED)
            .decisionDate(DEFAULT_DECISION_DATE)
            .description(DEFAULT_DESCRIPTION)
            .platform(DEFAULT_PLATFORM)
            .curated(DEFAULT_CURATED)
            .genetic(DEFAULT_GENETIC)
            .additionalInfo(DEFAULT_ADDITIONAL_INFO);
        return fdaSubmission;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FdaSubmission createUpdatedEntity(EntityManager em) {
        FdaSubmission fdaSubmission = new FdaSubmission()
            .number(UPDATED_NUMBER)
            .supplementNumber(UPDATED_SUPPLEMENT_NUMBER)
            .deviceName(UPDATED_DEVICE_NAME)
            .genericName(UPDATED_GENERIC_NAME)
            .dateReceived(UPDATED_DATE_RECEIVED)
            .decisionDate(UPDATED_DECISION_DATE)
            .description(UPDATED_DESCRIPTION)
            .platform(UPDATED_PLATFORM)
            .curated(UPDATED_CURATED)
            .genetic(UPDATED_GENETIC)
            .additionalInfo(UPDATED_ADDITIONAL_INFO);
        return fdaSubmission;
    }

    @BeforeEach
    public void initTest() {
        fdaSubmission = createEntity(em);
    }

    @Test
    @Transactional
    void createFdaSubmission() throws Exception {
        int databaseSizeBeforeCreate = fdaSubmissionRepository.findAll().size();
        // Create the FdaSubmission
        restFdaSubmissionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmission))
            )
            .andExpect(status().isCreated());

        // Validate the FdaSubmission in the database
        List<FdaSubmission> fdaSubmissionList = fdaSubmissionRepository.findAll();
        assertThat(fdaSubmissionList).hasSize(databaseSizeBeforeCreate + 1);
        FdaSubmission testFdaSubmission = fdaSubmissionList.get(fdaSubmissionList.size() - 1);
        assertThat(testFdaSubmission.getNumber()).isEqualTo(DEFAULT_NUMBER);
        assertThat(testFdaSubmission.getSupplementNumber()).isEqualTo(DEFAULT_SUPPLEMENT_NUMBER);
        assertThat(testFdaSubmission.getDeviceName()).isEqualTo(DEFAULT_DEVICE_NAME);
        assertThat(testFdaSubmission.getGenericName()).isEqualTo(DEFAULT_GENERIC_NAME);
        assertThat(testFdaSubmission.getDateReceived()).isEqualTo(DEFAULT_DATE_RECEIVED);
        assertThat(testFdaSubmission.getDecisionDate()).isEqualTo(DEFAULT_DECISION_DATE);
        assertThat(testFdaSubmission.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testFdaSubmission.getPlatform()).isEqualTo(DEFAULT_PLATFORM);
        assertThat(testFdaSubmission.getCurated()).isEqualTo(DEFAULT_CURATED);
        assertThat(testFdaSubmission.getGenetic()).isEqualTo(DEFAULT_GENETIC);
        assertThat(testFdaSubmission.getAdditionalInfo()).isEqualTo(DEFAULT_ADDITIONAL_INFO);
    }

    @Test
    @Transactional
    void createFdaSubmissionWithExistingId() throws Exception {
        // Create the FdaSubmission with an existing ID
        fdaSubmission.setId(1L);

        int databaseSizeBeforeCreate = fdaSubmissionRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restFdaSubmissionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmission))
            )
            .andExpect(status().isBadRequest());

        // Validate the FdaSubmission in the database
        List<FdaSubmission> fdaSubmissionList = fdaSubmissionRepository.findAll();
        assertThat(fdaSubmissionList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNumberIsRequired() throws Exception {
        int databaseSizeBeforeTest = fdaSubmissionRepository.findAll().size();
        // set the field null
        fdaSubmission.setNumber(null);

        // Create the FdaSubmission, which fails.

        restFdaSubmissionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmission))
            )
            .andExpect(status().isBadRequest());

        List<FdaSubmission> fdaSubmissionList = fdaSubmissionRepository.findAll();
        assertThat(fdaSubmissionList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCuratedIsRequired() throws Exception {
        int databaseSizeBeforeTest = fdaSubmissionRepository.findAll().size();
        // set the field null
        fdaSubmission.setCurated(null);

        // Create the FdaSubmission, which fails.

        restFdaSubmissionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmission))
            )
            .andExpect(status().isBadRequest());

        List<FdaSubmission> fdaSubmissionList = fdaSubmissionRepository.findAll();
        assertThat(fdaSubmissionList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkGeneticIsRequired() throws Exception {
        int databaseSizeBeforeTest = fdaSubmissionRepository.findAll().size();
        // set the field null
        fdaSubmission.setGenetic(null);

        // Create the FdaSubmission, which fails.

        restFdaSubmissionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmission))
            )
            .andExpect(status().isBadRequest());

        List<FdaSubmission> fdaSubmissionList = fdaSubmissionRepository.findAll();
        assertThat(fdaSubmissionList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllFdaSubmissions() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList
        restFdaSubmissionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(fdaSubmission.getId().intValue())))
            .andExpect(jsonPath("$.[*].number").value(hasItem(DEFAULT_NUMBER)))
            .andExpect(jsonPath("$.[*].supplementNumber").value(hasItem(DEFAULT_SUPPLEMENT_NUMBER)))
            .andExpect(jsonPath("$.[*].deviceName").value(hasItem(DEFAULT_DEVICE_NAME)))
            .andExpect(jsonPath("$.[*].genericName").value(hasItem(DEFAULT_GENERIC_NAME)))
            .andExpect(jsonPath("$.[*].dateReceived").value(hasItem(DEFAULT_DATE_RECEIVED.toString())))
            .andExpect(jsonPath("$.[*].decisionDate").value(hasItem(DEFAULT_DECISION_DATE.toString())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
            .andExpect(jsonPath("$.[*].platform").value(hasItem(DEFAULT_PLATFORM)))
            .andExpect(jsonPath("$.[*].curated").value(hasItem(DEFAULT_CURATED.booleanValue())))
            .andExpect(jsonPath("$.[*].genetic").value(hasItem(DEFAULT_GENETIC.booleanValue())))
            .andExpect(jsonPath("$.[*].additionalInfo").value(hasItem(DEFAULT_ADDITIONAL_INFO.toString())));
    }

    @Test
    @Transactional
    void getFdaSubmission() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get the fdaSubmission
        restFdaSubmissionMockMvc
            .perform(get(ENTITY_API_URL_ID, fdaSubmission.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(fdaSubmission.getId().intValue()))
            .andExpect(jsonPath("$.number").value(DEFAULT_NUMBER))
            .andExpect(jsonPath("$.supplementNumber").value(DEFAULT_SUPPLEMENT_NUMBER))
            .andExpect(jsonPath("$.deviceName").value(DEFAULT_DEVICE_NAME))
            .andExpect(jsonPath("$.genericName").value(DEFAULT_GENERIC_NAME))
            .andExpect(jsonPath("$.dateReceived").value(DEFAULT_DATE_RECEIVED.toString()))
            .andExpect(jsonPath("$.decisionDate").value(DEFAULT_DECISION_DATE.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()))
            .andExpect(jsonPath("$.platform").value(DEFAULT_PLATFORM))
            .andExpect(jsonPath("$.curated").value(DEFAULT_CURATED.booleanValue()))
            .andExpect(jsonPath("$.genetic").value(DEFAULT_GENETIC.booleanValue()))
            .andExpect(jsonPath("$.additionalInfo").value(DEFAULT_ADDITIONAL_INFO.toString()));
    }

    @Test
    @Transactional
    void getFdaSubmissionsByIdFiltering() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        Long id = fdaSubmission.getId();

        defaultFdaSubmissionShouldBeFound("id.equals=" + id);
        defaultFdaSubmissionShouldNotBeFound("id.notEquals=" + id);

        defaultFdaSubmissionShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultFdaSubmissionShouldNotBeFound("id.greaterThan=" + id);

        defaultFdaSubmissionShouldBeFound("id.lessThanOrEqual=" + id);
        defaultFdaSubmissionShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByNumberIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where number equals to DEFAULT_NUMBER
        defaultFdaSubmissionShouldBeFound("number.equals=" + DEFAULT_NUMBER);

        // Get all the fdaSubmissionList where number equals to UPDATED_NUMBER
        defaultFdaSubmissionShouldNotBeFound("number.equals=" + UPDATED_NUMBER);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByNumberIsNotEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where number not equals to DEFAULT_NUMBER
        defaultFdaSubmissionShouldNotBeFound("number.notEquals=" + DEFAULT_NUMBER);

        // Get all the fdaSubmissionList where number not equals to UPDATED_NUMBER
        defaultFdaSubmissionShouldBeFound("number.notEquals=" + UPDATED_NUMBER);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByNumberIsInShouldWork() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where number in DEFAULT_NUMBER or UPDATED_NUMBER
        defaultFdaSubmissionShouldBeFound("number.in=" + DEFAULT_NUMBER + "," + UPDATED_NUMBER);

        // Get all the fdaSubmissionList where number equals to UPDATED_NUMBER
        defaultFdaSubmissionShouldNotBeFound("number.in=" + UPDATED_NUMBER);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByNumberIsNullOrNotNull() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where number is not null
        defaultFdaSubmissionShouldBeFound("number.specified=true");

        // Get all the fdaSubmissionList where number is null
        defaultFdaSubmissionShouldNotBeFound("number.specified=false");
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByNumberContainsSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where number contains DEFAULT_NUMBER
        defaultFdaSubmissionShouldBeFound("number.contains=" + DEFAULT_NUMBER);

        // Get all the fdaSubmissionList where number contains UPDATED_NUMBER
        defaultFdaSubmissionShouldNotBeFound("number.contains=" + UPDATED_NUMBER);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByNumberNotContainsSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where number does not contain DEFAULT_NUMBER
        defaultFdaSubmissionShouldNotBeFound("number.doesNotContain=" + DEFAULT_NUMBER);

        // Get all the fdaSubmissionList where number does not contain UPDATED_NUMBER
        defaultFdaSubmissionShouldBeFound("number.doesNotContain=" + UPDATED_NUMBER);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsBySupplementNumberIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where supplementNumber equals to DEFAULT_SUPPLEMENT_NUMBER
        defaultFdaSubmissionShouldBeFound("supplementNumber.equals=" + DEFAULT_SUPPLEMENT_NUMBER);

        // Get all the fdaSubmissionList where supplementNumber equals to UPDATED_SUPPLEMENT_NUMBER
        defaultFdaSubmissionShouldNotBeFound("supplementNumber.equals=" + UPDATED_SUPPLEMENT_NUMBER);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsBySupplementNumberIsNotEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where supplementNumber not equals to DEFAULT_SUPPLEMENT_NUMBER
        defaultFdaSubmissionShouldNotBeFound("supplementNumber.notEquals=" + DEFAULT_SUPPLEMENT_NUMBER);

        // Get all the fdaSubmissionList where supplementNumber not equals to UPDATED_SUPPLEMENT_NUMBER
        defaultFdaSubmissionShouldBeFound("supplementNumber.notEquals=" + UPDATED_SUPPLEMENT_NUMBER);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsBySupplementNumberIsInShouldWork() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where supplementNumber in DEFAULT_SUPPLEMENT_NUMBER or UPDATED_SUPPLEMENT_NUMBER
        defaultFdaSubmissionShouldBeFound("supplementNumber.in=" + DEFAULT_SUPPLEMENT_NUMBER + "," + UPDATED_SUPPLEMENT_NUMBER);

        // Get all the fdaSubmissionList where supplementNumber equals to UPDATED_SUPPLEMENT_NUMBER
        defaultFdaSubmissionShouldNotBeFound("supplementNumber.in=" + UPDATED_SUPPLEMENT_NUMBER);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsBySupplementNumberIsNullOrNotNull() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where supplementNumber is not null
        defaultFdaSubmissionShouldBeFound("supplementNumber.specified=true");

        // Get all the fdaSubmissionList where supplementNumber is null
        defaultFdaSubmissionShouldNotBeFound("supplementNumber.specified=false");
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsBySupplementNumberContainsSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where supplementNumber contains DEFAULT_SUPPLEMENT_NUMBER
        defaultFdaSubmissionShouldBeFound("supplementNumber.contains=" + DEFAULT_SUPPLEMENT_NUMBER);

        // Get all the fdaSubmissionList where supplementNumber contains UPDATED_SUPPLEMENT_NUMBER
        defaultFdaSubmissionShouldNotBeFound("supplementNumber.contains=" + UPDATED_SUPPLEMENT_NUMBER);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsBySupplementNumberNotContainsSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where supplementNumber does not contain DEFAULT_SUPPLEMENT_NUMBER
        defaultFdaSubmissionShouldNotBeFound("supplementNumber.doesNotContain=" + DEFAULT_SUPPLEMENT_NUMBER);

        // Get all the fdaSubmissionList where supplementNumber does not contain UPDATED_SUPPLEMENT_NUMBER
        defaultFdaSubmissionShouldBeFound("supplementNumber.doesNotContain=" + UPDATED_SUPPLEMENT_NUMBER);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByDeviceNameIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where deviceName equals to DEFAULT_DEVICE_NAME
        defaultFdaSubmissionShouldBeFound("deviceName.equals=" + DEFAULT_DEVICE_NAME);

        // Get all the fdaSubmissionList where deviceName equals to UPDATED_DEVICE_NAME
        defaultFdaSubmissionShouldNotBeFound("deviceName.equals=" + UPDATED_DEVICE_NAME);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByDeviceNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where deviceName not equals to DEFAULT_DEVICE_NAME
        defaultFdaSubmissionShouldNotBeFound("deviceName.notEquals=" + DEFAULT_DEVICE_NAME);

        // Get all the fdaSubmissionList where deviceName not equals to UPDATED_DEVICE_NAME
        defaultFdaSubmissionShouldBeFound("deviceName.notEquals=" + UPDATED_DEVICE_NAME);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByDeviceNameIsInShouldWork() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where deviceName in DEFAULT_DEVICE_NAME or UPDATED_DEVICE_NAME
        defaultFdaSubmissionShouldBeFound("deviceName.in=" + DEFAULT_DEVICE_NAME + "," + UPDATED_DEVICE_NAME);

        // Get all the fdaSubmissionList where deviceName equals to UPDATED_DEVICE_NAME
        defaultFdaSubmissionShouldNotBeFound("deviceName.in=" + UPDATED_DEVICE_NAME);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByDeviceNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where deviceName is not null
        defaultFdaSubmissionShouldBeFound("deviceName.specified=true");

        // Get all the fdaSubmissionList where deviceName is null
        defaultFdaSubmissionShouldNotBeFound("deviceName.specified=false");
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByDeviceNameContainsSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where deviceName contains DEFAULT_DEVICE_NAME
        defaultFdaSubmissionShouldBeFound("deviceName.contains=" + DEFAULT_DEVICE_NAME);

        // Get all the fdaSubmissionList where deviceName contains UPDATED_DEVICE_NAME
        defaultFdaSubmissionShouldNotBeFound("deviceName.contains=" + UPDATED_DEVICE_NAME);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByDeviceNameNotContainsSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where deviceName does not contain DEFAULT_DEVICE_NAME
        defaultFdaSubmissionShouldNotBeFound("deviceName.doesNotContain=" + DEFAULT_DEVICE_NAME);

        // Get all the fdaSubmissionList where deviceName does not contain UPDATED_DEVICE_NAME
        defaultFdaSubmissionShouldBeFound("deviceName.doesNotContain=" + UPDATED_DEVICE_NAME);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByGenericNameIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where genericName equals to DEFAULT_GENERIC_NAME
        defaultFdaSubmissionShouldBeFound("genericName.equals=" + DEFAULT_GENERIC_NAME);

        // Get all the fdaSubmissionList where genericName equals to UPDATED_GENERIC_NAME
        defaultFdaSubmissionShouldNotBeFound("genericName.equals=" + UPDATED_GENERIC_NAME);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByGenericNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where genericName not equals to DEFAULT_GENERIC_NAME
        defaultFdaSubmissionShouldNotBeFound("genericName.notEquals=" + DEFAULT_GENERIC_NAME);

        // Get all the fdaSubmissionList where genericName not equals to UPDATED_GENERIC_NAME
        defaultFdaSubmissionShouldBeFound("genericName.notEquals=" + UPDATED_GENERIC_NAME);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByGenericNameIsInShouldWork() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where genericName in DEFAULT_GENERIC_NAME or UPDATED_GENERIC_NAME
        defaultFdaSubmissionShouldBeFound("genericName.in=" + DEFAULT_GENERIC_NAME + "," + UPDATED_GENERIC_NAME);

        // Get all the fdaSubmissionList where genericName equals to UPDATED_GENERIC_NAME
        defaultFdaSubmissionShouldNotBeFound("genericName.in=" + UPDATED_GENERIC_NAME);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByGenericNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where genericName is not null
        defaultFdaSubmissionShouldBeFound("genericName.specified=true");

        // Get all the fdaSubmissionList where genericName is null
        defaultFdaSubmissionShouldNotBeFound("genericName.specified=false");
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByGenericNameContainsSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where genericName contains DEFAULT_GENERIC_NAME
        defaultFdaSubmissionShouldBeFound("genericName.contains=" + DEFAULT_GENERIC_NAME);

        // Get all the fdaSubmissionList where genericName contains UPDATED_GENERIC_NAME
        defaultFdaSubmissionShouldNotBeFound("genericName.contains=" + UPDATED_GENERIC_NAME);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByGenericNameNotContainsSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where genericName does not contain DEFAULT_GENERIC_NAME
        defaultFdaSubmissionShouldNotBeFound("genericName.doesNotContain=" + DEFAULT_GENERIC_NAME);

        // Get all the fdaSubmissionList where genericName does not contain UPDATED_GENERIC_NAME
        defaultFdaSubmissionShouldBeFound("genericName.doesNotContain=" + UPDATED_GENERIC_NAME);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByDateReceivedIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where dateReceived equals to DEFAULT_DATE_RECEIVED
        defaultFdaSubmissionShouldBeFound("dateReceived.equals=" + DEFAULT_DATE_RECEIVED);

        // Get all the fdaSubmissionList where dateReceived equals to UPDATED_DATE_RECEIVED
        defaultFdaSubmissionShouldNotBeFound("dateReceived.equals=" + UPDATED_DATE_RECEIVED);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByDateReceivedIsNotEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where dateReceived not equals to DEFAULT_DATE_RECEIVED
        defaultFdaSubmissionShouldNotBeFound("dateReceived.notEquals=" + DEFAULT_DATE_RECEIVED);

        // Get all the fdaSubmissionList where dateReceived not equals to UPDATED_DATE_RECEIVED
        defaultFdaSubmissionShouldBeFound("dateReceived.notEquals=" + UPDATED_DATE_RECEIVED);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByDateReceivedIsInShouldWork() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where dateReceived in DEFAULT_DATE_RECEIVED or UPDATED_DATE_RECEIVED
        defaultFdaSubmissionShouldBeFound("dateReceived.in=" + DEFAULT_DATE_RECEIVED + "," + UPDATED_DATE_RECEIVED);

        // Get all the fdaSubmissionList where dateReceived equals to UPDATED_DATE_RECEIVED
        defaultFdaSubmissionShouldNotBeFound("dateReceived.in=" + UPDATED_DATE_RECEIVED);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByDateReceivedIsNullOrNotNull() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where dateReceived is not null
        defaultFdaSubmissionShouldBeFound("dateReceived.specified=true");

        // Get all the fdaSubmissionList where dateReceived is null
        defaultFdaSubmissionShouldNotBeFound("dateReceived.specified=false");
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByDecisionDateIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where decisionDate equals to DEFAULT_DECISION_DATE
        defaultFdaSubmissionShouldBeFound("decisionDate.equals=" + DEFAULT_DECISION_DATE);

        // Get all the fdaSubmissionList where decisionDate equals to UPDATED_DECISION_DATE
        defaultFdaSubmissionShouldNotBeFound("decisionDate.equals=" + UPDATED_DECISION_DATE);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByDecisionDateIsNotEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where decisionDate not equals to DEFAULT_DECISION_DATE
        defaultFdaSubmissionShouldNotBeFound("decisionDate.notEquals=" + DEFAULT_DECISION_DATE);

        // Get all the fdaSubmissionList where decisionDate not equals to UPDATED_DECISION_DATE
        defaultFdaSubmissionShouldBeFound("decisionDate.notEquals=" + UPDATED_DECISION_DATE);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByDecisionDateIsInShouldWork() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where decisionDate in DEFAULT_DECISION_DATE or UPDATED_DECISION_DATE
        defaultFdaSubmissionShouldBeFound("decisionDate.in=" + DEFAULT_DECISION_DATE + "," + UPDATED_DECISION_DATE);

        // Get all the fdaSubmissionList where decisionDate equals to UPDATED_DECISION_DATE
        defaultFdaSubmissionShouldNotBeFound("decisionDate.in=" + UPDATED_DECISION_DATE);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByDecisionDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where decisionDate is not null
        defaultFdaSubmissionShouldBeFound("decisionDate.specified=true");

        // Get all the fdaSubmissionList where decisionDate is null
        defaultFdaSubmissionShouldNotBeFound("decisionDate.specified=false");
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByPlatformIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where platform equals to DEFAULT_PLATFORM
        defaultFdaSubmissionShouldBeFound("platform.equals=" + DEFAULT_PLATFORM);

        // Get all the fdaSubmissionList where platform equals to UPDATED_PLATFORM
        defaultFdaSubmissionShouldNotBeFound("platform.equals=" + UPDATED_PLATFORM);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByPlatformIsNotEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where platform not equals to DEFAULT_PLATFORM
        defaultFdaSubmissionShouldNotBeFound("platform.notEquals=" + DEFAULT_PLATFORM);

        // Get all the fdaSubmissionList where platform not equals to UPDATED_PLATFORM
        defaultFdaSubmissionShouldBeFound("platform.notEquals=" + UPDATED_PLATFORM);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByPlatformIsInShouldWork() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where platform in DEFAULT_PLATFORM or UPDATED_PLATFORM
        defaultFdaSubmissionShouldBeFound("platform.in=" + DEFAULT_PLATFORM + "," + UPDATED_PLATFORM);

        // Get all the fdaSubmissionList where platform equals to UPDATED_PLATFORM
        defaultFdaSubmissionShouldNotBeFound("platform.in=" + UPDATED_PLATFORM);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByPlatformIsNullOrNotNull() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where platform is not null
        defaultFdaSubmissionShouldBeFound("platform.specified=true");

        // Get all the fdaSubmissionList where platform is null
        defaultFdaSubmissionShouldNotBeFound("platform.specified=false");
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByPlatformContainsSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where platform contains DEFAULT_PLATFORM
        defaultFdaSubmissionShouldBeFound("platform.contains=" + DEFAULT_PLATFORM);

        // Get all the fdaSubmissionList where platform contains UPDATED_PLATFORM
        defaultFdaSubmissionShouldNotBeFound("platform.contains=" + UPDATED_PLATFORM);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByPlatformNotContainsSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where platform does not contain DEFAULT_PLATFORM
        defaultFdaSubmissionShouldNotBeFound("platform.doesNotContain=" + DEFAULT_PLATFORM);

        // Get all the fdaSubmissionList where platform does not contain UPDATED_PLATFORM
        defaultFdaSubmissionShouldBeFound("platform.doesNotContain=" + UPDATED_PLATFORM);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByCuratedIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where curated equals to DEFAULT_CURATED
        defaultFdaSubmissionShouldBeFound("curated.equals=" + DEFAULT_CURATED);

        // Get all the fdaSubmissionList where curated equals to UPDATED_CURATED
        defaultFdaSubmissionShouldNotBeFound("curated.equals=" + UPDATED_CURATED);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByCuratedIsNotEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where curated not equals to DEFAULT_CURATED
        defaultFdaSubmissionShouldNotBeFound("curated.notEquals=" + DEFAULT_CURATED);

        // Get all the fdaSubmissionList where curated not equals to UPDATED_CURATED
        defaultFdaSubmissionShouldBeFound("curated.notEquals=" + UPDATED_CURATED);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByCuratedIsInShouldWork() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where curated in DEFAULT_CURATED or UPDATED_CURATED
        defaultFdaSubmissionShouldBeFound("curated.in=" + DEFAULT_CURATED + "," + UPDATED_CURATED);

        // Get all the fdaSubmissionList where curated equals to UPDATED_CURATED
        defaultFdaSubmissionShouldNotBeFound("curated.in=" + UPDATED_CURATED);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByCuratedIsNullOrNotNull() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where curated is not null
        defaultFdaSubmissionShouldBeFound("curated.specified=true");

        // Get all the fdaSubmissionList where curated is null
        defaultFdaSubmissionShouldNotBeFound("curated.specified=false");
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByGeneticIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where genetic equals to DEFAULT_GENETIC
        defaultFdaSubmissionShouldBeFound("genetic.equals=" + DEFAULT_GENETIC);

        // Get all the fdaSubmissionList where genetic equals to UPDATED_GENETIC
        defaultFdaSubmissionShouldNotBeFound("genetic.equals=" + UPDATED_GENETIC);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByGeneticIsNotEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where genetic not equals to DEFAULT_GENETIC
        defaultFdaSubmissionShouldNotBeFound("genetic.notEquals=" + DEFAULT_GENETIC);

        // Get all the fdaSubmissionList where genetic not equals to UPDATED_GENETIC
        defaultFdaSubmissionShouldBeFound("genetic.notEquals=" + UPDATED_GENETIC);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByGeneticIsInShouldWork() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where genetic in DEFAULT_GENETIC or UPDATED_GENETIC
        defaultFdaSubmissionShouldBeFound("genetic.in=" + DEFAULT_GENETIC + "," + UPDATED_GENETIC);

        // Get all the fdaSubmissionList where genetic equals to UPDATED_GENETIC
        defaultFdaSubmissionShouldNotBeFound("genetic.in=" + UPDATED_GENETIC);
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByGeneticIsNullOrNotNull() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        // Get all the fdaSubmissionList where genetic is not null
        defaultFdaSubmissionShouldBeFound("genetic.specified=true");

        // Get all the fdaSubmissionList where genetic is null
        defaultFdaSubmissionShouldNotBeFound("genetic.specified=false");
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByCompanionDiagnosticDeviceIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);
        CompanionDiagnosticDevice companionDiagnosticDevice;
        if (TestUtil.findAll(em, CompanionDiagnosticDevice.class).isEmpty()) {
            companionDiagnosticDevice = CompanionDiagnosticDeviceResourceIT.createEntity(em);
            em.persist(companionDiagnosticDevice);
            em.flush();
        } else {
            companionDiagnosticDevice = TestUtil.findAll(em, CompanionDiagnosticDevice.class).get(0);
        }
        em.persist(companionDiagnosticDevice);
        em.flush();
        fdaSubmission.setCompanionDiagnosticDevice(companionDiagnosticDevice);
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);
        Long companionDiagnosticDeviceId = companionDiagnosticDevice.getId();

        // Get all the fdaSubmissionList where companionDiagnosticDevice equals to companionDiagnosticDeviceId
        defaultFdaSubmissionShouldBeFound("companionDiagnosticDeviceId.equals=" + companionDiagnosticDeviceId);

        // Get all the fdaSubmissionList where companionDiagnosticDevice equals to (companionDiagnosticDeviceId + 1)
        defaultFdaSubmissionShouldNotBeFound("companionDiagnosticDeviceId.equals=" + (companionDiagnosticDeviceId + 1));
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);
        FdaSubmissionType type;
        if (TestUtil.findAll(em, FdaSubmissionType.class).isEmpty()) {
            type = FdaSubmissionTypeResourceIT.createEntity(em);
            em.persist(type);
            em.flush();
        } else {
            type = TestUtil.findAll(em, FdaSubmissionType.class).get(0);
        }
        em.persist(type);
        em.flush();
        fdaSubmission.setType(type);
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);
        Long typeId = type.getId();

        // Get all the fdaSubmissionList where type equals to typeId
        defaultFdaSubmissionShouldBeFound("typeId.equals=" + typeId);

        // Get all the fdaSubmissionList where type equals to (typeId + 1)
        defaultFdaSubmissionShouldNotBeFound("typeId.equals=" + (typeId + 1));
    }

    @Test
    @Transactional
    void getAllFdaSubmissionsByBiomarkerAssociationIsEqualToSomething() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);
        BiomarkerAssociation biomarkerAssociation;
        if (TestUtil.findAll(em, BiomarkerAssociation.class).isEmpty()) {
            biomarkerAssociation = BiomarkerAssociationResourceIT.createEntity(em);
            em.persist(biomarkerAssociation);
            em.flush();
        } else {
            biomarkerAssociation = TestUtil.findAll(em, BiomarkerAssociation.class).get(0);
        }
        em.persist(biomarkerAssociation);
        em.flush();
        fdaSubmission.addBiomarkerAssociation(biomarkerAssociation);
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);
        Long biomarkerAssociationId = biomarkerAssociation.getId();

        // Get all the fdaSubmissionList where biomarkerAssociation equals to biomarkerAssociationId
        defaultFdaSubmissionShouldBeFound("biomarkerAssociationId.equals=" + biomarkerAssociationId);

        // Get all the fdaSubmissionList where biomarkerAssociation equals to (biomarkerAssociationId + 1)
        defaultFdaSubmissionShouldNotBeFound("biomarkerAssociationId.equals=" + (biomarkerAssociationId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultFdaSubmissionShouldBeFound(String filter) throws Exception {
        restFdaSubmissionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(fdaSubmission.getId().intValue())))
            .andExpect(jsonPath("$.[*].number").value(hasItem(DEFAULT_NUMBER)))
            .andExpect(jsonPath("$.[*].supplementNumber").value(hasItem(DEFAULT_SUPPLEMENT_NUMBER)))
            .andExpect(jsonPath("$.[*].deviceName").value(hasItem(DEFAULT_DEVICE_NAME)))
            .andExpect(jsonPath("$.[*].genericName").value(hasItem(DEFAULT_GENERIC_NAME)))
            .andExpect(jsonPath("$.[*].dateReceived").value(hasItem(DEFAULT_DATE_RECEIVED.toString())))
            .andExpect(jsonPath("$.[*].decisionDate").value(hasItem(DEFAULT_DECISION_DATE.toString())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())))
            .andExpect(jsonPath("$.[*].platform").value(hasItem(DEFAULT_PLATFORM)))
            .andExpect(jsonPath("$.[*].curated").value(hasItem(DEFAULT_CURATED.booleanValue())))
            .andExpect(jsonPath("$.[*].genetic").value(hasItem(DEFAULT_GENETIC.booleanValue())))
            .andExpect(jsonPath("$.[*].additionalInfo").value(hasItem(DEFAULT_ADDITIONAL_INFO.toString())));

        // Check, that the count call also returns 1
        restFdaSubmissionMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultFdaSubmissionShouldNotBeFound(String filter) throws Exception {
        restFdaSubmissionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restFdaSubmissionMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingFdaSubmission() throws Exception {
        // Get the fdaSubmission
        restFdaSubmissionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewFdaSubmission() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        int databaseSizeBeforeUpdate = fdaSubmissionRepository.findAll().size();

        // Update the fdaSubmission
        FdaSubmission updatedFdaSubmission = fdaSubmissionRepository.findById(fdaSubmission.getId()).get();
        // Disconnect from session so that the updates on updatedFdaSubmission are not directly saved in db
        em.detach(updatedFdaSubmission);
        updatedFdaSubmission
            .number(UPDATED_NUMBER)
            .supplementNumber(UPDATED_SUPPLEMENT_NUMBER)
            .deviceName(UPDATED_DEVICE_NAME)
            .genericName(UPDATED_GENERIC_NAME)
            .dateReceived(UPDATED_DATE_RECEIVED)
            .decisionDate(UPDATED_DECISION_DATE)
            .description(UPDATED_DESCRIPTION)
            .platform(UPDATED_PLATFORM)
            .curated(UPDATED_CURATED)
            .genetic(UPDATED_GENETIC)
            .additionalInfo(UPDATED_ADDITIONAL_INFO);

        restFdaSubmissionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedFdaSubmission.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedFdaSubmission))
            )
            .andExpect(status().isOk());

        // Validate the FdaSubmission in the database
        List<FdaSubmission> fdaSubmissionList = fdaSubmissionRepository.findAll();
        assertThat(fdaSubmissionList).hasSize(databaseSizeBeforeUpdate);
        FdaSubmission testFdaSubmission = fdaSubmissionList.get(fdaSubmissionList.size() - 1);
        assertThat(testFdaSubmission.getNumber()).isEqualTo(UPDATED_NUMBER);
        assertThat(testFdaSubmission.getSupplementNumber()).isEqualTo(UPDATED_SUPPLEMENT_NUMBER);
        assertThat(testFdaSubmission.getDeviceName()).isEqualTo(UPDATED_DEVICE_NAME);
        assertThat(testFdaSubmission.getGenericName()).isEqualTo(UPDATED_GENERIC_NAME);
        assertThat(testFdaSubmission.getDateReceived()).isEqualTo(UPDATED_DATE_RECEIVED);
        assertThat(testFdaSubmission.getDecisionDate()).isEqualTo(UPDATED_DECISION_DATE);
        assertThat(testFdaSubmission.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testFdaSubmission.getPlatform()).isEqualTo(UPDATED_PLATFORM);
        assertThat(testFdaSubmission.getCurated()).isEqualTo(UPDATED_CURATED);
        assertThat(testFdaSubmission.getGenetic()).isEqualTo(UPDATED_GENETIC);
        assertThat(testFdaSubmission.getAdditionalInfo()).isEqualTo(UPDATED_ADDITIONAL_INFO);
    }

    @Test
    @Transactional
    void putNonExistingFdaSubmission() throws Exception {
        int databaseSizeBeforeUpdate = fdaSubmissionRepository.findAll().size();
        fdaSubmission.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFdaSubmissionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, fdaSubmission.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmission))
            )
            .andExpect(status().isBadRequest());

        // Validate the FdaSubmission in the database
        List<FdaSubmission> fdaSubmissionList = fdaSubmissionRepository.findAll();
        assertThat(fdaSubmissionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchFdaSubmission() throws Exception {
        int databaseSizeBeforeUpdate = fdaSubmissionRepository.findAll().size();
        fdaSubmission.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFdaSubmissionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmission))
            )
            .andExpect(status().isBadRequest());

        // Validate the FdaSubmission in the database
        List<FdaSubmission> fdaSubmissionList = fdaSubmissionRepository.findAll();
        assertThat(fdaSubmissionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamFdaSubmission() throws Exception {
        int databaseSizeBeforeUpdate = fdaSubmissionRepository.findAll().size();
        fdaSubmission.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFdaSubmissionMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmission))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the FdaSubmission in the database
        List<FdaSubmission> fdaSubmissionList = fdaSubmissionRepository.findAll();
        assertThat(fdaSubmissionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateFdaSubmissionWithPatch() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        int databaseSizeBeforeUpdate = fdaSubmissionRepository.findAll().size();

        // Update the fdaSubmission using partial update
        FdaSubmission partialUpdatedFdaSubmission = new FdaSubmission();
        partialUpdatedFdaSubmission.setId(fdaSubmission.getId());

        partialUpdatedFdaSubmission
            .supplementNumber(UPDATED_SUPPLEMENT_NUMBER)
            .deviceName(UPDATED_DEVICE_NAME)
            .dateReceived(UPDATED_DATE_RECEIVED)
            .decisionDate(UPDATED_DECISION_DATE)
            .curated(UPDATED_CURATED)
            .genetic(UPDATED_GENETIC);

        restFdaSubmissionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFdaSubmission.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedFdaSubmission))
            )
            .andExpect(status().isOk());

        // Validate the FdaSubmission in the database
        List<FdaSubmission> fdaSubmissionList = fdaSubmissionRepository.findAll();
        assertThat(fdaSubmissionList).hasSize(databaseSizeBeforeUpdate);
        FdaSubmission testFdaSubmission = fdaSubmissionList.get(fdaSubmissionList.size() - 1);
        assertThat(testFdaSubmission.getNumber()).isEqualTo(DEFAULT_NUMBER);
        assertThat(testFdaSubmission.getSupplementNumber()).isEqualTo(UPDATED_SUPPLEMENT_NUMBER);
        assertThat(testFdaSubmission.getDeviceName()).isEqualTo(UPDATED_DEVICE_NAME);
        assertThat(testFdaSubmission.getGenericName()).isEqualTo(DEFAULT_GENERIC_NAME);
        assertThat(testFdaSubmission.getDateReceived()).isEqualTo(UPDATED_DATE_RECEIVED);
        assertThat(testFdaSubmission.getDecisionDate()).isEqualTo(UPDATED_DECISION_DATE);
        assertThat(testFdaSubmission.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testFdaSubmission.getPlatform()).isEqualTo(DEFAULT_PLATFORM);
        assertThat(testFdaSubmission.getCurated()).isEqualTo(UPDATED_CURATED);
        assertThat(testFdaSubmission.getGenetic()).isEqualTo(UPDATED_GENETIC);
        assertThat(testFdaSubmission.getAdditionalInfo()).isEqualTo(DEFAULT_ADDITIONAL_INFO);
    }

    @Test
    @Transactional
    void fullUpdateFdaSubmissionWithPatch() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        int databaseSizeBeforeUpdate = fdaSubmissionRepository.findAll().size();

        // Update the fdaSubmission using partial update
        FdaSubmission partialUpdatedFdaSubmission = new FdaSubmission();
        partialUpdatedFdaSubmission.setId(fdaSubmission.getId());

        partialUpdatedFdaSubmission
            .number(UPDATED_NUMBER)
            .supplementNumber(UPDATED_SUPPLEMENT_NUMBER)
            .deviceName(UPDATED_DEVICE_NAME)
            .genericName(UPDATED_GENERIC_NAME)
            .dateReceived(UPDATED_DATE_RECEIVED)
            .decisionDate(UPDATED_DECISION_DATE)
            .description(UPDATED_DESCRIPTION)
            .platform(UPDATED_PLATFORM)
            .curated(UPDATED_CURATED)
            .genetic(UPDATED_GENETIC)
            .additionalInfo(UPDATED_ADDITIONAL_INFO);

        restFdaSubmissionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFdaSubmission.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedFdaSubmission))
            )
            .andExpect(status().isOk());

        // Validate the FdaSubmission in the database
        List<FdaSubmission> fdaSubmissionList = fdaSubmissionRepository.findAll();
        assertThat(fdaSubmissionList).hasSize(databaseSizeBeforeUpdate);
        FdaSubmission testFdaSubmission = fdaSubmissionList.get(fdaSubmissionList.size() - 1);
        assertThat(testFdaSubmission.getNumber()).isEqualTo(UPDATED_NUMBER);
        assertThat(testFdaSubmission.getSupplementNumber()).isEqualTo(UPDATED_SUPPLEMENT_NUMBER);
        assertThat(testFdaSubmission.getDeviceName()).isEqualTo(UPDATED_DEVICE_NAME);
        assertThat(testFdaSubmission.getGenericName()).isEqualTo(UPDATED_GENERIC_NAME);
        assertThat(testFdaSubmission.getDateReceived()).isEqualTo(UPDATED_DATE_RECEIVED);
        assertThat(testFdaSubmission.getDecisionDate()).isEqualTo(UPDATED_DECISION_DATE);
        assertThat(testFdaSubmission.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testFdaSubmission.getPlatform()).isEqualTo(UPDATED_PLATFORM);
        assertThat(testFdaSubmission.getCurated()).isEqualTo(UPDATED_CURATED);
        assertThat(testFdaSubmission.getGenetic()).isEqualTo(UPDATED_GENETIC);
        assertThat(testFdaSubmission.getAdditionalInfo()).isEqualTo(UPDATED_ADDITIONAL_INFO);
    }

    @Test
    @Transactional
    void patchNonExistingFdaSubmission() throws Exception {
        int databaseSizeBeforeUpdate = fdaSubmissionRepository.findAll().size();
        fdaSubmission.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFdaSubmissionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, fdaSubmission.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmission))
            )
            .andExpect(status().isBadRequest());

        // Validate the FdaSubmission in the database
        List<FdaSubmission> fdaSubmissionList = fdaSubmissionRepository.findAll();
        assertThat(fdaSubmissionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchFdaSubmission() throws Exception {
        int databaseSizeBeforeUpdate = fdaSubmissionRepository.findAll().size();
        fdaSubmission.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFdaSubmissionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmission))
            )
            .andExpect(status().isBadRequest());

        // Validate the FdaSubmission in the database
        List<FdaSubmission> fdaSubmissionList = fdaSubmissionRepository.findAll();
        assertThat(fdaSubmissionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamFdaSubmission() throws Exception {
        int databaseSizeBeforeUpdate = fdaSubmissionRepository.findAll().size();
        fdaSubmission.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFdaSubmissionMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(fdaSubmission))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the FdaSubmission in the database
        List<FdaSubmission> fdaSubmissionList = fdaSubmissionRepository.findAll();
        assertThat(fdaSubmissionList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteFdaSubmission() throws Exception {
        // Initialize the database
        fdaSubmissionRepository.saveAndFlush(fdaSubmission);

        int databaseSizeBeforeDelete = fdaSubmissionRepository.findAll().size();

        // Delete the fdaSubmission
        restFdaSubmissionMockMvc
            .perform(delete(ENTITY_API_URL_ID, fdaSubmission.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<FdaSubmission> fdaSubmissionList = fdaSubmissionRepository.findAll();
        assertThat(fdaSubmissionList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
