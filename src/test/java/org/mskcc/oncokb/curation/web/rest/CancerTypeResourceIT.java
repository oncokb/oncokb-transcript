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
import org.mskcc.oncokb.curation.domain.CancerType;
import org.mskcc.oncokb.curation.domain.DeviceUsageIndication;
import org.mskcc.oncokb.curation.domain.enumeration.TumorForm;
import org.mskcc.oncokb.curation.repository.CancerTypeRepository;
import org.mskcc.oncokb.curation.service.criteria.CancerTypeCriteria;
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
    private static final Integer SMALLER_LEVEL = 1 - 1;

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
    void getCancerTypesByIdFiltering() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        Long id = cancerType.getId();

        defaultCancerTypeShouldBeFound("id.equals=" + id);
        defaultCancerTypeShouldNotBeFound("id.notEquals=" + id);

        defaultCancerTypeShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultCancerTypeShouldNotBeFound("id.greaterThan=" + id);

        defaultCancerTypeShouldBeFound("id.lessThanOrEqual=" + id);
        defaultCancerTypeShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllCancerTypesByCodeIsEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where code equals to DEFAULT_CODE
        defaultCancerTypeShouldBeFound("code.equals=" + DEFAULT_CODE);

        // Get all the cancerTypeList where code equals to UPDATED_CODE
        defaultCancerTypeShouldNotBeFound("code.equals=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllCancerTypesByCodeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where code not equals to DEFAULT_CODE
        defaultCancerTypeShouldNotBeFound("code.notEquals=" + DEFAULT_CODE);

        // Get all the cancerTypeList where code not equals to UPDATED_CODE
        defaultCancerTypeShouldBeFound("code.notEquals=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllCancerTypesByCodeIsInShouldWork() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where code in DEFAULT_CODE or UPDATED_CODE
        defaultCancerTypeShouldBeFound("code.in=" + DEFAULT_CODE + "," + UPDATED_CODE);

        // Get all the cancerTypeList where code equals to UPDATED_CODE
        defaultCancerTypeShouldNotBeFound("code.in=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllCancerTypesByCodeIsNullOrNotNull() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where code is not null
        defaultCancerTypeShouldBeFound("code.specified=true");

        // Get all the cancerTypeList where code is null
        defaultCancerTypeShouldNotBeFound("code.specified=false");
    }

    @Test
    @Transactional
    void getAllCancerTypesByCodeContainsSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where code contains DEFAULT_CODE
        defaultCancerTypeShouldBeFound("code.contains=" + DEFAULT_CODE);

        // Get all the cancerTypeList where code contains UPDATED_CODE
        defaultCancerTypeShouldNotBeFound("code.contains=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllCancerTypesByCodeNotContainsSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where code does not contain DEFAULT_CODE
        defaultCancerTypeShouldNotBeFound("code.doesNotContain=" + DEFAULT_CODE);

        // Get all the cancerTypeList where code does not contain UPDATED_CODE
        defaultCancerTypeShouldBeFound("code.doesNotContain=" + UPDATED_CODE);
    }

    @Test
    @Transactional
    void getAllCancerTypesByColorIsEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where color equals to DEFAULT_COLOR
        defaultCancerTypeShouldBeFound("color.equals=" + DEFAULT_COLOR);

        // Get all the cancerTypeList where color equals to UPDATED_COLOR
        defaultCancerTypeShouldNotBeFound("color.equals=" + UPDATED_COLOR);
    }

    @Test
    @Transactional
    void getAllCancerTypesByColorIsNotEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where color not equals to DEFAULT_COLOR
        defaultCancerTypeShouldNotBeFound("color.notEquals=" + DEFAULT_COLOR);

        // Get all the cancerTypeList where color not equals to UPDATED_COLOR
        defaultCancerTypeShouldBeFound("color.notEquals=" + UPDATED_COLOR);
    }

    @Test
    @Transactional
    void getAllCancerTypesByColorIsInShouldWork() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where color in DEFAULT_COLOR or UPDATED_COLOR
        defaultCancerTypeShouldBeFound("color.in=" + DEFAULT_COLOR + "," + UPDATED_COLOR);

        // Get all the cancerTypeList where color equals to UPDATED_COLOR
        defaultCancerTypeShouldNotBeFound("color.in=" + UPDATED_COLOR);
    }

    @Test
    @Transactional
    void getAllCancerTypesByColorIsNullOrNotNull() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where color is not null
        defaultCancerTypeShouldBeFound("color.specified=true");

        // Get all the cancerTypeList where color is null
        defaultCancerTypeShouldNotBeFound("color.specified=false");
    }

    @Test
    @Transactional
    void getAllCancerTypesByColorContainsSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where color contains DEFAULT_COLOR
        defaultCancerTypeShouldBeFound("color.contains=" + DEFAULT_COLOR);

        // Get all the cancerTypeList where color contains UPDATED_COLOR
        defaultCancerTypeShouldNotBeFound("color.contains=" + UPDATED_COLOR);
    }

    @Test
    @Transactional
    void getAllCancerTypesByColorNotContainsSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where color does not contain DEFAULT_COLOR
        defaultCancerTypeShouldNotBeFound("color.doesNotContain=" + DEFAULT_COLOR);

        // Get all the cancerTypeList where color does not contain UPDATED_COLOR
        defaultCancerTypeShouldBeFound("color.doesNotContain=" + UPDATED_COLOR);
    }

    @Test
    @Transactional
    void getAllCancerTypesByLevelIsEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where level equals to DEFAULT_LEVEL
        defaultCancerTypeShouldBeFound("level.equals=" + DEFAULT_LEVEL);

        // Get all the cancerTypeList where level equals to UPDATED_LEVEL
        defaultCancerTypeShouldNotBeFound("level.equals=" + UPDATED_LEVEL);
    }

    @Test
    @Transactional
    void getAllCancerTypesByLevelIsNotEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where level not equals to DEFAULT_LEVEL
        defaultCancerTypeShouldNotBeFound("level.notEquals=" + DEFAULT_LEVEL);

        // Get all the cancerTypeList where level not equals to UPDATED_LEVEL
        defaultCancerTypeShouldBeFound("level.notEquals=" + UPDATED_LEVEL);
    }

    @Test
    @Transactional
    void getAllCancerTypesByLevelIsInShouldWork() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where level in DEFAULT_LEVEL or UPDATED_LEVEL
        defaultCancerTypeShouldBeFound("level.in=" + DEFAULT_LEVEL + "," + UPDATED_LEVEL);

        // Get all the cancerTypeList where level equals to UPDATED_LEVEL
        defaultCancerTypeShouldNotBeFound("level.in=" + UPDATED_LEVEL);
    }

    @Test
    @Transactional
    void getAllCancerTypesByLevelIsNullOrNotNull() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where level is not null
        defaultCancerTypeShouldBeFound("level.specified=true");

        // Get all the cancerTypeList where level is null
        defaultCancerTypeShouldNotBeFound("level.specified=false");
    }

    @Test
    @Transactional
    void getAllCancerTypesByLevelIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where level is greater than or equal to DEFAULT_LEVEL
        defaultCancerTypeShouldBeFound("level.greaterThanOrEqual=" + DEFAULT_LEVEL);

        // Get all the cancerTypeList where level is greater than or equal to UPDATED_LEVEL
        defaultCancerTypeShouldNotBeFound("level.greaterThanOrEqual=" + UPDATED_LEVEL);
    }

    @Test
    @Transactional
    void getAllCancerTypesByLevelIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where level is less than or equal to DEFAULT_LEVEL
        defaultCancerTypeShouldBeFound("level.lessThanOrEqual=" + DEFAULT_LEVEL);

        // Get all the cancerTypeList where level is less than or equal to SMALLER_LEVEL
        defaultCancerTypeShouldNotBeFound("level.lessThanOrEqual=" + SMALLER_LEVEL);
    }

    @Test
    @Transactional
    void getAllCancerTypesByLevelIsLessThanSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where level is less than DEFAULT_LEVEL
        defaultCancerTypeShouldNotBeFound("level.lessThan=" + DEFAULT_LEVEL);

        // Get all the cancerTypeList where level is less than UPDATED_LEVEL
        defaultCancerTypeShouldBeFound("level.lessThan=" + UPDATED_LEVEL);
    }

    @Test
    @Transactional
    void getAllCancerTypesByLevelIsGreaterThanSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where level is greater than DEFAULT_LEVEL
        defaultCancerTypeShouldNotBeFound("level.greaterThan=" + DEFAULT_LEVEL);

        // Get all the cancerTypeList where level is greater than SMALLER_LEVEL
        defaultCancerTypeShouldBeFound("level.greaterThan=" + SMALLER_LEVEL);
    }

    @Test
    @Transactional
    void getAllCancerTypesByMainTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where mainType equals to DEFAULT_MAIN_TYPE
        defaultCancerTypeShouldBeFound("mainType.equals=" + DEFAULT_MAIN_TYPE);

        // Get all the cancerTypeList where mainType equals to UPDATED_MAIN_TYPE
        defaultCancerTypeShouldNotBeFound("mainType.equals=" + UPDATED_MAIN_TYPE);
    }

    @Test
    @Transactional
    void getAllCancerTypesByMainTypeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where mainType not equals to DEFAULT_MAIN_TYPE
        defaultCancerTypeShouldNotBeFound("mainType.notEquals=" + DEFAULT_MAIN_TYPE);

        // Get all the cancerTypeList where mainType not equals to UPDATED_MAIN_TYPE
        defaultCancerTypeShouldBeFound("mainType.notEquals=" + UPDATED_MAIN_TYPE);
    }

    @Test
    @Transactional
    void getAllCancerTypesByMainTypeIsInShouldWork() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where mainType in DEFAULT_MAIN_TYPE or UPDATED_MAIN_TYPE
        defaultCancerTypeShouldBeFound("mainType.in=" + DEFAULT_MAIN_TYPE + "," + UPDATED_MAIN_TYPE);

        // Get all the cancerTypeList where mainType equals to UPDATED_MAIN_TYPE
        defaultCancerTypeShouldNotBeFound("mainType.in=" + UPDATED_MAIN_TYPE);
    }

    @Test
    @Transactional
    void getAllCancerTypesByMainTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where mainType is not null
        defaultCancerTypeShouldBeFound("mainType.specified=true");

        // Get all the cancerTypeList where mainType is null
        defaultCancerTypeShouldNotBeFound("mainType.specified=false");
    }

    @Test
    @Transactional
    void getAllCancerTypesByMainTypeContainsSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where mainType contains DEFAULT_MAIN_TYPE
        defaultCancerTypeShouldBeFound("mainType.contains=" + DEFAULT_MAIN_TYPE);

        // Get all the cancerTypeList where mainType contains UPDATED_MAIN_TYPE
        defaultCancerTypeShouldNotBeFound("mainType.contains=" + UPDATED_MAIN_TYPE);
    }

    @Test
    @Transactional
    void getAllCancerTypesByMainTypeNotContainsSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where mainType does not contain DEFAULT_MAIN_TYPE
        defaultCancerTypeShouldNotBeFound("mainType.doesNotContain=" + DEFAULT_MAIN_TYPE);

        // Get all the cancerTypeList where mainType does not contain UPDATED_MAIN_TYPE
        defaultCancerTypeShouldBeFound("mainType.doesNotContain=" + UPDATED_MAIN_TYPE);
    }

    @Test
    @Transactional
    void getAllCancerTypesBySubtypeIsEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where subtype equals to DEFAULT_SUBTYPE
        defaultCancerTypeShouldBeFound("subtype.equals=" + DEFAULT_SUBTYPE);

        // Get all the cancerTypeList where subtype equals to UPDATED_SUBTYPE
        defaultCancerTypeShouldNotBeFound("subtype.equals=" + UPDATED_SUBTYPE);
    }

    @Test
    @Transactional
    void getAllCancerTypesBySubtypeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where subtype not equals to DEFAULT_SUBTYPE
        defaultCancerTypeShouldNotBeFound("subtype.notEquals=" + DEFAULT_SUBTYPE);

        // Get all the cancerTypeList where subtype not equals to UPDATED_SUBTYPE
        defaultCancerTypeShouldBeFound("subtype.notEquals=" + UPDATED_SUBTYPE);
    }

    @Test
    @Transactional
    void getAllCancerTypesBySubtypeIsInShouldWork() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where subtype in DEFAULT_SUBTYPE or UPDATED_SUBTYPE
        defaultCancerTypeShouldBeFound("subtype.in=" + DEFAULT_SUBTYPE + "," + UPDATED_SUBTYPE);

        // Get all the cancerTypeList where subtype equals to UPDATED_SUBTYPE
        defaultCancerTypeShouldNotBeFound("subtype.in=" + UPDATED_SUBTYPE);
    }

    @Test
    @Transactional
    void getAllCancerTypesBySubtypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where subtype is not null
        defaultCancerTypeShouldBeFound("subtype.specified=true");

        // Get all the cancerTypeList where subtype is null
        defaultCancerTypeShouldNotBeFound("subtype.specified=false");
    }

    @Test
    @Transactional
    void getAllCancerTypesBySubtypeContainsSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where subtype contains DEFAULT_SUBTYPE
        defaultCancerTypeShouldBeFound("subtype.contains=" + DEFAULT_SUBTYPE);

        // Get all the cancerTypeList where subtype contains UPDATED_SUBTYPE
        defaultCancerTypeShouldNotBeFound("subtype.contains=" + UPDATED_SUBTYPE);
    }

    @Test
    @Transactional
    void getAllCancerTypesBySubtypeNotContainsSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where subtype does not contain DEFAULT_SUBTYPE
        defaultCancerTypeShouldNotBeFound("subtype.doesNotContain=" + DEFAULT_SUBTYPE);

        // Get all the cancerTypeList where subtype does not contain UPDATED_SUBTYPE
        defaultCancerTypeShouldBeFound("subtype.doesNotContain=" + UPDATED_SUBTYPE);
    }

    @Test
    @Transactional
    void getAllCancerTypesByTissueIsEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where tissue equals to DEFAULT_TISSUE
        defaultCancerTypeShouldBeFound("tissue.equals=" + DEFAULT_TISSUE);

        // Get all the cancerTypeList where tissue equals to UPDATED_TISSUE
        defaultCancerTypeShouldNotBeFound("tissue.equals=" + UPDATED_TISSUE);
    }

    @Test
    @Transactional
    void getAllCancerTypesByTissueIsNotEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where tissue not equals to DEFAULT_TISSUE
        defaultCancerTypeShouldNotBeFound("tissue.notEquals=" + DEFAULT_TISSUE);

        // Get all the cancerTypeList where tissue not equals to UPDATED_TISSUE
        defaultCancerTypeShouldBeFound("tissue.notEquals=" + UPDATED_TISSUE);
    }

    @Test
    @Transactional
    void getAllCancerTypesByTissueIsInShouldWork() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where tissue in DEFAULT_TISSUE or UPDATED_TISSUE
        defaultCancerTypeShouldBeFound("tissue.in=" + DEFAULT_TISSUE + "," + UPDATED_TISSUE);

        // Get all the cancerTypeList where tissue equals to UPDATED_TISSUE
        defaultCancerTypeShouldNotBeFound("tissue.in=" + UPDATED_TISSUE);
    }

    @Test
    @Transactional
    void getAllCancerTypesByTissueIsNullOrNotNull() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where tissue is not null
        defaultCancerTypeShouldBeFound("tissue.specified=true");

        // Get all the cancerTypeList where tissue is null
        defaultCancerTypeShouldNotBeFound("tissue.specified=false");
    }

    @Test
    @Transactional
    void getAllCancerTypesByTissueContainsSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where tissue contains DEFAULT_TISSUE
        defaultCancerTypeShouldBeFound("tissue.contains=" + DEFAULT_TISSUE);

        // Get all the cancerTypeList where tissue contains UPDATED_TISSUE
        defaultCancerTypeShouldNotBeFound("tissue.contains=" + UPDATED_TISSUE);
    }

    @Test
    @Transactional
    void getAllCancerTypesByTissueNotContainsSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where tissue does not contain DEFAULT_TISSUE
        defaultCancerTypeShouldNotBeFound("tissue.doesNotContain=" + DEFAULT_TISSUE);

        // Get all the cancerTypeList where tissue does not contain UPDATED_TISSUE
        defaultCancerTypeShouldBeFound("tissue.doesNotContain=" + UPDATED_TISSUE);
    }

    @Test
    @Transactional
    void getAllCancerTypesByTumorFormIsEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where tumorForm equals to DEFAULT_TUMOR_FORM
        defaultCancerTypeShouldBeFound("tumorForm.equals=" + DEFAULT_TUMOR_FORM);

        // Get all the cancerTypeList where tumorForm equals to UPDATED_TUMOR_FORM
        defaultCancerTypeShouldNotBeFound("tumorForm.equals=" + UPDATED_TUMOR_FORM);
    }

    @Test
    @Transactional
    void getAllCancerTypesByTumorFormIsNotEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where tumorForm not equals to DEFAULT_TUMOR_FORM
        defaultCancerTypeShouldNotBeFound("tumorForm.notEquals=" + DEFAULT_TUMOR_FORM);

        // Get all the cancerTypeList where tumorForm not equals to UPDATED_TUMOR_FORM
        defaultCancerTypeShouldBeFound("tumorForm.notEquals=" + UPDATED_TUMOR_FORM);
    }

    @Test
    @Transactional
    void getAllCancerTypesByTumorFormIsInShouldWork() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where tumorForm in DEFAULT_TUMOR_FORM or UPDATED_TUMOR_FORM
        defaultCancerTypeShouldBeFound("tumorForm.in=" + DEFAULT_TUMOR_FORM + "," + UPDATED_TUMOR_FORM);

        // Get all the cancerTypeList where tumorForm equals to UPDATED_TUMOR_FORM
        defaultCancerTypeShouldNotBeFound("tumorForm.in=" + UPDATED_TUMOR_FORM);
    }

    @Test
    @Transactional
    void getAllCancerTypesByTumorFormIsNullOrNotNull() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);

        // Get all the cancerTypeList where tumorForm is not null
        defaultCancerTypeShouldBeFound("tumorForm.specified=true");

        // Get all the cancerTypeList where tumorForm is null
        defaultCancerTypeShouldNotBeFound("tumorForm.specified=false");
    }

    @Test
    @Transactional
    void getAllCancerTypesByChildrenIsEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);
        CancerType children;
        if (TestUtil.findAll(em, CancerType.class).isEmpty()) {
            children = CancerTypeResourceIT.createEntity(em);
            em.persist(children);
            em.flush();
        } else {
            children = TestUtil.findAll(em, CancerType.class).get(0);
        }
        em.persist(children);
        em.flush();
        cancerType.addChildren(children);
        cancerTypeRepository.saveAndFlush(cancerType);
        Long childrenId = children.getId();

        // Get all the cancerTypeList where children equals to childrenId
        defaultCancerTypeShouldBeFound("childrenId.equals=" + childrenId);

        // Get all the cancerTypeList where children equals to (childrenId + 1)
        defaultCancerTypeShouldNotBeFound("childrenId.equals=" + (childrenId + 1));
    }

    @Test
    @Transactional
    void getAllCancerTypesByDeviceUsageIndicationIsEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);
        DeviceUsageIndication deviceUsageIndication;
        if (TestUtil.findAll(em, DeviceUsageIndication.class).isEmpty()) {
            deviceUsageIndication = DeviceUsageIndicationResourceIT.createEntity(em);
            em.persist(deviceUsageIndication);
            em.flush();
        } else {
            deviceUsageIndication = TestUtil.findAll(em, DeviceUsageIndication.class).get(0);
        }
        em.persist(deviceUsageIndication);
        em.flush();
        cancerType.addDeviceUsageIndication(deviceUsageIndication);
        cancerTypeRepository.saveAndFlush(cancerType);
        Long deviceUsageIndicationId = deviceUsageIndication.getId();

        // Get all the cancerTypeList where deviceUsageIndication equals to deviceUsageIndicationId
        defaultCancerTypeShouldBeFound("deviceUsageIndicationId.equals=" + deviceUsageIndicationId);

        // Get all the cancerTypeList where deviceUsageIndication equals to (deviceUsageIndicationId + 1)
        defaultCancerTypeShouldNotBeFound("deviceUsageIndicationId.equals=" + (deviceUsageIndicationId + 1));
    }

    @Test
    @Transactional
    void getAllCancerTypesByParentIsEqualToSomething() throws Exception {
        // Initialize the database
        cancerTypeRepository.saveAndFlush(cancerType);
        CancerType parent;
        if (TestUtil.findAll(em, CancerType.class).isEmpty()) {
            parent = CancerTypeResourceIT.createEntity(em);
            em.persist(parent);
            em.flush();
        } else {
            parent = TestUtil.findAll(em, CancerType.class).get(0);
        }
        em.persist(parent);
        em.flush();
        cancerType.setParent(parent);
        cancerTypeRepository.saveAndFlush(cancerType);
        Long parentId = parent.getId();

        // Get all the cancerTypeList where parent equals to parentId
        defaultCancerTypeShouldBeFound("parentId.equals=" + parentId);

        // Get all the cancerTypeList where parent equals to (parentId + 1)
        defaultCancerTypeShouldNotBeFound("parentId.equals=" + (parentId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultCancerTypeShouldBeFound(String filter) throws Exception {
        restCancerTypeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
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

        // Check, that the count call also returns 1
        restCancerTypeMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultCancerTypeShouldNotBeFound(String filter) throws Exception {
        restCancerTypeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restCancerTypeMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
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
