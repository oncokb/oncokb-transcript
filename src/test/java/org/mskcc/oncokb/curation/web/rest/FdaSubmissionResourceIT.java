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
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.repository.FdaSubmissionRepository;
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
            .description(DEFAULT_DESCRIPTION);
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
            .description(UPDATED_DESCRIPTION);
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
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION.toString())));
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
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION.toString()));
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
            .description(UPDATED_DESCRIPTION);

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
            .decisionDate(UPDATED_DECISION_DATE);

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
            .description(UPDATED_DESCRIPTION);

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
