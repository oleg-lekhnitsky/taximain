// Presentation cleanup only: keep the supplied prices and conditions intact.
export function cleanTariffTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^Действующий тариф\s*/iu, "")
    .replace(/^Amaldagi\s+["«“](.*)["»”]\s+tarifi$/iu, "$1")
    .replace(/^["«“](.*)["»”]$/, "$1");
}
export function cleanTariffBody(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[\u200B\uFEFF]/g, "")
    .replace(/[\u2028\u00A0\u202F]/g, " ")
    .replace(
      /(Минимальная стоимость[^\n]*)\n(?:[\t ]*\n)*[\t ]*(?=\(включено)/giu,
      "$1\n",
    )
    .replace(/\/[\t ]*(?:\n[\t ]*)?(?=(?:км|мин)(?:[^\p{L}]|$))/gu, "/")
    .replace(/\((\d+)\)[\t ]*\)/g, "($1)")
    .replace(/(Первые\s+3\s*(?:\(три\)\s*)?)минут(?=\s)/gu, "$1минуты")
    .replace(/ (?:–|-) /g, " — ")
    .replace(/(\d)(?=сум(?:[^\p{L}]|$))/gu, "$1 ");
}
