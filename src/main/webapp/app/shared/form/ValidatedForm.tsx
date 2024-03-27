import React, { useEffect } from 'react';
import { DefaultValues, FieldValues, FormProvider, SubmitHandler, useForm, useFormContext, ValidationMode } from 'react-hook-form';
import { Form } from 'reactstrap';

interface IValidatedFormProps {
  onSubmit: SubmitHandler<FieldValues>;
  defaultValues?: DefaultValues<FieldValues>;
  mode?: keyof ValidationMode;
}

export const ValidatedForm: React.FunctionComponent<IValidatedFormProps> = ({ children, onSubmit, defaultValues, mode, ...rest }) => {
  const useFormMethods = useForm({ mode: mode || 'onTouched', defaultValues });
  const { handleSubmit, reset } = useFormMethods;

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  return (
    <FormProvider {...useFormMethods}>
      <Form onSubmit={handleSubmit(onSubmit)} {...rest}>
        {children}
      </Form>
    </FormProvider>
  );
};

export default ValidatedForm;
