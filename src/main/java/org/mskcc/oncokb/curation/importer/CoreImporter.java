package org.mskcc.oncokb.curation.importer;

import static org.mskcc.oncokb.curation.config.DataVersions.ONCOKB_CORE_VERSION;
import static org.mskcc.oncokb.curation.util.FileUtils.parseDelimitedFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import jodd.util.StringUtil;
import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.mskcc.oncokb.curation.domain.*;
import org.mskcc.oncokb.curation.domain.enumeration.ArticleType;
import org.mskcc.oncokb.curation.service.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class CoreImporter {

    private final Logger log = LoggerFactory.getLogger(CoreImporter.class);
    final CancerTypeService cancerTypeService;
    final ArticleService articleService;
    final GeneService geneService;
    final AlterationService alterationService;
    final DrugService drugService;
    final NciThesaurusService nciThesaurusService;
    final MainService mainService;
    final ApplicationProperties applicationProperties;
    final String DATA_DIRECTORY;
    final String MIXED = "MIXED";

    public CoreImporter(
        CancerTypeService cancerTypeService,
        ArticleService articleService,
        GeneService geneService,
        AlterationService alterationService,
        DrugService drugService,
        NciThesaurusService nciThesaurusService,
        MainService mainService,
        ApplicationProperties applicationProperties
    ) {
        this.cancerTypeService = cancerTypeService;
        this.articleService = articleService;
        this.geneService = geneService;
        this.alterationService = alterationService;
        this.drugService = drugService;
        this.nciThesaurusService = nciThesaurusService;
        this.mainService = mainService;
        this.applicationProperties = applicationProperties;

        DATA_DIRECTORY = applicationProperties.getOncokbDataRepoPath() + "/curation/oncokb/";
    }

    public void generalImport() throws IOException {
        importArticle();
        importAlteration();
        verifyGene();
    }

    private String getVersionInFileName() {
        return ONCOKB_CORE_VERSION.replace(".", "_");
    }

    private void importArticle() throws IOException {
        List<List<String>> articleLines = parseDelimitedFile(DATA_DIRECTORY + "article_" + getVersionInFileName() + ".tsv", "\t", true);
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

    private void importAlteration() throws IOException {
        List<List<String>> alterationLines = parseDelimitedFile(
            DATA_DIRECTORY + "alteration_" + getVersionInFileName() + ".tsv",
            "\t",
            true
        );
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

    // Verify the gene hugo symbol is the latest from the cBioPortal genes
    public void verifyGene() throws IOException {
        List<List<String>> geneLines = parseDelimitedFile(DATA_DIRECTORY + "gene_" + getVersionInFileName() + ".tsv", "\t", true);
        geneLines.forEach(line -> {
            Optional<Gene> geneOptional = geneService.findGeneByEntrezGeneId(Integer.parseInt(line.get(0)));
            if (geneOptional.isEmpty()) {
                log.error("Gene cannot be found {} {} ", line.get(0));
                return;
            }
            String oncokbHugo = line.get(6);
            if (StringUtil.isEmpty(oncokbHugo)) {
                log.error("Line does not have hugo symbol {}", line);
            } else {
                if (!oncokbHugo.equals(geneOptional.get().getHugoSymbol())) {
                    log.error("Hugo Symbol does not match oncokb: {}, cbioportal: {}", oncokbHugo, geneOptional.get().getHugoSymbol());
                }
            }
        });
    }

    public void importDrug() throws IOException {
        List<List<String>> drugLines = parseDelimitedFile(DATA_DIRECTORY + "drug_" + getVersionInFileName() + ".tsv", "\t", true);
        drugLines.forEach(line -> {
            String name = line.get(2);
            String code = line.get(3);

            Drug drug = new Drug();
            drug.setName(name);
            Optional<NciThesaurus> nciThesaurusOptional = Optional.empty();
            if (StringUtil.isEmpty(code)) {
                log.warn("The drug does not have a code {}, will look for the name", name);
                nciThesaurusOptional = nciThesaurusService.findOneByNamePriority(name);
            } else {
                nciThesaurusOptional = nciThesaurusService.findByCode(code);
            }
            if (nciThesaurusOptional.isPresent()) {
                drug.setNciThesaurus(nciThesaurusOptional.get());
            } else {
                log.warn("The code cannot be found {}", code);
            }
            drugService.save(drug);
        });
    }
}
