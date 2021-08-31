package org.mskcc.oncokb.transcript.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
import org.mskcc.oncokb.transcript.IntegrationTest;
import org.mskcc.oncokb.transcript.domain.ClinicalTrial;
import org.mskcc.oncokb.transcript.repository.ClinicalTrialRepository;
import org.mskcc.oncokb.transcript.service.ClinicalTrialService;
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
 * Integration tests for the {@link ClinicalTrialResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ClinicalTrialResourceIT {

    private static final String DEFAULT_NCT_ID = "AAAAAAAAAA";
    private static final String UPDATED_NCT_ID = "BBBBBBBBBB";

    private static final String DEFAULT_PHASE = "AAAAAAAAAA";
    private static final String UPDATED_PHASE = "BBBBBBBBBB";

    private static final String DEFAULT_STATUS = "AAAAAAAAAA";
    private static final String UPDATED_STATUS = "BBBBBBBBBB";

    private static final String DEFAULT_BRIEF_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_BRIEF_TITLE = "BBBBBBBBBB";

    private static final Instant DEFAULT_LAST_UPDATED = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_LAST_UPDATED = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/clinical-trials";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ClinicalTrialRepository clinicalTrialRepository;

    @Mock
    private ClinicalTrialRepository clinicalTrialRepositoryMock;

    @Mock
    private ClinicalTrialService clinicalTrialServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restClinicalTrialMockMvc;

    private ClinicalTrial clinicalTrial;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClinicalTrial createEntity(EntityManager em) {
        ClinicalTrial clinicalTrial = new ClinicalTrial()
            .nctId(DEFAULT_NCT_ID)
            .phase(DEFAULT_PHASE)
            .status(DEFAULT_STATUS)
            .briefTitle(DEFAULT_BRIEF_TITLE)
            .lastUpdated(DEFAULT_LAST_UPDATED);
        return clinicalTrial;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClinicalTrial createUpdatedEntity(EntityManager em) {
        ClinicalTrial clinicalTrial = new ClinicalTrial()
            .nctId(UPDATED_NCT_ID)
            .phase(UPDATED_PHASE)
            .status(UPDATED_STATUS)
            .briefTitle(UPDATED_BRIEF_TITLE)
            .lastUpdated(UPDATED_LAST_UPDATED);
        return clinicalTrial;
    }

    @BeforeEach
    public void initTest() {
        clinicalTrial = createEntity(em);
    }

    @Test
    @Transactional
    void createClinicalTrial() throws Exception {
        int databaseSizeBeforeCreate = clinicalTrialRepository.findAll().size();
        // Create the ClinicalTrial
        restClinicalTrialMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(clinicalTrial)))
            .andExpect(status().isCreated());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeCreate + 1);
        ClinicalTrial testClinicalTrial = clinicalTrialList.get(clinicalTrialList.size() - 1);
        assertThat(testClinicalTrial.getNctId()).isEqualTo(DEFAULT_NCT_ID);
        assertThat(testClinicalTrial.getPhase()).isEqualTo(DEFAULT_PHASE);
        assertThat(testClinicalTrial.getStatus()).isEqualTo(DEFAULT_STATUS);
        assertThat(testClinicalTrial.getBriefTitle()).isEqualTo(DEFAULT_BRIEF_TITLE);
        assertThat(testClinicalTrial.getLastUpdated()).isEqualTo(DEFAULT_LAST_UPDATED);
    }

    @Test
    @Transactional
    void createClinicalTrialWithExistingId() throws Exception {
        // Create the ClinicalTrial with an existing ID
        clinicalTrial.setId(1L);

        int databaseSizeBeforeCreate = clinicalTrialRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restClinicalTrialMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(clinicalTrial)))
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllClinicalTrials() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get all the clinicalTrialList
        restClinicalTrialMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(clinicalTrial.getId().intValue())))
            .andExpect(jsonPath("$.[*].nctId").value(hasItem(DEFAULT_NCT_ID)))
            .andExpect(jsonPath("$.[*].phase").value(hasItem(DEFAULT_PHASE)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS)))
            .andExpect(jsonPath("$.[*].briefTitle").value(hasItem(DEFAULT_BRIEF_TITLE.toString())))
            .andExpect(jsonPath("$.[*].lastUpdated").value(hasItem(DEFAULT_LAST_UPDATED.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllClinicalTrialsWithEagerRelationshipsIsEnabled() throws Exception {
        when(clinicalTrialServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restClinicalTrialMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(clinicalTrialServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllClinicalTrialsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(clinicalTrialServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restClinicalTrialMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(clinicalTrialServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getClinicalTrial() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        // Get the clinicalTrial
        restClinicalTrialMockMvc
            .perform(get(ENTITY_API_URL_ID, clinicalTrial.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(clinicalTrial.getId().intValue()))
            .andExpect(jsonPath("$.nctId").value(DEFAULT_NCT_ID))
            .andExpect(jsonPath("$.phase").value(DEFAULT_PHASE))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS))
            .andExpect(jsonPath("$.briefTitle").value(DEFAULT_BRIEF_TITLE.toString()))
            .andExpect(jsonPath("$.lastUpdated").value(DEFAULT_LAST_UPDATED.toString()));
    }

    @Test
    @Transactional
    void getNonExistingClinicalTrial() throws Exception {
        // Get the clinicalTrial
        restClinicalTrialMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewClinicalTrial() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();

        // Update the clinicalTrial
        ClinicalTrial updatedClinicalTrial = clinicalTrialRepository.findById(clinicalTrial.getId()).get();
        // Disconnect from session so that the updates on updatedClinicalTrial are not directly saved in db
        em.detach(updatedClinicalTrial);
        updatedClinicalTrial
            .nctId(UPDATED_NCT_ID)
            .phase(UPDATED_PHASE)
            .status(UPDATED_STATUS)
            .briefTitle(UPDATED_BRIEF_TITLE)
            .lastUpdated(UPDATED_LAST_UPDATED);

        restClinicalTrialMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedClinicalTrial.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedClinicalTrial))
            )
            .andExpect(status().isOk());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
        ClinicalTrial testClinicalTrial = clinicalTrialList.get(clinicalTrialList.size() - 1);
        assertThat(testClinicalTrial.getNctId()).isEqualTo(UPDATED_NCT_ID);
        assertThat(testClinicalTrial.getPhase()).isEqualTo(UPDATED_PHASE);
        assertThat(testClinicalTrial.getStatus()).isEqualTo(UPDATED_STATUS);
        assertThat(testClinicalTrial.getBriefTitle()).isEqualTo(UPDATED_BRIEF_TITLE);
        assertThat(testClinicalTrial.getLastUpdated()).isEqualTo(UPDATED_LAST_UPDATED);
    }

    @Test
    @Transactional
    void putNonExistingClinicalTrial() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();
        clinicalTrial.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClinicalTrialMockMvc
            .perform(
                put(ENTITY_API_URL_ID, clinicalTrial.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrial))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchClinicalTrial() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();
        clinicalTrial.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrial))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamClinicalTrial() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();
        clinicalTrial.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(clinicalTrial)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateClinicalTrialWithPatch() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();

        // Update the clinicalTrial using partial update
        ClinicalTrial partialUpdatedClinicalTrial = new ClinicalTrial();
        partialUpdatedClinicalTrial.setId(clinicalTrial.getId());

        partialUpdatedClinicalTrial.nctId(UPDATED_NCT_ID).phase(UPDATED_PHASE).lastUpdated(UPDATED_LAST_UPDATED);

        restClinicalTrialMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClinicalTrial.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedClinicalTrial))
            )
            .andExpect(status().isOk());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
        ClinicalTrial testClinicalTrial = clinicalTrialList.get(clinicalTrialList.size() - 1);
        assertThat(testClinicalTrial.getNctId()).isEqualTo(UPDATED_NCT_ID);
        assertThat(testClinicalTrial.getPhase()).isEqualTo(UPDATED_PHASE);
        assertThat(testClinicalTrial.getStatus()).isEqualTo(DEFAULT_STATUS);
        assertThat(testClinicalTrial.getBriefTitle()).isEqualTo(DEFAULT_BRIEF_TITLE);
        assertThat(testClinicalTrial.getLastUpdated()).isEqualTo(UPDATED_LAST_UPDATED);
    }

    @Test
    @Transactional
    void fullUpdateClinicalTrialWithPatch() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();

        // Update the clinicalTrial using partial update
        ClinicalTrial partialUpdatedClinicalTrial = new ClinicalTrial();
        partialUpdatedClinicalTrial.setId(clinicalTrial.getId());

        partialUpdatedClinicalTrial
            .nctId(UPDATED_NCT_ID)
            .phase(UPDATED_PHASE)
            .status(UPDATED_STATUS)
            .briefTitle(UPDATED_BRIEF_TITLE)
            .lastUpdated(UPDATED_LAST_UPDATED);

        restClinicalTrialMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClinicalTrial.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedClinicalTrial))
            )
            .andExpect(status().isOk());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
        ClinicalTrial testClinicalTrial = clinicalTrialList.get(clinicalTrialList.size() - 1);
        assertThat(testClinicalTrial.getNctId()).isEqualTo(UPDATED_NCT_ID);
        assertThat(testClinicalTrial.getPhase()).isEqualTo(UPDATED_PHASE);
        assertThat(testClinicalTrial.getStatus()).isEqualTo(UPDATED_STATUS);
        assertThat(testClinicalTrial.getBriefTitle()).isEqualTo(UPDATED_BRIEF_TITLE);
        assertThat(testClinicalTrial.getLastUpdated()).isEqualTo(UPDATED_LAST_UPDATED);
    }

    @Test
    @Transactional
    void patchNonExistingClinicalTrial() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();
        clinicalTrial.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClinicalTrialMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, clinicalTrial.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrial))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchClinicalTrial() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();
        clinicalTrial.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrial))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamClinicalTrial() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialRepository.findAll().size();
        clinicalTrial.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(clinicalTrial))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClinicalTrial in the database
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteClinicalTrial() throws Exception {
        // Initialize the database
        clinicalTrialRepository.saveAndFlush(clinicalTrial);

        int databaseSizeBeforeDelete = clinicalTrialRepository.findAll().size();

        // Delete the clinicalTrial
        restClinicalTrialMockMvc
            .perform(delete(ENTITY_API_URL_ID, clinicalTrial.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<ClinicalTrial> clinicalTrialList = clinicalTrialRepository.findAll();
        assertThat(clinicalTrialList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
