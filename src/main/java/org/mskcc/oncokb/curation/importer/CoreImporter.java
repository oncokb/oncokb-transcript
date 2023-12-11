package org.mskcc.oncokb.curation.importer;

import static org.mskcc.oncokb.curation.util.CancerTypeUtils.getTumorForm;
import static org.mskcc.oncokb.curation.util.FileUtils.parseDelimitedFile;

import java.io.*;
import java.util.*;
import jodd.util.StringUtil;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.Article;
import org.mskcc.oncokb.curation.domain.Gene;
import org.mskcc.oncokb.curation.domain.enumeration.ArticleType;
import org.mskcc.oncokb.curation.service.*;
import org.mskcc.oncokb.curation.service.criteria.ArticleCriteria;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import tech.jhipster.service.filter.StringFilter;

@Component
public class CoreImporter {

    private final Logger log = LoggerFactory.getLogger(CoreImporter.class);
    final CancerTypeService cancerTypeService;
    final ArticleService articleService;
    final GeneService geneService;
    final AlterationService alterationService;
    final MainService mainService;
    final String DATA_DIRECTORY = "/Users/zhangh2/origin-repos/oncokb-data/curation/oncokb/";
    final String MIXED = "MIXED";

    public CoreImporter(
        CancerTypeService cancerTypeService,
        ArticleService articleService,
        GeneService geneService,
        AlterationService alterationService,
        MainService mainService
    ) {
        this.cancerTypeService = cancerTypeService;
        this.articleService = articleService;
        this.geneService = geneService;
        this.alterationService = alterationService;
        this.mainService = mainService;
    }

    public void generalImport() throws FileNotFoundException {
        //        importArticle();
        importAlteration();
    }

    private void importArticle() {
        List<List<String>> articleLines = parseDelimitedFile(DATA_DIRECTORY + "article_v4_11.tsv", "\t", true);
        articleLines.forEach(line -> {
            Article article = new Article();
            ArticleType articleType = ArticleType.PMID;
            if (StringUtil.isNotEmpty(line.get(1))) {
                articleType = ArticleType.ABSTRACT;
            }
            article.setType(articleType);
            article.setContent(line.get(1));
            article.setAuthors(line.get(2));
            article.setElocationId(line.get(3));
            article.setIssue(line.get(4));
            article.setJournal(line.get(5));
            article.setLink(line.get(6));
            article.setPages(line.get(7));
            article.setPmid(line.get(8));
            article.setPubDate(line.get(9));
            article.setTitle(line.get(10));
            article.volume(line.get(12));
            if (StringUtil.isNotEmpty(article.getPmid())) {
                Optional<Article> articleOptional = articleService.findByPmid(article.getPmid());
                if (articleOptional.isPresent()) {
                    return;
                }
            }
            if (StringUtil.isNotEmpty(article.getContent())) {
                Optional<Article> articleOptional = articleService.findByContent(article.getContent());
                if (articleOptional.isPresent()) {
                    return;
                }
            }
            if (StringUtil.isNotEmpty(article.getLink())) {
                Optional<Article> articleOptional = articleService.findByLink(article.getLink());
                if (articleOptional.isPresent()) {
                    return;
                }
            }
            articleService.save(article);
        });
    }

    private void importAlteration() {
        List<List<String>> alterationLines = parseDelimitedFile(DATA_DIRECTORY + "alteration_v4_11.tsv", "\t", true);
        alterationLines.forEach(line -> {
            Optional<Gene> geneOptional = geneService.findGeneByEntrezGeneId(Integer.parseInt(line.get(0)));
            if (geneOptional.isEmpty()) {
                log.error("Gene cannot be found {}", line.get(0));
                return;
            }
            Alteration alteration = new Alteration();
            alteration.setName(line.get(2));
            alteration.setAlteration(line.get(3));
            alteration.setGenes(Collections.singleton(geneOptional.get()));
            mainService.annotateAlteration(alteration);
            alterationService.save(alteration);
        });
    }
}
