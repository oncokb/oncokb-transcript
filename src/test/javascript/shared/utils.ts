import { ADD_MUTATION_MODAL_INPUT_ID, DEFAULT_ADD_MUTATION_MODAL_ID } from '../../../main/webapp/app/config/constants/html-id';

export const createMutationOnCurationPage = async (mutationName: string) => {
  const mutationNameInput = await $(`input#${ADD_MUTATION_MODAL_INPUT_ID}`);
  await mutationNameInput.setValue(mutationName);
  await browser.keys('Enter');

  const addMutationModal = await $(`div[id="${DEFAULT_ADD_MUTATION_MODAL_ID}"]`);
  await addMutationModal.waitForDisplayed();

  const modalConfirmBtn = await $('button=Confirm');
  await modalConfirmBtn.click();

  return { mutationNameInput, addMutationModal, modalConfirmBtn };
};
