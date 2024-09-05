export type AllFrequencyData = {
  Hugo_Symbol: string;
  Entrez_Gene_Id: string | null;
  HGVSp_Short: string;
  Number: number;
  Percentage: number;
};

export type TypeFrequencyData = {
  CANCER_TYPE: string;
  Hugo_Symbol: string;
  Entrez_Gene_Id?: string;
  HGVSp_Short: string;
  Number: number;
  Percentage: number;
};

export type DetailedFrequencyData = {
  CANCER_TYPE: string;
  CANCER_TYPE_DETAILED: string;
  Hugo_Symbol: string;
  Entrez_Gene_Id: string | null;
  HGVSp_Short: string;
  Number: number;
  Percentage: number;
};
