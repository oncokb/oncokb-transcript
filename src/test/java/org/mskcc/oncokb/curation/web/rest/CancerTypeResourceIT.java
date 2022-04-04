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
import org.mskcc.oncokb.curation.domain.CancerType;
import org.mskcc.oncokb.curation.domain.enumeration.TumorForm;
import org.mskcc.oncokb.curation.repository.CancerTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link CancerTypeResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class CancerTypeResourceIT {

    private static final String DEFAULT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_COLOR = "AAAAAAAAAA";
    private static final String UPDATED_COLOR = "BBBBBBBBBB";

    private static final Integer DEFAULT_LEVEL = 1;
    private static final Integer UPDATED_LEVEL = 2;

    private static final String DEFAULT_MAIN_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_MAIN_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_SUBTYPE = "AAAAAAAAAA";
    private static final String UPDATED_SUBTYPE = "BBBBBBBBBB";

    private static final String DEFAULT_TISSUE = "AAAAAAAAAA";
    private static final String UPDATED_TISSUE = "BBBBBBBBBB";

    private static final TumorForm DEFAULT_TUMOR_FORM = TumorForm.SOLID;
    private static final TumorForm UPDATED_TUMOR_FORM = TumorForm.LIQUID;

    private static final String ENTITY_API_URL = "/api/cancer-types";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private CancerTypeRepository cancerTypeRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCancerTypeMockMvc;

    private CancerType cancerType;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CancerType createEntity(EntityManager em) {
        CancerType cancerType = new CancerType()
            .code(DEFAULT_CODE)
            .color(DEFAULT_COLOR)
            .level(DEFAULT_LEVEL)
            .mainType(DEFAULT_MAIN_TYPE)
            .subtype(DEFAULT_SUBTYPE)
            .tissue(DEFAULT_TISSUE)
            .tumorForm(DEFAULT_TUMOR_FORM);
        return cancerType;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CancerType createUpdatedEntity(EntityManager em) {
        CancerType cancerType = new CancerType()
            .code(UPDATED_CODE)
            .color(UPDATED_COLOR)
            .level(UPDATED_LEVEL)
            .mainType(UPDATED_MAIN_TYPE)
            .subtype(UPDATED_SUBTYPE)
            .tissue(UPDATED_TISSUE)
            .tumorForm(UPDATED_TUMOR_FORM);
        return cancerType;
    }

    @BeforeEach
    public void initTest() {
        cancerType = createEntity(em);
    }

    @Test
    @Transactional
    void createCancerType() throws Exception {
        int databaseSizeBeforeCreate = cancerTypeRepository.findAll().size();
        // Create the CancerType
        restCancerTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(cancerType))
            )
            .andExpect(status().isCreated());

        // Validate the CancerType in the database
        List<CancerType> cancerTypeList = cancerTypeRepository.findAll();
        assertThat(cancerTypeList).hasSize(databaseSizeBeforeCreate + 1);
        CancerType testCancerType = cancerTypeList.get(cancerTypeList.size() - 1);
        assertThat(testCancerType.getCode()).isEqualTo(DEFAULT_CODE);
        assertThat(testCancerType.getColor()).isEqualTo(DEFAULT_COLOR);
        assertThat(testCancerType.getLevel()).isEqualTo(DEFAULT_LEVEL);
        assertThat(testCancerType.getMainType()).isEqualTo(DEFAULT_MAIN_TYPE);
        assertThat(testCancerType.getSubtype()).isEqualTo(DEFAULT_SUBTYPE);
        assertThat(testCancerType.getTissue()).isEqualTo(DEFAULT_TISSUE);
        assertThat(testCancerType.getTumorForm()).isEqualTo(DEFAULT_TUMOR_FORM);
    }

    @Test
    @Transactional
    void createCancerTypeWithExistingId() throws Exception {
        // Create the CancerType with an existing ID
        cancerType.setId(1L);

        int databaseSizeBeforeCreate = cancerTypeRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCancerTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(cancerType))
            )
            .andExpect(status().isBadRequest());

        // Validate the CancerType in the database
        List<CancerType> cancerTypeList = cancerTypeRepository.findAll();
        assertThat(cancerTypeList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkLevelIsRequired() throws Exception {
        int databaseSizeBeforeTest = cancerTypeRepository.findAll().size();
        // set the field null
        cancerType.setLevel(null);

        // Create the CancerType, which fails.

        restCancerTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(cancerType))
            )
            .andExpect(status().isBadRequest());

        List<CancerType> cancerTypeList = cancerTypeRepository.findAll();
        assertThat(cancerTypeList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMainTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = cancerTypeRepository.findAll().size();
        // set the field null
        cancerType.setMainType(null);

        // Create the CancerType, which fails.

        restCancerTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(cancerType))
            )
            .andExpect(status().isBadRequest());

        List<CancerType> cancerTypeList = cancerTypeRepository.findAll();
        assertThat(cancerTypeList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTumorFormIsRequired() throws Exception {
        int databaseSizeBeforeTest = cancerTypeRepository.findAll().size();
        // set the field null
        cancerType.setTumorForm(null);

        // Create the CancerType, which fails.

        restCancerTypeMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(cancerType))
            )
            .andExpect(status().isBadRequest());

        List<CancerType> cancerTypeList = cancerTypeRepository.findAll();
        assertThat(cancerTypeList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllCancerTypes() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList
        restCancerTypeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(cancerType.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].color").value(hasItem(DEFAULT_COLOR)))
            .andExpect(jsonPath("$.[*].level").value(hasItem(DEFAULT_LEVEL)))
            .andExpect(jsonPath("$.[*].mainType").value(hasItem(DEFAULT_MAIN_TYPE)))
            .andExpect(jsonPath("$.[*].subtype").value(hasItem(DEFAULT_SUBTYPE)))
            .andExpect(jsonPath("$.[*].tissue").value(hasItem(DEFAULT_TISSUE)))
            .andExpect(jsonPath("$.[*].tumorForm").value(hasItem(DEFAULT_TUMOR_FORM.toString())));
    }

    @Test
    @Transactional
    void getCancerType() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get the cancerType
        restCancerTypeMockMvc
            .perform(get(ENTITY_API_URL_ID, cancerType.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(cancerType.getId().intValue()))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.color").value(DEFAULT_COLOR))
            .andExpect(jsonPath("$.level").value(DEFAULT_LEVEL))
            .andExpect(jsonPath("$.mainType").value(DEFAULT_MAIN_TYPE))
            .andExpect(jsonPath("$.subtype").value(DEFAULT_SUBTYPE))
            .andExpect(jsonPath("$.tissue").value(DEFAULT_TISSUE))
            .andExpect(jsonPath("$.tumorForm").value(DEFAULT_TUMOR_FORM.toString()));
    }

    @Test
    @Transactional
    void getNonExistingCancerType() throws Exception {
        // Get the cancerType
        restCancerTypeMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewCancerType() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        int databaseSizeBeforeUpdate = cancerTypeRepository.findAll().size();

        // Update the cancerType
        CancerType updatedCancerType = cancerTypeRepository.findById(cancerType.getId()).get();
        // Disconnect from session so that the updates on updatedCancerType are not directly saved in db
        em.detach(updatedCancerType);
        updatedCancerType
            .code(UPDATED_CODE)
            .color(UPDATED_COLOR)
            .level(UPDATED_LEVEL)
            .mainType(UPDATED_MAIN_TYPE)
            .subtype(UPDATED_SUBTYPE)
            .tissue(UPDATED_TISSUE)
            .tumorForm(UPDATED_TUMOR_FORM);

        restCancerTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedCancerType.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedCancerType))
            )
            .andExpect(status().isOk());

        // Validate the CancerType in the database
        List<CancerType> cancerTypeList = cancerTypeRepository.findAll();
        assertThat(cancerTypeList).hasSize(databaseSizeBeforeUpdate);
        CancerType testCancerType = cancerTypeList.get(cancerTypeList.size() - 1);
        assertThat(testCancerType.getCode()).isEqualTo(UPDATED_CODE);
        assertThat(testCancerType.getColor()).isEqualTo(UPDATED_COLOR);
        assertThat(testCancerType.getLevel()).isEqualTo(UPDATED_LEVEL);
        assertThat(testCancerType.getMainType()).isEqualTo(UPDATED_MAIN_TYPE);
        assertThat(testCancerType.getSubtype()).isEqualTo(UPDATED_SUBTYPE);
        assertThat(testCancerType.getTissue()).isEqualTo(UPDATED_TISSUE);
        assertThat(testCancerType.getTumorForm()).isEqualTo(UPDATED_TUMOR_FORM);
    }

    @Test
    @Transactional
    void putNonExistingCancerType() throws Exception {
        int databaseSizeBeforeUpdate = cancerTypeRepository.findAll().size();
        cancerType.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCancerTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, cancerType.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(cancerType))
            )
            .andExpect(status().isBadRequest());

        // Validate the CancerType in the database
        List<CancerType> cancerTypeList = cancerTypeRepository.findAll();
        assertThat(cancerTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCancerType() throws Exception {
        int databaseSizeBeforeUpdate = cancerTypeRepository.findAll().size();
        cancerType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCancerTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(cancerType))
            )
            .andExpect(status().isBadRequest());

        // Validate the CancerType in the database
        List<CancerType> cancerTypeList = cancerTypeRepository.findAll();
        assertThat(cancerTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCancerType() throws Exception {
        int databaseSizeBeforeUpdate = cancerTypeRepository.findAll().size();
        cancerType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCancerTypeMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(cancerType))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CancerType in the database
        List<CancerType> cancerTypeList = cancerTypeRepository.findAll();
        assertThat(cancerTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCancerTypeWithPatch() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        int databaseSizeBeforeUpdate = cancerTypeRepository.findAll().size();

        // Update the cancerType using partial update
        CancerType partialUpdatedCancerType = new CancerType();
        partialUpdatedCancerType.setId(cancerType.getId());

        partialUpdatedCancerType
            .code(UPDATED_CODE)
            .color(UPDATED_COLOR)
            .subtype(UPDATED_SUBTYPE)
            .tissue(UPDATED_TISSUE)
            .tumorForm(UPDATED_TUMOR_FORM);

        restCancerTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCancerType.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedCancerType))
            )
            .andExpect(status().isOk());

        // Validate the CancerType in the database
        List<CancerType> cancerTypeList = cancerTypeRepository.findAll();
        assertThat(cancerTypeList).hasSize(databaseSizeBeforeUpdate);
        CancerType testCancerType = cancerTypeList.get(cancerTypeList.size() - 1);
        assertThat(testCancerType.getCode()).isEqualTo(UPDATED_CODE);
        assertThat(testCancerType.getColor()).isEqualTo(UPDATED_COLOR);
        assertThat(testCancerType.getLevel()).isEqualTo(DEFAULT_LEVEL);
        assertThat(testCancerType.getMainType()).isEqualTo(DEFAULT_MAIN_TYPE);
        assertThat(testCancerType.getSubtype()).isEqualTo(UPDATED_SUBTYPE);
        assertThat(testCancerType.getTissue()).isEqualTo(UPDATED_TISSUE);
        assertThat(testCancerType.getTumorForm()).isEqualTo(UPDATED_TUMOR_FORM);
    }

    @Test
    @Transactional
    void fullUpdateCancerTypeWithPatch() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        int databaseSizeBeforeUpdate = cancerTypeRepository.findAll().size();

        // Update the cancerType using partial update
        CancerType partialUpdatedCancerType = new CancerType();
        partialUpdatedCancerType.setId(cancerType.getId());

        partialUpdatedCancerType
            .code(UPDATED_CODE)
            .color(UPDATED_COLOR)
            .level(UPDATED_LEVEL)
            .mainType(UPDATED_MAIN_TYPE)
            .subtype(UPDATED_SUBTYPE)
            .tissue(UPDATED_TISSUE)
            .tumorForm(UPDATED_TUMOR_FORM);

        restCancerTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCancerType.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedCancerType))
            )
            .andExpect(status().isOk());

        // Validate the CancerType in the database
        List<CancerType> cancerTypeList = cancerTypeRepository.findAll();
        assertThat(cancerTypeList).hasSize(databaseSizeBeforeUpdate);
        CancerType testCancerType = cancerTypeList.get(cancerTypeList.size() - 1);
        assertThat(testCancerType.getCode()).isEqualTo(UPDATED_CODE);
        assertThat(testCancerType.getColor()).isEqualTo(UPDATED_COLOR);
        assertThat(testCancerType.getLevel()).isEqualTo(UPDATED_LEVEL);
        assertThat(testCancerType.getMainType()).isEqualTo(UPDATED_MAIN_TYPE);
        assertThat(testCancerType.getSubtype()).isEqualTo(UPDATED_SUBTYPE);
        assertThat(testCancerType.getTissue()).isEqualTo(UPDATED_TISSUE);
        assertThat(testCancerType.getTumorForm()).isEqualTo(UPDATED_TUMOR_FORM);
    }

    @Test
    @Transactional
    void patchNonExistingCancerType() throws Exception {
        int databaseSizeBeforeUpdate = cancerTypeRepository.findAll().size();
        cancerType.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCancerTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, cancerType.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(cancerType))
            )
            .andExpect(status().isBadRequest());

        // Validate the CancerType in the database
        List<CancerType> cancerTypeList = cancerTypeRepository.findAll();
        assertThat(cancerTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCancerType() throws Exception {
        int databaseSizeBeforeUpdate = cancerTypeRepository.findAll().size();
        cancerType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCancerTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(cancerType))
            )
            .andExpect(status().isBadRequest());

        // Validate the CancerType in the database
        List<CancerType> cancerTypeList = cancerTypeRepository.findAll();
        assertThat(cancerTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCancerType() throws Exception {
        int databaseSizeBeforeUpdate = cancerTypeRepository.findAll().size();
        cancerType.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCancerTypeMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(cancerType))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CancerType in the database
        List<CancerType> cancerTypeList = cancerTypeRepository.findAll();
        assertThat(cancerTypeList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCancerType() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        int databaseSizeBeforeDelete = cancerTypeRepository.findAll().size();

        // Delete the cancerType
        restCancerTypeMockMvc
            .perform(delete(ENTITY_API_URL_ID, cancerType.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<CancerType> cancerTypeList = cancerTypeRepository.findAll();
        assertThat(cancerTypeList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
