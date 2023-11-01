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
import org.mskcc.oncokb.curation.domain.History;
import org.mskcc.oncokb.curation.repository.HistoryRepository;
import org.mskcc.oncokb.curation.service.criteria.HistoryCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link HistoryResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class HistoryResourceIT {

    private static final String DEFAULT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_TYPE = "BBBBBBBBBB";

    private static final Instant DEFAULT_UPDATED_TIME = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_UPDATED_TIME = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_UPDATED_BY = "AAAAAAAAAA";
    private static final String UPDATED_UPDATED_BY = "BBBBBBBBBB";

    private static final String DEFAULT_ENTITY_NAME = "AAAAAAAAAA";
    private static final String UPDATED_ENTITY_NAME = "BBBBBBBBBB";

    private static final Integer DEFAULT_ENTITY_ID = 1;
    private static final Integer UPDATED_ENTITY_ID = 2;
    private static final Integer SMALLER_ENTITY_ID = 1 - 1;

    private static final String ENTITY_API_URL = "/api/histories";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private HistoryRepository historyRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restHistoryMockMvc;

    private History history;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static History createEntity(EntityManager em) {
        History history = new History()
            .type(DEFAULT_TYPE)
            .updatedTime(DEFAULT_UPDATED_TIME)
            .updatedBy(DEFAULT_UPDATED_BY)
            .entityName(DEFAULT_ENTITY_NAME)
            .entityId(DEFAULT_ENTITY_ID);
        return history;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static History createUpdatedEntity(EntityManager em) {
        History history = new History()
            .type(UPDATED_TYPE)
            .updatedTime(UPDATED_UPDATED_TIME)
            .updatedBy(UPDATED_UPDATED_BY)
            .entityName(UPDATED_ENTITY_NAME)
            .entityId(UPDATED_ENTITY_ID);
        return history;
    }

    @BeforeEach
    public void initTest() {
        history = createEntity(em);
    }

    @Test
    @Transactional
    void createHistory() throws Exception {
        int databaseSizeBeforeCreate = historyRepository.findAll().size();
        // Create the History
        restHistoryMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(history))
            )
            .andExpect(status().isCreated());

        // Validate the History in the database
        List<History> historyList = historyRepository.findAll();
        assertThat(historyList).hasSize(databaseSizeBeforeCreate + 1);
        History testHistory = historyList.get(historyList.size() - 1);
        assertThat(testHistory.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testHistory.getUpdatedTime()).isEqualTo(DEFAULT_UPDATED_TIME);
        assertThat(testHistory.getUpdatedBy()).isEqualTo(DEFAULT_UPDATED_BY);
        assertThat(testHistory.getEntityName()).isEqualTo(DEFAULT_ENTITY_NAME);
        assertThat(testHistory.getEntityId()).isEqualTo(DEFAULT_ENTITY_ID);
    }

    @Test
    @Transactional
    void createHistoryWithExistingId() throws Exception {
        // Create the History with an existing ID
        history.setId(1L);

        int databaseSizeBeforeCreate = historyRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restHistoryMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(history))
            )
            .andExpect(status().isBadRequest());

        // Validate the History in the database
        List<History> historyList = historyRepository.findAll();
        assertThat(historyList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = historyRepository.findAll().size();
        // set the field null
        history.setType(null);

        // Create the History, which fails.

        restHistoryMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(history))
            )
            .andExpect(status().isBadRequest());

        List<History> historyList = historyRepository.findAll();
        assertThat(historyList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllHistories() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList
        restHistoryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(history.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE)))
            .andExpect(jsonPath("$.[*].updatedTime").value(hasItem(DEFAULT_UPDATED_TIME.toString())))
            .andExpect(jsonPath("$.[*].updatedBy").value(hasItem(DEFAULT_UPDATED_BY)))
            .andExpect(jsonPath("$.[*].entityName").value(hasItem(DEFAULT_ENTITY_NAME)))
            .andExpect(jsonPath("$.[*].entityId").value(hasItem(DEFAULT_ENTITY_ID)));
    }

    @Test
    @Transactional
    void getHistory() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get the history
        restHistoryMockMvc
            .perform(get(ENTITY_API_URL_ID, history.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(history.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE))
            .andExpect(jsonPath("$.updatedTime").value(DEFAULT_UPDATED_TIME.toString()))
            .andExpect(jsonPath("$.updatedBy").value(DEFAULT_UPDATED_BY))
            .andExpect(jsonPath("$.entityName").value(DEFAULT_ENTITY_NAME))
            .andExpect(jsonPath("$.entityId").value(DEFAULT_ENTITY_ID));
    }

    @Test
    @Transactional
    void getHistoriesByIdFiltering() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        Long id = history.getId();

        defaultHistoryShouldBeFound("id.equals=" + id);
        defaultHistoryShouldNotBeFound("id.notEquals=" + id);

        defaultHistoryShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultHistoryShouldNotBeFound("id.greaterThan=" + id);

        defaultHistoryShouldBeFound("id.lessThanOrEqual=" + id);
        defaultHistoryShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllHistoriesByTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where type equals to DEFAULT_TYPE
        defaultHistoryShouldBeFound("type.equals=" + DEFAULT_TYPE);

        // Get all the historyList where type equals to UPDATED_TYPE
        defaultHistoryShouldNotBeFound("type.equals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllHistoriesByTypeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where type not equals to DEFAULT_TYPE
        defaultHistoryShouldNotBeFound("type.notEquals=" + DEFAULT_TYPE);

        // Get all the historyList where type not equals to UPDATED_TYPE
        defaultHistoryShouldBeFound("type.notEquals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllHistoriesByTypeIsInShouldWork() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where type in DEFAULT_TYPE or UPDATED_TYPE
        defaultHistoryShouldBeFound("type.in=" + DEFAULT_TYPE + "," + UPDATED_TYPE);

        // Get all the historyList where type equals to UPDATED_TYPE
        defaultHistoryShouldNotBeFound("type.in=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllHistoriesByTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where type is not null
        defaultHistoryShouldBeFound("type.specified=true");

        // Get all the historyList where type is null
        defaultHistoryShouldNotBeFound("type.specified=false");
    }

    @Test
    @Transactional
    void getAllHistoriesByTypeContainsSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where type contains DEFAULT_TYPE
        defaultHistoryShouldBeFound("type.contains=" + DEFAULT_TYPE);

        // Get all the historyList where type contains UPDATED_TYPE
        defaultHistoryShouldNotBeFound("type.contains=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllHistoriesByTypeNotContainsSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where type does not contain DEFAULT_TYPE
        defaultHistoryShouldNotBeFound("type.doesNotContain=" + DEFAULT_TYPE);

        // Get all the historyList where type does not contain UPDATED_TYPE
        defaultHistoryShouldBeFound("type.doesNotContain=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllHistoriesByUpdatedTimeIsEqualToSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where updatedTime equals to DEFAULT_UPDATED_TIME
        defaultHistoryShouldBeFound("updatedTime.equals=" + DEFAULT_UPDATED_TIME);

        // Get all the historyList where updatedTime equals to UPDATED_UPDATED_TIME
        defaultHistoryShouldNotBeFound("updatedTime.equals=" + UPDATED_UPDATED_TIME);
    }

    @Test
    @Transactional
    void getAllHistoriesByUpdatedTimeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where updatedTime not equals to DEFAULT_UPDATED_TIME
        defaultHistoryShouldNotBeFound("updatedTime.notEquals=" + DEFAULT_UPDATED_TIME);

        // Get all the historyList where updatedTime not equals to UPDATED_UPDATED_TIME
        defaultHistoryShouldBeFound("updatedTime.notEquals=" + UPDATED_UPDATED_TIME);
    }

    @Test
    @Transactional
    void getAllHistoriesByUpdatedTimeIsInShouldWork() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where updatedTime in DEFAULT_UPDATED_TIME or UPDATED_UPDATED_TIME
        defaultHistoryShouldBeFound("updatedTime.in=" + DEFAULT_UPDATED_TIME + "," + UPDATED_UPDATED_TIME);

        // Get all the historyList where updatedTime equals to UPDATED_UPDATED_TIME
        defaultHistoryShouldNotBeFound("updatedTime.in=" + UPDATED_UPDATED_TIME);
    }

    @Test
    @Transactional
    void getAllHistoriesByUpdatedTimeIsNullOrNotNull() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where updatedTime is not null
        defaultHistoryShouldBeFound("updatedTime.specified=true");

        // Get all the historyList where updatedTime is null
        defaultHistoryShouldNotBeFound("updatedTime.specified=false");
    }

    @Test
    @Transactional
    void getAllHistoriesByUpdatedByIsEqualToSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where updatedBy equals to DEFAULT_UPDATED_BY
        defaultHistoryShouldBeFound("updatedBy.equals=" + DEFAULT_UPDATED_BY);

        // Get all the historyList where updatedBy equals to UPDATED_UPDATED_BY
        defaultHistoryShouldNotBeFound("updatedBy.equals=" + UPDATED_UPDATED_BY);
    }

    @Test
    @Transactional
    void getAllHistoriesByUpdatedByIsNotEqualToSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where updatedBy not equals to DEFAULT_UPDATED_BY
        defaultHistoryShouldNotBeFound("updatedBy.notEquals=" + DEFAULT_UPDATED_BY);

        // Get all the historyList where updatedBy not equals to UPDATED_UPDATED_BY
        defaultHistoryShouldBeFound("updatedBy.notEquals=" + UPDATED_UPDATED_BY);
    }

    @Test
    @Transactional
    void getAllHistoriesByUpdatedByIsInShouldWork() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where updatedBy in DEFAULT_UPDATED_BY or UPDATED_UPDATED_BY
        defaultHistoryShouldBeFound("updatedBy.in=" + DEFAULT_UPDATED_BY + "," + UPDATED_UPDATED_BY);

        // Get all the historyList where updatedBy equals to UPDATED_UPDATED_BY
        defaultHistoryShouldNotBeFound("updatedBy.in=" + UPDATED_UPDATED_BY);
    }

    @Test
    @Transactional
    void getAllHistoriesByUpdatedByIsNullOrNotNull() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where updatedBy is not null
        defaultHistoryShouldBeFound("updatedBy.specified=true");

        // Get all the historyList where updatedBy is null
        defaultHistoryShouldNotBeFound("updatedBy.specified=false");
    }

    @Test
    @Transactional
    void getAllHistoriesByUpdatedByContainsSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where updatedBy contains DEFAULT_UPDATED_BY
        defaultHistoryShouldBeFound("updatedBy.contains=" + DEFAULT_UPDATED_BY);

        // Get all the historyList where updatedBy contains UPDATED_UPDATED_BY
        defaultHistoryShouldNotBeFound("updatedBy.contains=" + UPDATED_UPDATED_BY);
    }

    @Test
    @Transactional
    void getAllHistoriesByUpdatedByNotContainsSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where updatedBy does not contain DEFAULT_UPDATED_BY
        defaultHistoryShouldNotBeFound("updatedBy.doesNotContain=" + DEFAULT_UPDATED_BY);

        // Get all the historyList where updatedBy does not contain UPDATED_UPDATED_BY
        defaultHistoryShouldBeFound("updatedBy.doesNotContain=" + UPDATED_UPDATED_BY);
    }

    @Test
    @Transactional
    void getAllHistoriesByEntityNameIsEqualToSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where entityName equals to DEFAULT_ENTITY_NAME
        defaultHistoryShouldBeFound("entityName.equals=" + DEFAULT_ENTITY_NAME);

        // Get all the historyList where entityName equals to UPDATED_ENTITY_NAME
        defaultHistoryShouldNotBeFound("entityName.equals=" + UPDATED_ENTITY_NAME);
    }

    @Test
    @Transactional
    void getAllHistoriesByEntityNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where entityName not equals to DEFAULT_ENTITY_NAME
        defaultHistoryShouldNotBeFound("entityName.notEquals=" + DEFAULT_ENTITY_NAME);

        // Get all the historyList where entityName not equals to UPDATED_ENTITY_NAME
        defaultHistoryShouldBeFound("entityName.notEquals=" + UPDATED_ENTITY_NAME);
    }

    @Test
    @Transactional
    void getAllHistoriesByEntityNameIsInShouldWork() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where entityName in DEFAULT_ENTITY_NAME or UPDATED_ENTITY_NAME
        defaultHistoryShouldBeFound("entityName.in=" + DEFAULT_ENTITY_NAME + "," + UPDATED_ENTITY_NAME);

        // Get all the historyList where entityName equals to UPDATED_ENTITY_NAME
        defaultHistoryShouldNotBeFound("entityName.in=" + UPDATED_ENTITY_NAME);
    }

    @Test
    @Transactional
    void getAllHistoriesByEntityNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where entityName is not null
        defaultHistoryShouldBeFound("entityName.specified=true");

        // Get all the historyList where entityName is null
        defaultHistoryShouldNotBeFound("entityName.specified=false");
    }

    @Test
    @Transactional
    void getAllHistoriesByEntityNameContainsSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where entityName contains DEFAULT_ENTITY_NAME
        defaultHistoryShouldBeFound("entityName.contains=" + DEFAULT_ENTITY_NAME);

        // Get all the historyList where entityName contains UPDATED_ENTITY_NAME
        defaultHistoryShouldNotBeFound("entityName.contains=" + UPDATED_ENTITY_NAME);
    }

    @Test
    @Transactional
    void getAllHistoriesByEntityNameNotContainsSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where entityName does not contain DEFAULT_ENTITY_NAME
        defaultHistoryShouldNotBeFound("entityName.doesNotContain=" + DEFAULT_ENTITY_NAME);

        // Get all the historyList where entityName does not contain UPDATED_ENTITY_NAME
        defaultHistoryShouldBeFound("entityName.doesNotContain=" + UPDATED_ENTITY_NAME);
    }

    @Test
    @Transactional
    void getAllHistoriesByEntityIdIsEqualToSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where entityId equals to DEFAULT_ENTITY_ID
        defaultHistoryShouldBeFound("entityId.equals=" + DEFAULT_ENTITY_ID);

        // Get all the historyList where entityId equals to UPDATED_ENTITY_ID
        defaultHistoryShouldNotBeFound("entityId.equals=" + UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void getAllHistoriesByEntityIdIsNotEqualToSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where entityId not equals to DEFAULT_ENTITY_ID
        defaultHistoryShouldNotBeFound("entityId.notEquals=" + DEFAULT_ENTITY_ID);

        // Get all the historyList where entityId not equals to UPDATED_ENTITY_ID
        defaultHistoryShouldBeFound("entityId.notEquals=" + UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void getAllHistoriesByEntityIdIsInShouldWork() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where entityId in DEFAULT_ENTITY_ID or UPDATED_ENTITY_ID
        defaultHistoryShouldBeFound("entityId.in=" + DEFAULT_ENTITY_ID + "," + UPDATED_ENTITY_ID);

        // Get all the historyList where entityId equals to UPDATED_ENTITY_ID
        defaultHistoryShouldNotBeFound("entityId.in=" + UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void getAllHistoriesByEntityIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where entityId is not null
        defaultHistoryShouldBeFound("entityId.specified=true");

        // Get all the historyList where entityId is null
        defaultHistoryShouldNotBeFound("entityId.specified=false");
    }

    @Test
    @Transactional
    void getAllHistoriesByEntityIdIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where entityId is greater than or equal to DEFAULT_ENTITY_ID
        defaultHistoryShouldBeFound("entityId.greaterThanOrEqual=" + DEFAULT_ENTITY_ID);

        // Get all the historyList where entityId is greater than or equal to UPDATED_ENTITY_ID
        defaultHistoryShouldNotBeFound("entityId.greaterThanOrEqual=" + UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void getAllHistoriesByEntityIdIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where entityId is less than or equal to DEFAULT_ENTITY_ID
        defaultHistoryShouldBeFound("entityId.lessThanOrEqual=" + DEFAULT_ENTITY_ID);

        // Get all the historyList where entityId is less than or equal to SMALLER_ENTITY_ID
        defaultHistoryShouldNotBeFound("entityId.lessThanOrEqual=" + SMALLER_ENTITY_ID);
    }

    @Test
    @Transactional
    void getAllHistoriesByEntityIdIsLessThanSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where entityId is less than DEFAULT_ENTITY_ID
        defaultHistoryShouldNotBeFound("entityId.lessThan=" + DEFAULT_ENTITY_ID);

        // Get all the historyList where entityId is less than UPDATED_ENTITY_ID
        defaultHistoryShouldBeFound("entityId.lessThan=" + UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void getAllHistoriesByEntityIdIsGreaterThanSomething() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        // Get all the historyList where entityId is greater than DEFAULT_ENTITY_ID
        defaultHistoryShouldNotBeFound("entityId.greaterThan=" + DEFAULT_ENTITY_ID);

        // Get all the historyList where entityId is greater than SMALLER_ENTITY_ID
        defaultHistoryShouldBeFound("entityId.greaterThan=" + SMALLER_ENTITY_ID);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultHistoryShouldBeFound(String filter) throws Exception {
        restHistoryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(history.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE)))
            .andExpect(jsonPath("$.[*].updatedTime").value(hasItem(DEFAULT_UPDATED_TIME.toString())))
            .andExpect(jsonPath("$.[*].updatedBy").value(hasItem(DEFAULT_UPDATED_BY)))
            .andExpect(jsonPath("$.[*].entityName").value(hasItem(DEFAULT_ENTITY_NAME)))
            .andExpect(jsonPath("$.[*].entityId").value(hasItem(DEFAULT_ENTITY_ID)));

        // Check, that the count call also returns 1
        restHistoryMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultHistoryShouldNotBeFound(String filter) throws Exception {
        restHistoryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restHistoryMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingHistory() throws Exception {
        // Get the history
        restHistoryMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewHistory() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        int databaseSizeBeforeUpdate = historyRepository.findAll().size();

        // Update the history
        History updatedHistory = historyRepository.findById(history.getId()).get();
        // Disconnect from session so that the updates on updatedHistory are not directly saved in db
        em.detach(updatedHistory);
        updatedHistory
            .type(UPDATED_TYPE)
            .updatedTime(UPDATED_UPDATED_TIME)
            .updatedBy(UPDATED_UPDATED_BY)
            .entityName(UPDATED_ENTITY_NAME)
            .entityId(UPDATED_ENTITY_ID);

        restHistoryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedHistory.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedHistory))
            )
            .andExpect(status().isOk());

        // Validate the History in the database
        List<History> historyList = historyRepository.findAll();
        assertThat(historyList).hasSize(databaseSizeBeforeUpdate);
        History testHistory = historyList.get(historyList.size() - 1);
        assertThat(testHistory.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testHistory.getUpdatedTime()).isEqualTo(UPDATED_UPDATED_TIME);
        assertThat(testHistory.getUpdatedBy()).isEqualTo(UPDATED_UPDATED_BY);
        assertThat(testHistory.getEntityName()).isEqualTo(UPDATED_ENTITY_NAME);
        assertThat(testHistory.getEntityId()).isEqualTo(UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void putNonExistingHistory() throws Exception {
        int databaseSizeBeforeUpdate = historyRepository.findAll().size();
        history.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHistoryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, history.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(history))
            )
            .andExpect(status().isBadRequest());

        // Validate the History in the database
        List<History> historyList = historyRepository.findAll();
        assertThat(historyList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchHistory() throws Exception {
        int databaseSizeBeforeUpdate = historyRepository.findAll().size();
        history.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHistoryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(history))
            )
            .andExpect(status().isBadRequest());

        // Validate the History in the database
        List<History> historyList = historyRepository.findAll();
        assertThat(historyList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamHistory() throws Exception {
        int databaseSizeBeforeUpdate = historyRepository.findAll().size();
        history.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHistoryMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(history))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the History in the database
        List<History> historyList = historyRepository.findAll();
        assertThat(historyList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateHistoryWithPatch() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        int databaseSizeBeforeUpdate = historyRepository.findAll().size();

        // Update the history using partial update
        History partialUpdatedHistory = new History();
        partialUpdatedHistory.setId(history.getId());

        partialUpdatedHistory.entityName(UPDATED_ENTITY_NAME).entityId(UPDATED_ENTITY_ID);

        restHistoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHistory.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedHistory))
            )
            .andExpect(status().isOk());

        // Validate the History in the database
        List<History> historyList = historyRepository.findAll();
        assertThat(historyList).hasSize(databaseSizeBeforeUpdate);
        History testHistory = historyList.get(historyList.size() - 1);
        assertThat(testHistory.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testHistory.getUpdatedTime()).isEqualTo(DEFAULT_UPDATED_TIME);
        assertThat(testHistory.getUpdatedBy()).isEqualTo(DEFAULT_UPDATED_BY);
        assertThat(testHistory.getEntityName()).isEqualTo(UPDATED_ENTITY_NAME);
        assertThat(testHistory.getEntityId()).isEqualTo(UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void fullUpdateHistoryWithPatch() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        int databaseSizeBeforeUpdate = historyRepository.findAll().size();

        // Update the history using partial update
        History partialUpdatedHistory = new History();
        partialUpdatedHistory.setId(history.getId());

        partialUpdatedHistory
            .type(UPDATED_TYPE)
            .updatedTime(UPDATED_UPDATED_TIME)
            .updatedBy(UPDATED_UPDATED_BY)
            .entityName(UPDATED_ENTITY_NAME)
            .entityId(UPDATED_ENTITY_ID);

        restHistoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHistory.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedHistory))
            )
            .andExpect(status().isOk());

        // Validate the History in the database
        List<History> historyList = historyRepository.findAll();
        assertThat(historyList).hasSize(databaseSizeBeforeUpdate);
        History testHistory = historyList.get(historyList.size() - 1);
        assertThat(testHistory.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testHistory.getUpdatedTime()).isEqualTo(UPDATED_UPDATED_TIME);
        assertThat(testHistory.getUpdatedBy()).isEqualTo(UPDATED_UPDATED_BY);
        assertThat(testHistory.getEntityName()).isEqualTo(UPDATED_ENTITY_NAME);
        assertThat(testHistory.getEntityId()).isEqualTo(UPDATED_ENTITY_ID);
    }

    @Test
    @Transactional
    void patchNonExistingHistory() throws Exception {
        int databaseSizeBeforeUpdate = historyRepository.findAll().size();
        history.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHistoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, history.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(history))
            )
            .andExpect(status().isBadRequest());

        // Validate the History in the database
        List<History> historyList = historyRepository.findAll();
        assertThat(historyList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchHistory() throws Exception {
        int databaseSizeBeforeUpdate = historyRepository.findAll().size();
        history.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHistoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(history))
            )
            .andExpect(status().isBadRequest());

        // Validate the History in the database
        List<History> historyList = historyRepository.findAll();
        assertThat(historyList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamHistory() throws Exception {
        int databaseSizeBeforeUpdate = historyRepository.findAll().size();
        history.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHistoryMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(history))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the History in the database
        List<History> historyList = historyRepository.findAll();
        assertThat(historyList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteHistory() throws Exception {
        // Initialize the database
        historyRepository.saveAndFlush(history);

        int databaseSizeBeforeDelete = historyRepository.findAll().size();

        // Delete the history
        restHistoryMockMvc
            .perform(delete(ENTITY_API_URL_ID, history.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<History> historyList = historyRepository.findAll();
        assertThat(historyList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
