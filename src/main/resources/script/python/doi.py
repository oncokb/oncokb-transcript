import urllib.parse, requests, json
from bs4 import BeautifulSoup
import sys

# https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=kras
# ftp://ftp.ncbi.nlm.nih.gov/pub/pmc/oa_pdf/8e/71/WJR-9-27.PMC5334499.pdf

term = ""


def download(doiurl, fileName="demo1.pdf"):
    r = requests.get(doiurl)
    realurl = r.url
    print(realurl)
    realhost = urllib.parse.urlparse(realurl)
    base = realhost.scheme + '://' + realhost.netloc
    print(base)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36'}
    # q = requests.get(realurl, headers=headers)
    # text = q.text
    # print(text)
    s = requests.Session()
    r = s.get(realurl, headers=headers)
    # print(r.content)
    # print(r.text)
    text = r.text
    # text2 = r.text[text.index('.pdf"')+4:]
    text = text[:text.index('.pdf"') + 4]
    text = text[text.rindex('"') + 1:]
    # text2 = text2[:text2.index('.pdf"')+4]
    # text2 = text2[text.rindex('"')+1:]
    if (text[0] == '/'):
        text = base + text
    # if (text2[0] == '/'):
    #  text2 = base + text2
    print(text)
    r = s.get(text, headers=headers)
    print(r.status_code, r.reason)
    print(r.headers)
    file_bytes = r.content  # here's the PDF
    f = open(fileName, 'wb')
    f.write(file_bytes)
    f.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(
            "Too few arguments passed, need the doi URL (e.g.: 'https://www.doi.org/10.1158/0008-5472.can-03-2340') and optionally the fileName")
        quit()
    else:
        doi = sys.argv[1]
        fileName = "demo1.pdf"
        if len(sys.argv) > 2:
            fileName = sys.argv[2]
        download(doi, fileName)
        quit()
