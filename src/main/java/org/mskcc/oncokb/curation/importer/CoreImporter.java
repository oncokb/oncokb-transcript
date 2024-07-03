package org.mskcc.oncokb.curation.importer;

import static org.mskcc.oncokb.curation.config.DataVersions.ONCOKB_CORE_VERSION;
import static org.mskcc.oncokb.curation.util.FileUtils.parseDelimitedFile;

import java.io.IOException;
import java.sql.Ref;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jodd.util.StringUtil;
import org.apache.commons.lang3.StringUtils;
import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.mskcc.oncokb.curation.domain.*;
import org.mskcc.oncokb.curation.domain.enumeration.ArticleType;
import org.mskcc.oncokb.curation.domain.enumeration.ReferenceGenome;
import org.mskcc.oncokb.curation.service.*;
import org.mskcc.oncokb.curation.service.dto.pubmed.PubMedDTO;
import org.mskcc.oncokb.curation.service.mapper.PubMedMapper;
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
    final NihEutilsService nihEutilsService;
    final PubMedMapper pubMedMapper;
    final ApplicationProperties applicationProperties;
    final String DATA_DIRECTORY_PATH;
    final String MIXED = "MIXED";

    public CoreImporter(
        CancerTypeService cancerTypeService,
        ArticleService articleService,
        GeneService geneService,
        AlterationService alterationService,
        DrugService drugService,
        NciThesaurusService nciThesaurusService,
        MainService mainService,
        NihEutilsService nihEutilsService,
        PubMedMapper pubMedMapper,
        ApplicationProperties applicationProperties
    ) {
        this.cancerTypeService = cancerTypeService;
        this.articleService = articleService;
        this.geneService = geneService;
        this.alterationService = alterationService;
        this.drugService = drugService;
        this.nciThesaurusService = nciThesaurusService;
        this.mainService = mainService;
        this.nihEutilsService = nihEutilsService;
        this.pubMedMapper = pubMedMapper;
        this.applicationProperties = applicationProperties;

        DATA_DIRECTORY_PATH = applicationProperties.getOncokbDataRepoDir() + "/curation/oncokb/";
    }

    public void generalImport() throws IOException {
        importAlteration();
        verifyGene();
    }

    private String getVersionInFileName() {
        return ONCOKB_CORE_VERSION.replace(".", "_");
    }

    public void importArticle() throws IOException {
        List<List<String>> articleLines = parseDelimitedFile(
            DATA_DIRECTORY_PATH + "article_" + getVersionInFileName() + ".tsv",
            "\t",
            true
        );
        articleLines.forEach(line -> {
            String pmid = line.get(8);
            if (StringUtils.isNotEmpty(pmid)) {
                Optional<Article> articleOptional = articleService.findByPmid(pmid);
                if (articleOptional.isEmpty()) {
                    articleService.fetchAndSavePubMed(pmid);
                }
            } else {
                String content = line.get(1);
                String link = line.get(6);
                if (StringUtil.isNotEmpty(content) && StringUtils.isNotEmpty(link)) {
                    Article article = new Article();
                    article.setType(ArticleType.ABSTRACT);
                    article.setTitle(content);
                    article.setLink(link);
                    articleService.save(article);
                }
            }
        });
    }

    private void importAlteration() throws IOException {
        List<List<String>> alterationLines = parseDelimitedFile(
            DATA_DIRECTORY_PATH + "alteration_" + getVersionInFileName() + ".tsv",
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
            mainService.annotateAlteration(ReferenceGenome.GRCh37, alteration);
            alterationService.save(alteration);
        });
    }

    // Verify the gene hugo symbol is the latest from the cBioPortal genes
    public void verifyGene() throws IOException {
        List<List<String>> geneLines = parseDelimitedFile(DATA_DIRECTORY_PATH + "gene_" + getVersionInFileName() + ".tsv", "\t", true);
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
        List<List<String>> drugLines = parseDelimitedFile(DATA_DIRECTORY_PATH + "drug_" + getVersionInFileName() + ".tsv", "\t", true);
        drugLines.forEach(line -> {
            String name = line.get(2);
            String code = line.get(3);

            Drug drug = new Drug();
            drug.setName(name);
            Optional<NciThesaurus> nciThesaurusOptional = Optional.empty();

            Optional<org.mskcc.oncokb.curation.domain.Drug> drugOptional = Optional.empty();
            if (StringUtils.isEmpty(code)) {
                drugOptional = drugService.findByName(name);
            } else {
                drugOptional = drugService.findByCode(code);
            }

            if (drugOptional.isPresent()) {
                log.info("Drug exists {} {}, skipping", name, code);
                return;
            }

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
            drug.setUuid(UUID.randomUUID().toString());
            drugService.save(drug);
        });
    }
}
