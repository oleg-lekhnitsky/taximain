"use client";

import { useCopy } from "./useCopy";
import Image from "next/image";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@ui-sdk/react/popover";
import { Listbox, ListboxItem } from "@ui-sdk/react/listbox";
import {
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlIndicator,
} from "@ui-sdk/react/segmented-control";
import {
  countryLanguages,
  languages,
  isCountryLanguage,
} from "@/lib/languages";
import { countries, isCountryCode, type CountryCode } from "@/lib/countries";
import { useCountry } from "./CountryProvider";
import styles from "./CountrySwitcher.module.scss";

function CountryFlag({ code }: { code: CountryCode }) {
  return (
    <span className={styles.flag} aria-hidden="true">
      {code === "by" ? (
        <span className={styles.belarus}>
          <Image
            src="/assets/countries/by.svg"
            alt=""
            width={26.9454}
            height={31.4688}
          />
        </span>
      ) : (
        <Image
          src={`/assets/countries/${code}.svg`}
          alt=""
          width={26.667}
          height={26.667}
        />
      )}
    </span>
  );
}

export default function CountrySwitcher() {
  const copy = useCopy();
  const { country, language, selectCountry, selectLanguage } = useCountry();
  const [view, setView] = useState<"country" | "language">("country");
  return (
    <Popover>
      <PopoverTrigger
        data-country-selector
        className={styles.trigger}
        aria-label={`${copy.version}: ${country.name}, ${languages[language].name}`}
      >
        <span className={styles.flagContainer}>
          <CountryFlag code={country.code} />
        </span>
        <span className={styles.languageCode} aria-hidden="true">
          {language.toUpperCase()}
        </span>
        <Image
          src="/assets/countries/chevron.svg"
          alt=""
          width={26.667}
          height={26.667}
          className={styles.chevron}
        />
      </PopoverTrigger>
      <PopoverContent
        className={styles.content}
        aria-label={copy.picker[2]}
        align="end"
        sideOffset={8}
        collisionPadding={12}
      >
        <SegmentedControl
          className={styles.segments}
          aria-label={copy.picker[2]}
          value={view}
          onValueChange={(value) => {
            if (value === "country" || value === "language") setView(value);
          }}
        >
          <SegmentedControlIndicator className={styles.segmentIndicator} />
          <SegmentedControlItem className={styles.segment} value="country">
            {copy.picker[0]}
          </SegmentedControlItem>
          <SegmentedControlItem className={styles.segment} value="language">
            {copy.picker[1]}
          </SegmentedControlItem>
        </SegmentedControl>
        {view === "country" ? (
          <Listbox
            key="country"
            className={styles.options}
            aria-label={copy.picker[0]}
            value={country.code}
            onValueChange={(value) => {
              if (isCountryCode(value)) selectCountry(value);
            }}
          >
            {countries.map((option) => (
              <ListboxItem
                key={option.code}
                value={option.code}
                className={styles.option}
              >
                <CountryFlag code={option.code} />
                <span lang={option.language}>{option.name}</span>
              </ListboxItem>
            ))}
          </Listbox>
        ) : (
          <Listbox
            key={`language-${country.code}`}
            className={styles.options}
            aria-label={copy.picker[1]}
            value={language}
            onValueChange={(value) => {
              if (isCountryLanguage(country.code, value)) selectLanguage(value);
            }}
          >
            {countryLanguages[country.code].map((code) => (
              <ListboxItem key={code} value={code} className={styles.option}>
                <span lang={code}>{languages[code].name}</span>
              </ListboxItem>
            ))}
          </Listbox>
        )}
      </PopoverContent>
    </Popover>
  );
}
