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

const getDisplayedRichTextEditor = async (selector: string) => {
  await browser.waitUntil(
    async () => {
      const editors = await $$(selector);
      for (const editor of editors) {
        if (await editor.isDisplayed()) {
          return true;
        }
      }
      return false;
    },
    {
      timeout: 10000,
      timeoutMsg: `element ("${selector}") still not displayed after 10000ms`,
    },
  );

  const editors = await $$(selector);
  for (const editor of editors) {
    if (await editor.isDisplayed()) {
      return editor;
    }
  }

  throw new Error(`element ("${selector}") still not displayed after 10000ms`);
};

export const getRichTextEditor = async (id: string) => {
  return getDisplayedRichTextEditor(`div[id='${id}'] [contenteditable='true'], div[id='${id}'][contenteditable='true']`);
};

export const getRichTextEditorBySuffix = async (suffix: string) => {
  return getDisplayedRichTextEditor(`div[id$='${suffix}'] [contenteditable='true'], div[id$='${suffix}'][contenteditable='true']`);
};
