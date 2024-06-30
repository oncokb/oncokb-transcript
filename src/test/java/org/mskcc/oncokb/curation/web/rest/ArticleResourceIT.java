package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.domain.Association;
import org.mskcc.oncokb.curation.domain.FdaSubmission;
import org.mskcc.oncokb.curation.domain.Flag;
import org.mskcc.oncokb.curation.domain.Synonym;
import org.mskcc.oncokb.curation.domain.enumeration.ArticleType;
import org.mskcc.oncokb.curation.repository.ArticleRepository;
import org.mskcc.oncokb.curation.service.ArticleService;
import org.mskcc.oncokb.curation.service.criteria.ArticleCriteria;
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
 * Integration tests for the {@link ArticleResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ArticleResourceIT {

    private static final ArticleType DEFAULT_TYPE = ArticleType.PUBMED;
    private static final ArticleType UPDATED_TYPE = ArticleType.ABSTRACT;

    private static final String DEFAULT_UID = "AAAAAAAAAA";
    private static final String UPDATED_UID = "BBBBBBBBBB";

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_CONTENT = "AAAAAAAAAA";
    private static final String UPDATED_CONTENT = "BBBBBBBBBB";

    private static final String DEFAULT_LINK = "AAAAAAAAAA";
    private static final String UPDATED_LINK = "BBBBBBBBBB";

    private static final String DEFAULT_AUTHORS = "AAAAAAAAAA";
    private static final String UPDATED_AUTHORS = "BBBBBBBBBB";

    private static final Instant DEFAULT_DATE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_DATE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/articles";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ArticleRepository articleRepository;

    @Mock
    private ArticleRepository articleRepositoryMock;

    @Mock
    private ArticleService articleServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restArticleMockMvc;

    private Article article;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Article createEntity(EntityManager em) {
        Article article = new Article()
            .type(DEFAULT_TYPE)
            .uid(DEFAULT_UID)
            .title(DEFAULT_TITLE)
            .content(DEFAULT_CONTENT)
            .link(DEFAULT_LINK)
            .authors(DEFAULT_AUTHORS)
            .date(DEFAULT_DATE);
        return article;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Article createUpdatedEntity(EntityManager em) {
        Article article = new Article()
            .type(UPDATED_TYPE)
            .uid(UPDATED_UID)
            .title(UPDATED_TITLE)
            .content(UPDATED_CONTENT)
            .link(UPDATED_LINK)
            .authors(UPDATED_AUTHORS)
            .date(UPDATED_DATE);
        return article;
    }

    @BeforeEach
    public void initTest() {
        article = createEntity(em);
    }

    @Test
    @Transactional
    void createArticle() throws Exception {
        int databaseSizeBeforeCreate = articleRepository.findAll().size();
        // Create the Article
        restArticleMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isCreated());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeCreate + 1);
        Article testArticle = articleList.get(articleList.size() - 1);
        assertThat(testArticle.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testArticle.getUid()).isEqualTo(DEFAULT_UID);
        assertThat(testArticle.getTitle()).isEqualTo(DEFAULT_TITLE);
        assertThat(testArticle.getContent()).isEqualTo(DEFAULT_CONTENT);
        assertThat(testArticle.getLink()).isEqualTo(DEFAULT_LINK);
        assertThat(testArticle.getAuthors()).isEqualTo(DEFAULT_AUTHORS);
        assertThat(testArticle.getDate()).isEqualTo(DEFAULT_DATE);
    }

    @Test
    @Transactional
    void createArticleWithExistingId() throws Exception {
        // Create the Article with an existing ID
        article.setId(1L);

        int databaseSizeBeforeCreate = articleRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restArticleMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isBadRequest());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = articleRepository.findAll().size();
        // set the field null
        article.setType(null);

        // Create the Article, which fails.

        restArticleMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isBadRequest());

        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllArticles() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList
        restArticleMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(article.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].uid").value(hasItem(DEFAULT_UID)))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE.toString())))
            .andExpect(jsonPath("$.[*].content").value(hasItem(DEFAULT_CONTENT.toString())))
            .andExpect(jsonPath("$.[*].link").value(hasItem(DEFAULT_LINK)))
            .andExpect(jsonPath("$.[*].authors").value(hasItem(DEFAULT_AUTHORS)))
            .andExpect(jsonPath("$.[*].date").value(hasItem(DEFAULT_DATE.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllArticlesWithEagerRelationshipsIsEnabled() throws Exception {
        when(articleServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restArticleMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(articleServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllArticlesWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(articleServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restArticleMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(articleServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getArticle() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get the article
        restArticleMockMvc
            .perform(get(ENTITY_API_URL_ID, article.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(article.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.uid").value(DEFAULT_UID))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE.toString()))
            .andExpect(jsonPath("$.content").value(DEFAULT_CONTENT.toString()))
            .andExpect(jsonPath("$.link").value(DEFAULT_LINK))
            .andExpect(jsonPath("$.authors").value(DEFAULT_AUTHORS))
            .andExpect(jsonPath("$.date").value(DEFAULT_DATE.toString()));
    }

    @Test
    @Transactional
    void getArticlesByIdFiltering() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        Long id = article.getId();

        defaultArticleShouldBeFound("id.equals=" + id);
        defaultArticleShouldNotBeFound("id.notEquals=" + id);

        defaultArticleShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultArticleShouldNotBeFound("id.greaterThan=" + id);

        defaultArticleShouldBeFound("id.lessThanOrEqual=" + id);
        defaultArticleShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllArticlesByTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where type equals to DEFAULT_TYPE
        defaultArticleShouldBeFound("type.equals=" + DEFAULT_TYPE);

        // Get all the articleList where type equals to UPDATED_TYPE
        defaultArticleShouldNotBeFound("type.equals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllArticlesByTypeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where type not equals to DEFAULT_TYPE
        defaultArticleShouldNotBeFound("type.notEquals=" + DEFAULT_TYPE);

        // Get all the articleList where type not equals to UPDATED_TYPE
        defaultArticleShouldBeFound("type.notEquals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllArticlesByTypeIsInShouldWork() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where type in DEFAULT_TYPE or UPDATED_TYPE
        defaultArticleShouldBeFound("type.in=" + DEFAULT_TYPE + "," + UPDATED_TYPE);

        // Get all the articleList where type equals to UPDATED_TYPE
        defaultArticleShouldNotBeFound("type.in=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllArticlesByTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where type is not null
        defaultArticleShouldBeFound("type.specified=true");

        // Get all the articleList where type is null
        defaultArticleShouldNotBeFound("type.specified=false");
    }

    @Test
    @Transactional
    void getAllArticlesByUidIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where uid equals to DEFAULT_UID
        defaultArticleShouldBeFound("uid.equals=" + DEFAULT_UID);

        // Get all the articleList where uid equals to UPDATED_UID
        defaultArticleShouldNotBeFound("uid.equals=" + UPDATED_UID);
    }

    @Test
    @Transactional
    void getAllArticlesByUidIsNotEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where uid not equals to DEFAULT_UID
        defaultArticleShouldNotBeFound("uid.notEquals=" + DEFAULT_UID);

        // Get all the articleList where uid not equals to UPDATED_UID
        defaultArticleShouldBeFound("uid.notEquals=" + UPDATED_UID);
    }

    @Test
    @Transactional
    void getAllArticlesByUidIsInShouldWork() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where uid in DEFAULT_UID or UPDATED_UID
        defaultArticleShouldBeFound("uid.in=" + DEFAULT_UID + "," + UPDATED_UID);

        // Get all the articleList where uid equals to UPDATED_UID
        defaultArticleShouldNotBeFound("uid.in=" + UPDATED_UID);
    }

    @Test
    @Transactional
    void getAllArticlesByUidIsNullOrNotNull() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where uid is not null
        defaultArticleShouldBeFound("uid.specified=true");

        // Get all the articleList where uid is null
        defaultArticleShouldNotBeFound("uid.specified=false");
    }

    @Test
    @Transactional
    void getAllArticlesByUidContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where uid contains DEFAULT_UID
        defaultArticleShouldBeFound("uid.contains=" + DEFAULT_UID);

        // Get all the articleList where uid contains UPDATED_UID
        defaultArticleShouldNotBeFound("uid.contains=" + UPDATED_UID);
    }

    @Test
    @Transactional
    void getAllArticlesByUidNotContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where uid does not contain DEFAULT_UID
        defaultArticleShouldNotBeFound("uid.doesNotContain=" + DEFAULT_UID);

        // Get all the articleList where uid does not contain UPDATED_UID
        defaultArticleShouldBeFound("uid.doesNotContain=" + UPDATED_UID);
    }

    @Test
    @Transactional
    void getAllArticlesByLinkIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where link equals to DEFAULT_LINK
        defaultArticleShouldBeFound("link.equals=" + DEFAULT_LINK);

        // Get all the articleList where link equals to UPDATED_LINK
        defaultArticleShouldNotBeFound("link.equals=" + UPDATED_LINK);
    }

    @Test
    @Transactional
    void getAllArticlesByLinkIsNotEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where link not equals to DEFAULT_LINK
        defaultArticleShouldNotBeFound("link.notEquals=" + DEFAULT_LINK);

        // Get all the articleList where link not equals to UPDATED_LINK
        defaultArticleShouldBeFound("link.notEquals=" + UPDATED_LINK);
    }

    @Test
    @Transactional
    void getAllArticlesByLinkIsInShouldWork() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where link in DEFAULT_LINK or UPDATED_LINK
        defaultArticleShouldBeFound("link.in=" + DEFAULT_LINK + "," + UPDATED_LINK);

        // Get all the articleList where link equals to UPDATED_LINK
        defaultArticleShouldNotBeFound("link.in=" + UPDATED_LINK);
    }

    @Test
    @Transactional
    void getAllArticlesByLinkIsNullOrNotNull() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where link is not null
        defaultArticleShouldBeFound("link.specified=true");

        // Get all the articleList where link is null
        defaultArticleShouldNotBeFound("link.specified=false");
    }

    @Test
    @Transactional
    void getAllArticlesByLinkContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where link contains DEFAULT_LINK
        defaultArticleShouldBeFound("link.contains=" + DEFAULT_LINK);

        // Get all the articleList where link contains UPDATED_LINK
        defaultArticleShouldNotBeFound("link.contains=" + UPDATED_LINK);
    }

    @Test
    @Transactional
    void getAllArticlesByLinkNotContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where link does not contain DEFAULT_LINK
        defaultArticleShouldNotBeFound("link.doesNotContain=" + DEFAULT_LINK);

        // Get all the articleList where link does not contain UPDATED_LINK
        defaultArticleShouldBeFound("link.doesNotContain=" + UPDATED_LINK);
    }

    @Test
    @Transactional
    void getAllArticlesByAuthorsIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where authors equals to DEFAULT_AUTHORS
        defaultArticleShouldBeFound("authors.equals=" + DEFAULT_AUTHORS);

        // Get all the articleList where authors equals to UPDATED_AUTHORS
        defaultArticleShouldNotBeFound("authors.equals=" + UPDATED_AUTHORS);
    }

    @Test
    @Transactional
    void getAllArticlesByAuthorsIsNotEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where authors not equals to DEFAULT_AUTHORS
        defaultArticleShouldNotBeFound("authors.notEquals=" + DEFAULT_AUTHORS);

        // Get all the articleList where authors not equals to UPDATED_AUTHORS
        defaultArticleShouldBeFound("authors.notEquals=" + UPDATED_AUTHORS);
    }

    @Test
    @Transactional
    void getAllArticlesByAuthorsIsInShouldWork() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where authors in DEFAULT_AUTHORS or UPDATED_AUTHORS
        defaultArticleShouldBeFound("authors.in=" + DEFAULT_AUTHORS + "," + UPDATED_AUTHORS);

        // Get all the articleList where authors equals to UPDATED_AUTHORS
        defaultArticleShouldNotBeFound("authors.in=" + UPDATED_AUTHORS);
    }

    @Test
    @Transactional
    void getAllArticlesByAuthorsIsNullOrNotNull() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where authors is not null
        defaultArticleShouldBeFound("authors.specified=true");

        // Get all the articleList where authors is null
        defaultArticleShouldNotBeFound("authors.specified=false");
    }

    @Test
    @Transactional
    void getAllArticlesByAuthorsContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where authors contains DEFAULT_AUTHORS
        defaultArticleShouldBeFound("authors.contains=" + DEFAULT_AUTHORS);

        // Get all the articleList where authors contains UPDATED_AUTHORS
        defaultArticleShouldNotBeFound("authors.contains=" + UPDATED_AUTHORS);
    }

    @Test
    @Transactional
    void getAllArticlesByAuthorsNotContainsSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where authors does not contain DEFAULT_AUTHORS
        defaultArticleShouldNotBeFound("authors.doesNotContain=" + DEFAULT_AUTHORS);

        // Get all the articleList where authors does not contain UPDATED_AUTHORS
        defaultArticleShouldBeFound("authors.doesNotContain=" + UPDATED_AUTHORS);
    }

    @Test
    @Transactional
    void getAllArticlesByDateIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where date equals to DEFAULT_DATE
        defaultArticleShouldBeFound("date.equals=" + DEFAULT_DATE);

        // Get all the articleList where date equals to UPDATED_DATE
        defaultArticleShouldNotBeFound("date.equals=" + UPDATED_DATE);
    }

    @Test
    @Transactional
    void getAllArticlesByDateIsNotEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where date not equals to DEFAULT_DATE
        defaultArticleShouldNotBeFound("date.notEquals=" + DEFAULT_DATE);

        // Get all the articleList where date not equals to UPDATED_DATE
        defaultArticleShouldBeFound("date.notEquals=" + UPDATED_DATE);
    }

    @Test
    @Transactional
    void getAllArticlesByDateIsInShouldWork() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where date in DEFAULT_DATE or UPDATED_DATE
        defaultArticleShouldBeFound("date.in=" + DEFAULT_DATE + "," + UPDATED_DATE);

        // Get all the articleList where date equals to UPDATED_DATE
        defaultArticleShouldNotBeFound("date.in=" + UPDATED_DATE);
    }

    @Test
    @Transactional
    void getAllArticlesByDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        // Get all the articleList where date is not null
        defaultArticleShouldBeFound("date.specified=true");

        // Get all the articleList where date is null
        defaultArticleShouldNotBeFound("date.specified=false");
    }

    @Test
    @Transactional
    void getAllArticlesByFlagIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);
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
        article.addFlag(flag);
        articleRepository.saveAndFlush(article);
        Long flagId = flag.getId();

        // Get all the articleList where flag equals to flagId
        defaultArticleShouldBeFound("flagId.equals=" + flagId);

        // Get all the articleList where flag equals to (flagId + 1)
        defaultArticleShouldNotBeFound("flagId.equals=" + (flagId + 1));
    }

    @Test
    @Transactional
    void getAllArticlesBySynonymIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);
        Synonym synonym;
        if (TestUtil.findAll(em, Synonym.class).isEmpty()) {
            synonym = SynonymResourceIT.createEntity(em);
            em.persist(synonym);
            em.flush();
        } else {
            synonym = TestUtil.findAll(em, Synonym.class).get(0);
        }
        em.persist(synonym);
        em.flush();
        article.addSynonym(synonym);
        articleRepository.saveAndFlush(article);
        Long synonymId = synonym.getId();

        // Get all the articleList where synonym equals to synonymId
        defaultArticleShouldBeFound("synonymId.equals=" + synonymId);

        // Get all the articleList where synonym equals to (synonymId + 1)
        defaultArticleShouldNotBeFound("synonymId.equals=" + (synonymId + 1));
    }

    @Test
    @Transactional
    void getAllArticlesByAssociationIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);
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
        article.addAssociation(association);
        articleRepository.saveAndFlush(article);
        Long associationId = association.getId();

        // Get all the articleList where association equals to associationId
        defaultArticleShouldBeFound("associationId.equals=" + associationId);

        // Get all the articleList where association equals to (associationId + 1)
        defaultArticleShouldNotBeFound("associationId.equals=" + (associationId + 1));
    }

    @Test
    @Transactional
    void getAllArticlesByFdaSubmissionIsEqualToSomething() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);
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
        article.addFdaSubmission(fdaSubmission);
        articleRepository.saveAndFlush(article);
        Long fdaSubmissionId = fdaSubmission.getId();

        // Get all the articleList where fdaSubmission equals to fdaSubmissionId
        defaultArticleShouldBeFound("fdaSubmissionId.equals=" + fdaSubmissionId);

        // Get all the articleList where fdaSubmission equals to (fdaSubmissionId + 1)
        defaultArticleShouldNotBeFound("fdaSubmissionId.equals=" + (fdaSubmissionId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultArticleShouldBeFound(String filter) throws Exception {
        restArticleMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(article.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].uid").value(hasItem(DEFAULT_UID)))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE.toString())))
            .andExpect(jsonPath("$.[*].content").value(hasItem(DEFAULT_CONTENT.toString())))
            .andExpect(jsonPath("$.[*].link").value(hasItem(DEFAULT_LINK)))
            .andExpect(jsonPath("$.[*].authors").value(hasItem(DEFAULT_AUTHORS)))
            .andExpect(jsonPath("$.[*].date").value(hasItem(DEFAULT_DATE.toString())));

        // Check, that the count call also returns 1
        restArticleMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultArticleShouldNotBeFound(String filter) throws Exception {
        restArticleMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restArticleMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingArticle() throws Exception {
        // Get the article
        restArticleMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewArticle() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        int databaseSizeBeforeUpdate = articleRepository.findAll().size();

        // Update the article
        Article updatedArticle = articleRepository.findById(article.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedArticle are not directly saved in db
        em.detach(updatedArticle);
        updatedArticle
            .type(UPDATED_TYPE)
            .uid(UPDATED_UID)
            .title(UPDATED_TITLE)
            .content(UPDATED_CONTENT)
            .link(UPDATED_LINK)
            .authors(UPDATED_AUTHORS)
            .date(UPDATED_DATE);

        restArticleMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedArticle.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedArticle))
            )
            .andExpect(status().isOk());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
        Article testArticle = articleList.get(articleList.size() - 1);
        assertThat(testArticle.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testArticle.getUid()).isEqualTo(UPDATED_UID);
        assertThat(testArticle.getTitle()).isEqualTo(UPDATED_TITLE);
        assertThat(testArticle.getContent()).isEqualTo(UPDATED_CONTENT);
        assertThat(testArticle.getLink()).isEqualTo(UPDATED_LINK);
        assertThat(testArticle.getAuthors()).isEqualTo(UPDATED_AUTHORS);
        assertThat(testArticle.getDate()).isEqualTo(UPDATED_DATE);
    }

    @Test
    @Transactional
    void putNonExistingArticle() throws Exception {
        int databaseSizeBeforeUpdate = articleRepository.findAll().size();
        article.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restArticleMockMvc
            .perform(
                put(ENTITY_API_URL_ID, article.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isBadRequest());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchArticle() throws Exception {
        int databaseSizeBeforeUpdate = articleRepository.findAll().size();
        article.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArticleMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isBadRequest());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamArticle() throws Exception {
        int databaseSizeBeforeUpdate = articleRepository.findAll().size();
        article.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArticleMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateArticleWithPatch() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        int databaseSizeBeforeUpdate = articleRepository.findAll().size();

        // Update the article using partial update
        Article partialUpdatedArticle = new Article();
        partialUpdatedArticle.setId(article.getId());

        partialUpdatedArticle.type(UPDATED_TYPE).uid(UPDATED_UID).title(UPDATED_TITLE).authors(UPDATED_AUTHORS);

        restArticleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedArticle.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedArticle))
            )
            .andExpect(status().isOk());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
        Article testArticle = articleList.get(articleList.size() - 1);
        assertThat(testArticle.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testArticle.getUid()).isEqualTo(UPDATED_UID);
        assertThat(testArticle.getTitle()).isEqualTo(UPDATED_TITLE);
        assertThat(testArticle.getContent()).isEqualTo(DEFAULT_CONTENT);
        assertThat(testArticle.getLink()).isEqualTo(DEFAULT_LINK);
        assertThat(testArticle.getAuthors()).isEqualTo(UPDATED_AUTHORS);
        assertThat(testArticle.getDate()).isEqualTo(DEFAULT_DATE);
    }

    @Test
    @Transactional
    void fullUpdateArticleWithPatch() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        int databaseSizeBeforeUpdate = articleRepository.findAll().size();

        // Update the article using partial update
        Article partialUpdatedArticle = new Article();
        partialUpdatedArticle.setId(article.getId());

        partialUpdatedArticle
            .type(UPDATED_TYPE)
            .uid(UPDATED_UID)
            .title(UPDATED_TITLE)
            .content(UPDATED_CONTENT)
            .link(UPDATED_LINK)
            .authors(UPDATED_AUTHORS)
            .date(UPDATED_DATE);

        restArticleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedArticle.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedArticle))
            )
            .andExpect(status().isOk());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
        Article testArticle = articleList.get(articleList.size() - 1);
        assertThat(testArticle.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testArticle.getUid()).isEqualTo(UPDATED_UID);
        assertThat(testArticle.getTitle()).isEqualTo(UPDATED_TITLE);
        assertThat(testArticle.getContent()).isEqualTo(UPDATED_CONTENT);
        assertThat(testArticle.getLink()).isEqualTo(UPDATED_LINK);
        assertThat(testArticle.getAuthors()).isEqualTo(UPDATED_AUTHORS);
        assertThat(testArticle.getDate()).isEqualTo(UPDATED_DATE);
    }

    @Test
    @Transactional
    void patchNonExistingArticle() throws Exception {
        int databaseSizeBeforeUpdate = articleRepository.findAll().size();
        article.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restArticleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, article.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isBadRequest());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchArticle() throws Exception {
        int databaseSizeBeforeUpdate = articleRepository.findAll().size();
        article.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArticleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isBadRequest());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamArticle() throws Exception {
        int databaseSizeBeforeUpdate = articleRepository.findAll().size();
        article.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restArticleMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(article))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Article in the database
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteArticle() throws Exception {
        // Initialize the database
        articleRepository.saveAndFlush(article);

        int databaseSizeBeforeDelete = articleRepository.findAll().size();

        // Delete the article
        restArticleMockMvc
            .perform(delete(ENTITY_API_URL_ID, article.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Article> articleList = articleRepository.findAll();
        assertThat(articleList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
