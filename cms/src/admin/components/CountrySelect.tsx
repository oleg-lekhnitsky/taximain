import { useIntl } from "react-intl";
import { forwardRef, type ReactNode } from "react";
import { useField } from "@strapi/strapi/admin";
import { Field, SingleSelect, SingleSelectOption } from "@strapi/design-system";
import { countryLanguages } from "../../content/languages";

type Props = { name?: string; label?: ReactNode; labelAction?: ReactNode; required?: boolean; disabled?: boolean; hint?: ReactNode };

export default forwardRef<HTMLDivElement, Props>(function CountrySelect(
  { name = "country", label, labelAction, required, disabled, hint }, ref,
) {
  const { locale } = useIntl();
  const ru = locale.startsWith("ru");
  const field = useField<string>(name);
  return (
    <Field.Root data-wb-country={field.value} name={name} required={required} error={field.error} hint={hint}>
      <Field.Label action={labelAction}>{label}</Field.Label>
      <SingleSelect ref={ref} placeholder={ru ? "Выберите страну" : "Choose a country"} value={field.value ?? ""} disabled={disabled} onChange={(value) => field.onChange(name, String(value ?? ""))}>
        {Object.keys(countryLanguages).map((value) => <SingleSelectOption key={value} value={value}>{value}</SingleSelectOption>)}
      </SingleSelect>
      <Field.Hint /><Field.Error />
    </Field.Root>
  );
});
