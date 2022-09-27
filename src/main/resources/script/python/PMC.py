import urllib.request, requests
import sys
import xml.etree.ElementTree as ET
from bs4 import BeautifulSoup
import re

# TODO: The code is subjected to further review/refactoring. It comes from AI/ML team, developed by Luke  Czapla.

# https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=kras
# ftp://ftp.ncbi.nlm.nih.gov/pub/pmc/oa_pdf/8e/71/WJR-9-27.PMC5334499.pdf

term = ""

def parse_xml(xml_file, pmid, file_path):
    with urllib.request.urlopen(xml_file) as file:
        # create element tree object
        tree = ET.parse(file)

        # get root element
        root = tree.getroot()

        got_file = False
        # get the list of links available for the PMC
        links = root.findall("./records/record/link")
        if len(links) > 0:
            for item in links:
                link = item.get('href')
                if link is not None:
                    file_type = item.get('format')
                    file_extension = None
                    if file_type == 'tgz':
                        file_extension = 'tar.gz'
                    elif file_type == 'pdf':
                        file_extension = 'pdf'
                    if file_extension is not None:
                        with urllib.request.urlopen(link, timeout=8) as url:
                            data = url.read()
                            f = open(f'{file_path}/{pmid}.{file_extension}', 'wb')
                            f.write(data)
                            f.close()
                        got_file = True
        return got_file

def download(id, file_path='./'):
    if (id[0:3].upper() == 'PMC'):
        id = id[3:]
    got_pdf = parse_xml(f'https://www.ncbi.nlm.nih.gov/pmc/utils/oa/oa.fcgi?id=PMC{id}', id, file_path)

    if got_pdf is False:
        print("No PDF found through PubMed Central. Now parsing NCBI page to get the PDF link")
        url = f"https://www.ncbi.nlm.nih.gov/pmc/?term={id}"
        print(url)
        with urllib.request.urlopen(url) as url2:
            for line in url2:
                line = line.decode('utf-8')

                if line.find(f'/pmc/articles/PMC{id}/pdf/') >= 0:
                    soup = BeautifulSoup(line, 'html.parser')
                    result = soup.findAll(href=re.compile(r'pdf.*\.pdf'))
                    for match in result:
                        url_href = match['href']
                        url = f"https://www.ncbi.nlm.nih.gov{url_href}"
                        if url != "":
                            header_with_user_agent = {
                                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36'
                            }
                            head_response = requests.head(url, headers=header_with_user_agent)
                            if head_response is not None and head_response.headers['content-type'] == 'application/pdf':
                                with requests.get(url, headers=header_with_user_agent) as res:
                                    data = res.content
                                    f = open(f'{file_path}/PMC{id}.pdf', 'wb')
                                    f.write(data)
                                    f.close()
                                    got_pdf = True

        if got_pdf == False:
            print(f'No PDF found for PMC {id}')


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Too few arguments passed, need the search term")
        quit()
    else:
        pmcid = sys.argv[1]
        file_path = sys.argv[2]
        download(pmcid, file_path)
        quit()
