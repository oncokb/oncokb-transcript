import {
  Drug,
  Gene,
  Implication,
  Mutation,
  MutationEffect,
  Review,
  TI,
  TI_TYPE,
  Treatment,
  Tumor,
} from '../../model/firebase/firebase.model';

export function createMockGene(gene: Partial<Gene> = {}): Gene {
  // coming from firebase the class is not used to create the object so
  // instanceof cannot be used which is why empty object is being used
  return Object.assign({}, new Gene('name'), gene);
}

export function createMockTreatment(treatment: Partial<Treatment> = {}): Treatment {
  // coming from firebase the class is not used to create the object so
  // instanceof cannot be used which is why empty object is being used
  return Object.assign({}, new Treatment('a'), treatment);
}

export function createMockReview(review: Partial<Review> = {}): Review {
  // coming from firebase the class is not used to create the object so
  // instanceof cannot be used which is why empty object is being used
  return Object.assign({}, new Review('SYSTEM'), review);
}

export function createMockTumor(tumor: Partial<Tumor> = {}): Tumor {
  // coming from firebase the class is not used to create the object so
  // instanceof cannot be used which is why empty object is being used
  return Object.assign({}, new Tumor(), tumor);
}

export function createMockImplication(implication: Partial<Implication> = {}): Implication {
  // coming from firebase the class is not used to create the object so
  // instanceof cannot be used which is why empty object is being used
  return Object.assign({}, new Implication(), implication);
}

export function createMockMutationEffect(mutationEffect: Partial<MutationEffect> = {}): MutationEffect {
  // coming from firebase the class is not used to create the object so
  // instanceof cannot be used which is why empty object is being used
  return Object.assign({}, new MutationEffect(), mutationEffect);
}

export function createMockMutation(mutation: Partial<Mutation> = {}): Mutation {
  // coming from firebase the class is not used to create the object so
  // instanceof cannot be used which is why empty object is being used
  return Object.assign({}, new Mutation('mutation'), mutation);
}

export function createMockDrug(drug: Partial<Drug>) {
  // coming from firebase the class is not used to create the object so
  // instanceof cannot be used which is why empty object is being used
  return Object.assign({}, new Drug('drug', 'ncitCode', 'ncitName', 1, []), drug);
}

export function createMockTi(ti: Partial<TI> = {}): TI {
  // coming from firebase the class is not used to create the object so
  // instanceof cannot be used which is why empty object is being used
  return Object.assign({}, new TI(TI_TYPE.IR), ti);
}
