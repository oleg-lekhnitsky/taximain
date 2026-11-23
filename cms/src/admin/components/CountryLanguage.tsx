import { useIntl } from "react-intl";
import { forwardRef, type ReactNode } from "react";
import { useField } from "@strapi/strapi/admin";
import { Field, SingleSelect, SingleSelectOption } from "@strapi/design-system";
import { countryLanguages, languageNames } from "../../content/languages";

type Props = { name?: string; label?: ReactNode; labelAction?: ReactNode; required?: boolean; disabled?: boolean; hint?: ReactNode };

export default forwardRef<HTMLDivElement, Props>(function CountryLanguage(
  { name = "language", label, labelAction, required, disabled, hint }, ref,
) {
  const country = useField<string>("country");
  const { locale } = useIntl();
  const ru = locale.startsWith("ru");
  const field = useField<string>(name);
  const options = countryLanguages[country.value ?? ""] ?? [];
  // Keep an invalid existing value visible so switching country never silently
  // changes the language of an existing translation. Saving requires a valid pair.
  const invalid = field.value && !options.includes(field.value);
  return (
    <Field.Root data-wb-language={field.value} name={name} required={required} error={field.error} hint={hint ?? (ru ? "Выберите один из двух языков, доступных для этой страны." : "Choose one of the two languages supported in this country.")}>
      <Field.Label action={labelAction}>{label}</Field.Label>
      <SingleSelect ref={ref} placeholder={ru ? "Выберите язык" : "Choose a language"} value={field.value ?? ""} disabled={disabled || !options.length} onChange={(value) => field.onChange(name, String(value ?? ""))}>
        {invalid && <SingleSelectOption value={field.value ?? ""} disabled>{languageNames[field.value ?? ""] ?? field.value} — {ru ? "выберите язык для этой страны" : "choose a language for this country"}</SingleSelectOption>}
        {options.map((value) => <SingleSelectOption key={value} value={value}>{languageNames[value]} ({value})</SingleSelectOption>)}
      </SingleSelect>
      <Field.Hint /><Field.Error />
    </Field.Root>
  );
});
