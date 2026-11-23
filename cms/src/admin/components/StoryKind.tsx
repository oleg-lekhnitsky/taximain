import { forwardRef, type ReactNode } from "react";
import { useField } from "@strapi/strapi/admin";
import { useIntl } from "react-intl";
import { Field, SingleSelect, SingleSelectOption } from "@strapi/design-system";
type Props = { name?: string; label?: ReactNode; required?: boolean; disabled?: boolean };
export default forwardRef<HTMLDivElement, Props>(function StoryKind({ name = "contentKind", label, required, disabled }, ref) {
  const field = useField<string>(name);
  const ru = useIntl().locale.startsWith("ru");
  return <Field.Root name={name} required={required} error={field.error} data-wb-story-kind={field.value ?? "card"} hint={ru ? "Карточка без статьи, полная статья или ссылка на другую страницу." : "Choose a card, full article, or link to another page."}>
    <Field.Label>{label}</Field.Label>
    <SingleSelect ref={ref} value={field.value ?? "card"} disabled={disabled} onChange={value => field.onChange(name, String(value))}>
      <SingleSelectOption value="card">{ru ? "Только карточка" : "Card only"}</SingleSelectOption>
      <SingleSelectOption value="article">{ru ? "Полная статья" : "Full article"}</SingleSelectOption>
      <SingleSelectOption value="link">{ru ? "Карточка со ссылкой" : "Card with link"}</SingleSelectOption>
    </SingleSelect><Field.Hint /><Field.Error />
  </Field.Root>;
});
