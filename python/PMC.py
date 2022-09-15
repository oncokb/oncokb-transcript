import urllib.request, requests, json
import xml.etree.ElementTree as ET
import sys

# https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=kras
# ftp://ftp.ncbi.nlm.nih.gov/pub/pmc/oa_pdf/8e/71/WJR-9-27.PMC5334499.pdf

term = ""


def download(id):
    if (id[0:3].upper() == 'PMC'):
        id = id[3:]
    res = requests.get(url=f'https://www.ncbi.nlm.nih.gov/pmc/utils/oa/oa.fcgi?id=PMC{id}', timeout=8)
    str = res.content.decode('utf-8')
    print(str)
    start = str.lower().find("ftp://")
    end = str.lower().find(".tar.gz") + 7
    ftpurl1 = str[start:end]
    print(ftpurl1)
    try:
        with urllib.request.urlopen(ftpurl1, timeout=8) as url:
            data = url.read()
            f = open(f'{id}.tar.gz', 'wb')
            f.write(data)
            f.close()
            # https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3951336/pdf/nihms555682.pdf
    # /pmc/articles/PMC3087888/pdf/ukmss-34235.pdf
    except Exception as error:
        print("Exception occured downloading .tar.gz file, check PDF files too, article may not be open access.")
        urlitem = ""
        with urllib.request.urlopen(f"https://www.ncbi.nlm.nih.gov/pmc/?term={id}") as url2:
            for line in url2:
                line = line.decode('utf-8')
                if line.find(f'/pmc/articles/PMC{id}/pdf/') >= 0:
                    urlitem = line[line.find(f"/pmc/articles/PMC{id}/pdf/"):line.find(".pdf", line.find(
                        f"/pmc/articles/PMC{id}/pdf/")) + 4].strip()
                    print("Found item ", urlitem)
                    break
            print(f"https://www.ncbi.nlm.nih.gov{urlitem}")
            req = urllib.request.Request(
                f"https://www.ncbi.nlm.nih.gov{urlitem}",
                data=None,
                headers={
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36'
                }
            )
            if urlitem != "":
                with urllib.request.urlopen(req) as url3:
                    data = url3.read()
                    f = open(f'PMC{id}.pdf', 'wb')
                    f.write(data)
                    f.close()
    str = str[end:]
    start = str.lower().find("ftp://")
    end = str.lower().find(".pdf") + 4
    ftpurl2 = str[start:end]
    # if end == 3:
    #  continue
    print(ftpurl2)
    try:
        with urllib.request.urlopen(ftpurl2, timeout=8) as url:
            data = url.read()
            f = open(f'{id}.pdf', 'wb')
            f.write(data)
            f.close()
    except Exception as error:
        print("Exception occured downloading PDF file, .tar.gz may still be available")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Too few arguments passed, need the search term")
        quit()
    else:
        pmcid = sys.argv[1]
        download(pmcid)
        quit()


def get_pub_ids(query):
    esc = urllib.parse.quote_plus(query)
    res = requests.get(
        url=f'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term={esc}&retmax=10000&sort=relevance')
    return [f.text for f in ET.fromstring(res.content).find('IdList')]


term = "kras"

ids = get_pub_ids(term)

# for id in ids:
#  print(int(id))


for i in range(0, len(ids)):
    download(ids[i])

# with urllib.request.urlopen("https://www.ncbi.nlm.nih.gov/pmc/utils/oa/oa.fcgi?id=PMC5334499", timeout=5) as url:
#  print(url.read())
# quit()

# with urllib.request.urlopen("ftp://ftp.ncbi.nlm.nih.gov/pub/pmc/oa_pdf/8e/71/WJR-9-27.PMC5334499.pdf", timeout=5) as url:
#  img = url.read()
#  f = open("demo.pdf", "wb")
#  f.write(img)
#  f.close()
