import { ADD_MUTATION_MODAL_INPUT_ID, DEFAULT_ADD_MUTATION_MODAL_ID } from '../../../main/webapp/app/config/constants/html-id';

export const addMutationInAddMutationModal = async (mutationName: string) => {
  const mutationNameInput = await $(`input#${ADD_MUTATION_MODAL_INPUT_ID}`);
  await mutationNameInput.setValue(mutationName);
  await browser.keys('Enter');

  const addMutationModal = await $(`div[id="${DEFAULT_ADD_MUTATION_MODAL_ID}"]`);
  await addMutationModal.waitForDisplayed();
};

export const createMutationOnCurationPage = async (mutationName: string) => {
  await addMutationInAddMutationModal(mutationName);

  const modalConfirmBtn = await $('button=Confirm');
  await modalConfirmBtn.click();
};
