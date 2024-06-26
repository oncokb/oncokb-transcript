export const createMutationOnCurationPage = async (mutationName: string) => {
  const mutationNameInput = await $('input#add-mutation-modal-input');
  await mutationNameInput.setValue(mutationName);
  await browser.keys('Enter');

  const addMutationModal = await $('div[id="default-add-mutation-modal"]');
  await addMutationModal.waitForDisplayed();

  const modalConfirmBtn = await $('button=Confirm');
  await modalConfirmBtn.click();

  return { mutationNameInput, addMutationModal, modalConfirmBtn };
};
